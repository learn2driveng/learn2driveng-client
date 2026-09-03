import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateMyProfile } from "@/lib/api";
import { formatLearnerId, userDisplayName } from "@/lib/learner/map-api";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types";

export default function StudentAccountScreen() {
  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!user) return null;

  const canSave =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    phone.trim().length > 0 &&
    dateOfBirth.trim().length > 0;

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    options?: { editable?: boolean; keyboardType?: "default" | "phone-pad" },
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
        editable={options?.editable ?? true}
        keyboardType={options?.keyboardType ?? "default"}
        onChangeText={(nextValue) => {
          onChangeText(nextValue);
          setSaved(false);
          setSaveError(null);
        }}
        className="h-14 rounded-2xl border px-4 text-[14px]"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
          opacity: options?.editable === false ? 0.7 : 1,
        }}
      />
    </View>
  );

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedUser = await updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });
      updateUser(updatedUser);
      setSaved(true);
    } catch (error) {
      setSaveError(
        error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "We could not save your profile. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Account" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Your personal and contact information.
      </Text>

      <View className="mt-8 gap-5">
        {field("First name", firstName, setFirstName)}
        {field("Last name", lastName, setLastName)}
        {field("Email", user.email, () => undefined, { editable: false })}
        {field("Phone", phone, setPhone, { keyboardType: "phone-pad" })}
        {field("Date of birth", dateOfBirth, setDateOfBirth)}
        {field("Student ID", formatLearnerId(user.id), () => undefined, {
          editable: false,
        })}
      </View>

      {saveError ? (
        <Text
          className="mt-4 font-figtree-medium text-[13px]"
          style={{ color: colors.error }}
        >
          {saveError}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave || saved || isSaving }}
        disabled={!canSave || saved || isSaving}
        onPress={() => void handleSave()}
        className="mt-8 h-14 flex-row items-center justify-center rounded-full active:opacity-80"
        style={{
          backgroundColor:
            !canSave || saved ? colors.surfaceStrong : colors.primary,
        }}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text
            className="text-[15px]"
            style={{
              color: saved ? colors.textSubtle : colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {saved ? "All changes saved" : "Save changes"}
          </Text>
        )}
      </Pressable>

      <Text
        className="mt-4 text-center font-figtree text-[12px]"
        style={{ color: colors.textMuted }}
      >
        Signed in as {userDisplayName(user)}
      </Text>
    </DashboardScreen>
  );
}
