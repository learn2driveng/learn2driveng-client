import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthDateOfBirthField } from "@/components/auth";
import { useToast } from "@/components/common/toast";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { createSchoolInstructor } from "@/lib/api";
import { instructorUserToRosterItem } from "@/lib/school/map-api";
import { uploadInstructorPhoto } from "@/lib/school/upload-instructor-photo";
import { isValidEmail } from "@/lib/auth/validation";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export default function InviteInstructorScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const upsertInstructor = useSchoolOperationsStore(
    (state) => state.upsertInstructor,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [confirmTemporaryPassword, setConfirmTemporaryPassword] = useState("");
  const [photo, setPhoto] = useState<{
    uri: string;
    fileName: string;
    mimeType: string | null;
    size: number | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { firstName, lastName } = splitName(name);
  const canSendInvite = useMemo(
    () =>
      firstName.length >= 2 &&
      lastName.length >= 2 &&
      isValidEmail(email) &&
      phone.trim().length >= 10 &&
      Boolean(dateOfBirth) &&
      temporaryPassword.length >= 8 &&
      temporaryPassword === confirmTemporaryPassword,
    [
      confirmTemporaryPassword,
      dateOfBirth,
      email,
      firstName.length,
      lastName.length,
      phone,
      temporaryPassword,
    ],
  );

  const sendInvite = async () => {
    if (!canSendInvite || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      let instructor = await createSchoolInstructor({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        temporaryPassword,
        confirmTemporaryPassword,
      });
      if (photo) {
        instructor = await uploadInstructorPhoto({
          instructorId: instructor.id,
          uri: photo.uri,
          fileName: photo.fileName,
          mimeType: photo.mimeType,
          size: photo.size,
        });
      }
      upsertInstructor(instructorUserToRosterItem(instructor));
      showToast("Instructor invite created successfully.");
      router.replace("/school/instructors");
    } catch (caught) {
      const error = caught as ApiError;
      setSubmitError(error.message || "We could not invite this instructor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const choosePhoto = async (source: "camera" | "library") => {
    const result =
      source === "camera"
        ? await (async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              throw new Error("Camera access is required to take a passport photograph.");
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
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Invite instructor" />
      <Text
        className="mt-5 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Create an instructor account for your school. They receive a verification
        email and can sign in with the temporary password you set here.
      </Text>

      <View className="mt-7 gap-5">
        <View>
          <Text
            className="mb-2 text-[11px] uppercase tracking-[1.4px]"
            style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
          >
            Passport photograph
          </Text>
          <View
            className="flex-row items-center gap-4 rounded-3xl border p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: colors.surfaceStrong }}>
              {photo ? (
                <Image source={{ uri: photo.uri }} className="h-full w-full" resizeMode="cover" />
              ) : (
                <MaterialCommunityIcons name="account-outline" size={33} color={colors.textSubtle} />
              )}
            </View>
            <View className="flex-1 gap-2">
              <Pressable
                accessibilityRole="button"
                onPress={() => void choosePhoto("library")}
                className="h-10 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <MaterialCommunityIcons name="image-plus" size={17} color={colors.onPrimary} />
                <Text className="text-[12px]" style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>
                  {photo ? "Change photo" : "Choose photo"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => void choosePhoto("camera")}
                className="h-10 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons name="camera-outline" size={17} color={colors.text} />
                <Text className="text-[12px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>
                  Take photo
                </Text>
              </Pressable>
            </View>
          </View>
          <Text className="mt-2 text-[11px] leading-4" style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>
            Use a clear head-and-shoulders photo. JPG, PNG, or WebP up to 5 MB.
          </Text>
        </View>
        {[
          {
            label: "Full name",
            value: name,
            onChangeText: setName,
            placeholder: "e.g. Tunde Balogun",
            keyboardType: "default" as const,
          },
          {
            label: "Email",
            value: email,
            onChangeText: setEmail,
            placeholder: "instructor@school.com",
            keyboardType: "email-address" as const,
          },
          {
            label: "Phone",
            value: phone,
            onChangeText: setPhone,
            placeholder: "+2348012345678",
            keyboardType: "phone-pad" as const,
          },
        ].map((field) => (
          <View key={field.label}>
            <Text
              className="mb-2 text-[11px] uppercase tracking-[1.4px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {field.label}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize={
                field.keyboardType === "email-address" ? "none" : "words"
              }
              keyboardType={field.keyboardType}
              onChangeText={field.onChangeText}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textFaint}
              value={field.value}
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

        <AuthDateOfBirthField value={dateOfBirth} onChange={setDateOfBirth} />

        {[
          {
            label: "Temporary password",
            value: temporaryPassword,
            onChangeText: setTemporaryPassword,
          },
          {
            label: "Confirm temporary password",
            value: confirmTemporaryPassword,
            onChangeText: setConfirmTemporaryPassword,
          },
        ].map((field) => (
          <View key={field.label}>
            <Text
              className="mb-2 text-[11px] uppercase tracking-[1.4px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {field.label}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              secureTextEntry
              autoCapitalize="none"
              onChangeText={field.onChangeText}
              value={field.value}
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
      </View>

      <View
        className="mt-7 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="text-[13px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          School-controlled activation
        </Text>
        <Text
          className="mt-2 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          The instructor must verify their email before they can be assigned to
          learner bookings.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSendInvite || isSubmitting }}
        disabled={!canSendInvite || isSubmitting}
        onPress={sendInvite}
        className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor:
            canSendInvite && !isSubmitting
              ? colors.primary
              : colors.surfaceStrong,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <Text
              className="text-[15px]"
              style={{
                color: canSendInvite ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Send instructor invite
            </Text>
            <MaterialCommunityIcons
              name="send-outline"
              size={20}
              color={canSendInvite ? colors.onPrimary : colors.textSubtle}
            />
          </>
        )}
      </Pressable>
      {submitError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {submitError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
