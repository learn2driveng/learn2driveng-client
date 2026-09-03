import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { SchoolAvatar } from "@/components/school/school-avatar";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateMyDrivingSchool } from "@/lib/api";
import { hydrateSchoolFromRecord } from "@/lib/school/hydrate-school-operations";
import { uploadSchoolLogo } from "@/lib/school/upload-school-logo";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

export default function SchoolProfileScreen() {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const updateProfile = useSchoolOperationsStore(
    (state) => state.updateProfile,
  );
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [primaryLocation, setPrimaryLocation] = useState(
    profile.primaryLocation,
  );
  const [address, setAddress] = useState(profile.address);
  const [description, setDescription] = useState(profile.description);
  const [saved, setSaved] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const canSave =
    [name, email, phone, primaryLocation, address, description].every(
      (value) => value.trim().length > 0,
    );

  const selectLogo = async (source: "camera" | "library") => {
    setSaveError(null);
    const result =
      source === "camera"
        ? await (async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              throw new Error("Camera access is required to take a logo photo.");
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
    const fallbackName =
      asset.mimeType === "image/png"
        ? "school-logo.png"
        : asset.mimeType === "image/webp"
          ? "school-logo.webp"
          : "school-logo.jpg";
    setIsUploadingLogo(true);

    try {
      const school = await uploadSchoolLogo({
        uri: asset.uri,
        fileName: asset.fileName ?? fallbackName,
        mimeType: asset.mimeType,
        size: asset.fileSize,
      });
      const adminName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : profile.adminName;
      updateProfile({ logoUrl: school.logoUrl ?? null });
      hydrateSchoolFromRecord(school, adminName);
    } catch (caught) {
      const error = caught as ApiError;
      setSaveError(error.message || "We could not upload your school logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    multiline = false,
  ) => (
    <View>
      <Text
        className="mb-2 text-[10px] uppercase tracking-[1.2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        multiline={multiline}
        onChangeText={(nextValue) => {
          onChangeText(nextValue);
          setSaved(false);
        }}
        className={`rounded-2xl border px-4 text-[14px] ${multiline ? "min-h-28 py-4" : "h-14"}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="School profile" />
      <View
        className="mt-5 overflow-hidden rounded-[32px] border p-5"
        style={{
          backgroundColor: colors.contrastSurface,
          borderColor: colors.contrastSurface,
          ...surfaces.floating,
        }}
      >
        <View
          className="absolute -right-10 -top-14 h-44 w-44 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
        />
        <View
          className="absolute -bottom-20 -left-12 h-36 w-36 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        />
        <View className="flex-row items-start">
          <SchoolAvatar
            name={profile.name}
            logoUrl={profile.logoUrl}
            size={76}
            inverse
          />
          <View className="ml-4 flex-1 pt-1">
            <View className="flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name="check-decagram"
                size={16}
                color={colors.verified}
              />
              <Text
                className="text-[10px] uppercase tracking-[1.4px]"
                style={{
                  color: colors.contrastText,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                FRSC verified school
              </Text>
            </View>
            <Text
              className="mt-2 text-[21px] leading-6"
              numberOfLines={2}
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {profile.name}
            </Text>
            <Text
              className="mt-1 text-[12px]"
              style={{
                color: "rgba(255,255,255,0.78)",
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {profile.primaryLocation || "Nigeria"}
            </Text>
          </View>
        </View>
        <View className="mt-5 flex-row gap-2">
          {[
            ["Bookings", String(profile.activeBookings ?? 0)],
            ["Instructors", String(profile.activeInstructors ?? 0)],
            ["Vehicles", String(profile.vehicles ?? 0)],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-1 rounded-2xl px-3 py-3"
              style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
            >
              <Text
                className="text-[16px]"
                style={{
                  color: colors.contrastText,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
              <Text
                className="mt-0.5 text-[10px]"
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit school profile"
          onPress={() => setIsEditing(true)}
          className="mt-5 h-11 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={17}
            color={colors.onPrimary}
          />
          <Text
            className="text-[12px]"
            style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
          >
            Edit public profile
          </Text>
        </Pressable>
      </View>

      {!isEditing ? (
        <>
          <View className="mt-8">
            <SectionHeader title="About your school" />
            <View className="mt-3 rounded-3xl border p-5" style={surfaces.card}>
              <Text
                className="text-[15px] leading-6"
                style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
              >
                {profile.description ||
                  "Add a short introduction to help learners understand your school."}
              </Text>
            </View>
          </View>

          <View className="mt-7">
            <SectionHeader title="Contact & location" />
            <View className="mt-3 overflow-hidden rounded-3xl border" style={surfaces.card}>
              {[
                ["email-outline", "Email", profile.email],
                ["phone-outline", "Phone", profile.phone],
                [
                  "map-marker-outline",
                  "Address",
                  `${profile.address}, ${profile.primaryLocation}`,
                ],
              ].map(([icon, label, value], index) => (
                <View
                  key={label}
                  className={`flex-row items-center gap-3 p-4 ${index ? "border-t" : ""}`}
                  style={index ? { borderColor: colors.border } : undefined}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name={icon as never}
                      size={19}
                      color={colors.textMuted}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[10px] uppercase tracking-[1px]"
                      style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
                    >
                      {label}
                    </Text>
                    <Text
                      className="mt-1 text-[13px]"
                      style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
                    >
                      {value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

        </>
      ) : (
        <>
      <View className="mt-8">
        <SectionHeader title="Public profile details" />
        <Text
          className="mt-2 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          This is the story, identity, and contact information learners see while comparing schools.
        </Text>
        <View
          className="gap-5 mt-4 p-4 border rounded-3xl"
          style={surfaces.card}
        >
          <View>
            <Text
              className="mb-2 text-[10px] uppercase tracking-[1.2px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              School logo
            </Text>
            <View className="flex-row items-center gap-4">
              <SchoolAvatar
                name={profile.name}
                logoUrl={profile.logoUrl}
                size={80}
              />
              <View className="flex-1 gap-2">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choose school logo from photo library"
                  accessibilityState={{ disabled: isUploadingLogo }}
                  disabled={isUploadingLogo}
                  onPress={() => void selectLogo("library")}
                  className="h-10 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isUploadingLogo ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <MaterialCommunityIcons
                      name="image-plus"
                      size={17}
                      color={colors.onPrimary}
                    />
                  )}
                  <Text
                    className="text-[12px]"
                    style={{
                  color: colors.contrastText,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {isUploadingLogo ? "Uploading…" : "Choose image"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Take school logo photo"
                  accessibilityState={{ disabled: isUploadingLogo }}
                  disabled={isUploadingLogo}
                  onPress={() => void selectLogo("camera")}
                  className="h-10 flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="camera-outline"
                    size={17}
                    color={colors.text}
                  />
                  <Text
                    className="text-[12px]"
                    style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
                  >
                    Take photo
                  </Text>
                </Pressable>
              </View>
            </View>
            <Text
              className="mt-3 text-[11px] leading-4"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
            >
              JPG, PNG, or WebP up to 5 MB. Your logo appears in school discovery.
            </Text>
          </View>
          {field("Marketplace display name", name, setName)}
          {field("About the school", description, setDescription, true)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Contact and location" />
        <View
          className="gap-5 mt-4 p-4 border rounded-3xl"
          style={surfaces.card}
        >
          {field("Operations email", email, setEmail)}
          {field("Phone number", phone, setPhone)}
          {field("Primary location", primaryLocation, setPrimaryLocation)}
          {field("Street address", address, setAddress)}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave || saved || isSaving }}
        disabled={!canSave || saved || isSaving}
        onPress={async () => {
          if (!canSave || saved || isSaving) return;

          setSaveError(null);
          setIsSaving(true);

          try {
            const school = await updateMyDrivingSchool({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              description: description.trim(),
              addressLine1: address.trim(),
              city: primaryLocation.trim(),
            });
            const adminName = user
              ? `${user.firstName} ${user.lastName}`.trim()
              : profile.adminName;
            hydrateSchoolFromRecord(school, adminName);
            updateProfile({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              primaryLocation: primaryLocation.trim(),
              address: address.trim(),
              description: description.trim(),
            });
            setSaved(true);
            setIsEditing(false);
          } catch (caught) {
            const error = caught as ApiError;
            setSaveError(error.message || "We could not save your profile.");
          } finally {
            setIsSaving(false);
          }
        }}
        className="flex-row justify-center items-center gap-2 active:opacity-80 mt-8 rounded-2xl h-14"
        style={{
          backgroundColor:
            canSave && !saved && !isSaving
              ? colors.primary
              : colors.surfaceStrong,
        }}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <MaterialCommunityIcons
              name={saved ? "check" : "content-save-outline"}
              size={20}
              color={canSave && !saved ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="text-[15px]"
              style={{
                color: canSave && !saved ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {saved ? "Profile up to date" : "Save profile"}
            </Text>
          </>
        )}
      </Pressable>
      {saveError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {saveError}
        </Text>
      ) : null}
        </>
      )}
    </DashboardScreen>
  );
}
