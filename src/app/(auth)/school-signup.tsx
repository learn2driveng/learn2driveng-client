import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDateOfBirthField,
  AuthFeedback,
  AuthField,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { registerAccount } from "@/lib/api";
import {
  isStrongPassword,
  isValidEmail,
  PASSWORD_REQUIREMENTS,
} from "@/lib/auth/validation";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

export default function SchoolSignupScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const beginOnboarding = useSchoolOperationsStore(
    (state) => state.beginSchoolOnboarding,
  );
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const adminNameParts = adminName.trim().split(/\s+/);
  const firstName = adminNameParts[0] ?? "";
  const lastName = adminNameParts.slice(1).join(" ");
  const complete =
    [schoolName, phone].every((value) => value.trim()) &&
    isValidEmail(email) &&
    firstName.length >= 2 &&
    lastName.length >= 2 &&
    Boolean(dateOfBirth) &&
    isStrongPassword(password) &&
    acceptTerms;

  const createApplication = async () => {
    if (!complete) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await registerAccount({
        firstName,
        lastName,
        email: email.trim(),
        phone: phone.trim(),
        password,
        dateOfBirth: dateOfBirth.trim(),
        acceptTerms: true,
        role: "driving_school",
      });
      beginOnboarding({ schoolName, adminName, email, phone });
      router.push({
        pathname: "/verify-email",
        params: { email: email.trim(), returnTo: "/school/onboarding" },
      });
    } catch (caught) {
      setError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError).message
          : "We could not create the school administrator account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        </Pressable>
        <AppLogo height={46} />
      </View>
      <View className="mt-10">
        <Text
          className="text-[10px] uppercase tracking-[2px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          School application
        </Text>
        <Text
          accessibilityRole="header"
          className="mt-2 text-[32px] leading-9"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Register your driving school
        </Text>
        <Text
          className="mt-3 text-[14px] leading-5"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Create the accountable administrator account, then complete identity
          and document verification.
        </Text>
      </View>
      <View className="mt-8 gap-4">
        <AuthField
          label="REGISTERED SCHOOL NAME"
          icon="school"
          value={schoolName}
          onChangeText={setSchoolName}
          autoCapitalize="words"
        />
        <AuthField
          label="ADMINISTRATOR NAME"
          icon="account-tie"
          value={adminName}
          onChangeText={setAdminName}
          autoCapitalize="words"
          autoComplete="name"
        />
        <AuthField
          label="OPERATIONS EMAIL"
          icon="email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          error={
            email && !isValidEmail(email)
              ? "Enter a valid email address."
              : null
          }
        />
        <AuthField
          label="PHONE NUMBER"
          icon="phone"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
          keyboardType="phone-pad"
        />
        <AuthDateOfBirthField
          label="ADMINISTRATOR DATE OF BIRTH"
          value={dateOfBirth}
          onChange={setDateOfBirth}
        />
        <AuthField
          label="CREATE PASSWORD"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          error={
            password && !isStrongPassword(password)
              ? PASSWORD_REQUIREMENTS
              : null
          }
        />
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: acceptTerms }}
        onPress={() => setAcceptTerms((accepted) => !accepted)}
        className="mt-5 flex-row items-start active:opacity-70"
      >
        <View
          className="mt-0.5 h-5 w-5 items-center justify-center rounded-md border"
          style={{
            borderColor: acceptTerms ? colors.primary : colors.border,
            backgroundColor: acceptTerms ? colors.primary : colors.surface,
          }}
        >
          {acceptTerms ? (
            <MaterialCommunityIcons
              name="check"
              size={15}
              color={colors.onPrimary}
            />
          ) : null}
        </View>
        <Text
          className="ml-3 flex-1 text-[12px] leading-5"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtree,
          }}
        >
          I agree to the Terms of Service and Privacy Policy as the accountable
          school administrator.
        </Text>
      </Pressable>
      <View className="mt-8">
        <AuthPrimaryButton
          label="Start school verification"
          disabled={!complete}
          loading={isSubmitting}
          onPress={() => void createApplication()}
        />
      </View>
      {error ? (
        <View className="mt-4">
          <AuthFeedback
            tone="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </View>
      ) : null}
      <Text
        className="mt-5 text-center text-[11px] leading-4"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Creating an account does not make the school public. Operations unlock
        only after verification approval.
      </Text>
    </AuthScreen>
  );
}
