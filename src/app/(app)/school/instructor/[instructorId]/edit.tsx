import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthDateOfBirthField } from "@/components/auth";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchSchoolInstructor,
  updateSchoolInstructor,
} from "@/lib/api";
import { isValidEmail } from "@/lib/auth/validation";
import { instructorUserToRosterItem } from "@/lib/school/map-api";
import { uploadInstructorPhoto } from "@/lib/school/upload-instructor-photo";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

type SelectedPhoto = {
  uri: string;
  fileName: string;
  mimeType: string | null;
  size: number | null;
};

function dateInputValue(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export default function EditInstructorScreen() {
  const router = useRouter();
  const { instructorId } = useLocalSearchParams<{ instructorId?: string }>();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const rosterInstructor = useSchoolOperationsStore((state) =>
    state.instructors.find((item) => item.id === instructorId),
  );
  const upsertInstructor = useSchoolOperationsStore(
    (state) => state.upsertInstructor,
  );
  const [firstName, setFirstName] = useState(rosterInstructor?.firstName ?? "");
  const [lastName, setLastName] = useState(rosterInstructor?.lastName ?? "");
  const [email, setEmail] = useState(rosterInstructor?.email ?? "");
  const [phone, setPhone] = useState(rosterInstructor?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(
    rosterInstructor?.profilePhoto ?? null,
  );
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [loading, setLoading] = useState(Boolean(instructorId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instructorId) return;

    let active = true;
    fetchSchoolInstructor(instructorId)
      .then((instructor) => {
        if (!active) return;
        setFirstName(instructor.firstName);
        setLastName(instructor.lastName);
        setEmail(instructor.email);
        setPhone(instructor.phone);
        setDateOfBirth(dateInputValue(instructor.dateOfBirth));
        setCurrentPhotoUrl(instructor.profilePhoto ?? null);
      })
      .catch((caught: ApiError) => {
        if (!active) return;
        setError(caught.message || "We could not load this instructor.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [instructorId]);

  const canSave = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      isValidEmail(email) &&
      phone.trim().length >= 10 &&
      Boolean(dateOfBirth),
    [dateOfBirth, email, firstName, lastName, phone],
  );

  const choosePhoto = async (source: "camera" | "library") => {
    setError(null);
    try {
      const result =
        source === "camera"
          ? await (async () => {
              const permission =
                await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                throw new Error(
                  "Camera access is required to take a passport photograph.",
                );
              }
              return ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
            })()
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

      if (result.canceled) return;
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? "instructor-photo.jpg",
        mimeType: asset.mimeType ?? null,
        size: asset.fileSize ?? null,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not open the photo picker.",
      );
    }
  };

  const save = async () => {
    if (!instructorId || !canSave || saving) return;
    setError(null);
    setSaving(true);

    try {
      let updated = await updateSchoolInstructor(instructorId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
      });

      if (photo) {
        updated = await uploadInstructorPhoto({
          instructorId,
          ...photo,
        });
      }

      upsertInstructor(instructorUserToRosterItem(updated));
      showToast("Instructor changes saved.");
      router.back();
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not save this instructor.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!instructorId || (!rosterInstructor && !loading && error)) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Edit instructor" />
        <View className="mt-8">
          <ContentEmptyState
            icon="account-question-outline"
            title="Instructor unavailable"
            description={error ?? "This instructor is not on the school roster."}
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Edit instructor" />

      {loading ? (
        <View className="mt-12 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <View className="mt-8">
            <SectionHeader title="Passport photograph" />
            <View
              className="mt-4 flex-row items-center gap-4 rounded-3xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View
                className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                {photo?.uri || currentPhotoUrl ? (
                  <Image
                    source={{ uri: photo?.uri ?? currentPhotoUrl ?? "" }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={38}
                    color={colors.textSubtle}
                  />
                )}
              </View>

              <View className="flex-1 gap-2">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void choosePhoto("library")}
                  className="h-11 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: borderRadius.button,
                  }}
                >
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={17}
                    color={colors.onPrimary}
                  />
                  <Text
                    className="text-[12px]"
                    style={{
                      color: colors.onPrimary,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    Change photo
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void choosePhoto("camera")}
                  className="h-11 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
                  style={{
                    backgroundColor: colors.surfaceStrong,
                    borderRadius: borderRadius.button,
                  }}
                >
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={17}
                    color={colors.text}
                  />
                  <Text
                    className="text-[12px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    Take photo
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <SectionHeader title="Instructor details" />
            <View className="mt-4 gap-5">
              {[
                {
                  label: "First name",
                  value: firstName,
                  onChangeText: setFirstName,
                  keyboardType: "default" as const,
                  autoCapitalize: "words" as const,
                },
                {
                  label: "Last name",
                  value: lastName,
                  onChangeText: setLastName,
                  keyboardType: "default" as const,
                  autoCapitalize: "words" as const,
                },
                {
                  label: "Email",
                  value: email,
                  onChangeText: setEmail,
                  keyboardType: "email-address" as const,
                  autoCapitalize: "none" as const,
                },
                {
                  label: "Phone",
                  value: phone,
                  onChangeText: setPhone,
                  keyboardType: "phone-pad" as const,
                  autoCapitalize: "none" as const,
                },
              ].map((field) => (
                <View key={field.label}>
                  <Text
                    className="mb-2 text-[11px] uppercase tracking-[1.2px]"
                    style={{
                      color: colors.textSubtle,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {field.label}
                  </Text>
                  <TextInput
                    accessibilityLabel={field.label}
                    value={field.value}
                    onChangeText={field.onChangeText}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    className="h-14 rounded-2xl border px-4 text-[15px]"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  />
                </View>
              ))}

              <AuthDateOfBirthField
                value={dateOfBirth}
                onChange={setDateOfBirth}
              />
            </View>
          </View>

          {error ? (
            <Text
              className="mt-5 text-center text-[12px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave || saving }}
            disabled={!canSave || saving}
            onPress={() => void save()}
            className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor:
                canSave && !saving ? colors.primary : colors.surfaceStrong,
              borderRadius: borderRadius.button,
            }}
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={20}
                  color={canSave ? colors.onPrimary : colors.textSubtle}
                />
                <Text
                  className="text-[15px]"
                  style={{
                    color: canSave ? colors.onPrimary : colors.textSubtle,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Save changes
                </Text>
              </>
            )}
          </Pressable>
        </>
      )}
    </DashboardScreen>
  );
}
