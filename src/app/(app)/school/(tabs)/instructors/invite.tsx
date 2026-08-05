import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthDateOfBirthField } from "@/components/auth";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { createSchoolInstructor } from "@/lib/api";
import { instructorUserToRosterItem } from "@/lib/school/map-api";
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
  const upsertInstructor = useSchoolOperationsStore(
    (state) => state.upsertInstructor,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [confirmTemporaryPassword, setConfirmTemporaryPassword] = useState("");
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
      const instructor = await createSchoolInstructor({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth,
        temporaryPassword,
        confirmTemporaryPassword,
      });
      upsertInstructor(instructorUserToRosterItem(instructor));
      router.replace("/school/instructors");
    } catch (caught) {
      const error = caught as ApiError;
      setSubmitError(error.message || "We could not invite this instructor.");
    } finally {
      setIsSubmitting(false);
    }
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
