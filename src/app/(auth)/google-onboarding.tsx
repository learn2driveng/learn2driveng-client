import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDateOfBirthField,
  AuthFeedback,
  AuthField,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { destinationForRole } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { completeGoogleSignup } from "@/lib/api";
import { hydrateLearnerOperations } from "@/lib/learner/hydrate-learner-operations";
import { hydrateLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { useAuthStore } from "@/store/auth.store";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import type { ApiError } from "@/types";

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }

  return "We could not finish creating your account. Please try again.";
}

export default function GoogleOnboardingScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const pendingSignup = useGoogleAuthStore((state) => state.pendingSignup);
  const clearSignup = useGoogleAuthStore((state) => state.clearSignup);
  const authenticate = useAuthStore((state) => state.authenticate);
  const [firstName, setFirstName] = useState(
    pendingSignup?.profile.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    pendingSignup?.profile.lastName ?? "",
  );
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      firstName.trim().length >= 2 &&
      lastName.trim().length >= 2 &&
      phone.trim().length >= 11 &&
      Boolean(dateOfBirth) &&
      acceptTerms &&
      !isSubmitting,
    [acceptTerms, dateOfBirth, firstName, isSubmitting, lastName, phone],
  );

  if (!pendingSignup) {
    return (
      <AuthScreen contentClassName="justify-center">
        <View className="items-center">
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="timer-sand"
              size={30}
              color={colors.primary}
            />
          </View>
          <Text
            accessibilityRole="header"
            className="mt-5 text-center font-figtree-bold text-[26px]"
            style={{ color: colors.text }}
          >
            Your setup session has ended
          </Text>
          <Text
            className="mt-2 max-w-[340px] text-center font-figtree text-[15px] leading-6"
            style={{ color: colors.textMuted }}
          >
            Continue with Google again so we can securely confirm your email.
          </Text>
          <View className="mt-7 w-full">
            <AuthPrimaryButton
              label="Return to login"
              onPress={() => router.replace("/login")}
            />
          </View>
        </View>
      </AuthScreen>
    );
  }

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const session = await completeGoogleSignup({
        registrationToken: pendingSignup.registrationToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
        role: pendingSignup.role,
        acceptTerms: true,
      });
      await authenticate(session);
      if (session.user.role === "learner") {
        await Promise.all([
          hydrateLearnerOperations().catch(() => undefined),
          hydrateLearnerSessions().catch(() => undefined),
        ]);
      }
      clearSignup();
      router.replace(
        destinationForRole(session.user.role, pendingSignup.returnTo),
      );
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color={colors.text}
          />
        </Pressable>
        <AppLogo height={42} />
        <View className="h-11 w-11" />
      </View>

      <View className="mt-8">
        <Text
          accessibilityRole="header"
          className="font-figtree-bold text-[32px] leading-[38px] tracking-[-0.8px]"
          style={{ color: colors.text }}
        >
          Finish setting up
        </Text>
        <Text
          className="mt-2 font-figtree text-[15px] leading-6"
          style={{ color: colors.textMuted }}
        >
          Google confirmed your email. Add the details your school needs to
          identify and support you.
        </Text>
      </View>

      <View
        className="mt-6 flex-row items-center rounded-3xl border px-4 py-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.verifiedSoft }}
        >
          <MaterialCommunityIcons
            name="google"
            size={21}
            color={colors.verified}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="font-figtree-bold text-[11px] tracking-[1.2px]"
            style={{ color: colors.textSubtle }}
          >
            VERIFIED GOOGLE EMAIL
          </Text>
          <Text
            className="mt-1 font-figtree-semibold text-[15px]"
            numberOfLines={1}
            style={{ color: colors.text }}
          >
            {pendingSignup.profile.email}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="check-decagram"
          size={23}
          color={colors.verified}
        />
      </View>

      <View className="mt-6 gap-4">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <AuthField
              label="FIRST NAME"
              icon="account"
              autoCapitalize="words"
              autoComplete="given-name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View className="flex-1">
            <AuthField
              label="LAST NAME"
              icon="account-outline"
              autoCapitalize="words"
              autoComplete="family-name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>
        <AuthField
          label="PHONE NUMBER"
          icon="phone"
          autoComplete="tel"
          keyboardType="phone-pad"
          placeholder="+234 801 234 5678"
          value={phone}
          onChangeText={setPhone}
        />
        <AuthDateOfBirthField
          value={dateOfBirth}
          onChange={setDateOfBirth}
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
          className="ml-3 flex-1 font-figtree text-[13px] leading-5"
          style={{ color: colors.textMuted }}
        >
          I agree to the Terms of Service and Privacy Policy.
        </Text>
      </Pressable>

      {error ? (
        <View className="mt-4">
          <AuthFeedback
            tone="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        </View>
      ) : null}

      <View className="mt-6">
        <AuthPrimaryButton
          label={isSubmitting ? "Creating account…" : "Complete setup"}
          disabled={!canSubmit}
          showArrow
          onPress={handleSubmit}
        />
      </View>

      <Text
        className="mt-4 text-center font-figtree text-[12px] leading-5"
        style={{ color: colors.textSubtle }}
      >
        You are creating a {pendingSignup.role} account. Driving schools and
        instructors use their managed onboarding flows.
      </Text>
    </AuthScreen>
  );
}
