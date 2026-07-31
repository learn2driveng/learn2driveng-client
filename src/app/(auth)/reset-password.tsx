import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthFeedback,
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { useAppTheme } from "@/hooks/use-app-theme";
import { requestPasswordReset, resetPassword } from "@/lib/api";
import {
  isStrongPassword,
  PASSWORD_REQUIREMENTS,
} from "@/lib/auth/validation";
import type { ApiError } from "@/types";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const passwordError =
    password && !isStrongPassword(password) ? PASSWORD_REQUIREMENTS : null;
  const confirmationError =
    passwordConfirmation && password !== passwordConfirmation
      ? "Passwords do not match."
      : null;
  const canReset =
    otp.length === 6 &&
    isStrongPassword(password) &&
    password === passwordConfirmation;

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = setInterval(() => {
      setResendSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const submitReset = async () => {
    if (!email || !canReset) return;

    setApiError(null);
    setMessage(null);
    setIsResetting(true);

    try {
      await resetPassword({
        email,
        otp,
        newPassword: password,
        confirmPassword: passwordConfirmation,
      });
      router.replace({
        pathname: "/login",
        params: { passwordReset: "true" },
      });
    } catch (caught) {
      setApiError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError)
          : {
              message: "We could not reset your password. Please try again.",
              statusCode: 0,
            },
      );
    } finally {
      setIsResetting(false);
    }
  };

  const resendCode = async () => {
    if (!email || resendSeconds > 0 || isResending) return;

    setApiError(null);
    setMessage(null);
    setIsResending(true);

    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      setResendSeconds(60);
    } catch (caught) {
      setApiError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError)
          : {
              message: "We could not resend the code. Please try again.",
              statusCode: 0,
            },
      );
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <AuthScreen contentClassName="justify-center">
        <View className="items-center">
          <AppLogo height={52} />
          <Text
            accessibilityRole="header"
            className="mt-7 text-center font-figtree-bold text-[26px]"
            style={{ color: colors.text }}
          >
            Reset session unavailable
          </Text>
          <Text
            className="mt-2 text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            Request a new reset code so we know which account to update.
          </Text>
          <View className="mt-7 w-full">
            <AuthPrimaryButton
              label="Request reset code"
              onPress={() => router.replace("/forgot-password")}
            />
          </View>
        </View>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full border active:scale-[0.98] active:opacity-70"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
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

      <View className="mt-12">
        <View
          className="mb-7 h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="shield-key"
            size={34}
            color={colors.primary}
          />
        </View>
        <Text
          accessibilityRole="header"
          className="font-figtree-bold text-[36px] leading-[43px]"
          style={{ color: colors.text }}
        >
          Reset your password
        </Text>
        <Text
          className="mt-3 max-w-[440px] font-figtree text-[17px] leading-6"
          style={{ color: colors.textMuted }}
        >
          Enter the six-digit code sent to {email || "your email"}, then choose
          a new password.
        </Text>
      </View>

      <View className="mt-10 gap-6">
        <AuthField
          label="VERIFICATION CODE"
          icon="numeric"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          returnKeyType="next"
          value={otp}
          onChangeText={(value) => {
            setOtp(value.replace(/\D/g, ""));
            setApiError(null);
          }}
          error={
            apiError?.code === "INVALID_OR_EXPIRED_OTP" ||
            apiError?.code === "OTP_ATTEMPTS_EXCEEDED"
              ? apiError.message
              : null
          }
        />
        <AuthField
          label="NEW PASSWORD"
          icon="lock"
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="••••••••"
          returnKeyType="next"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setApiError(null);
          }}
          error={passwordError}
        />
        <AuthField
          label="CONFIRM NEW PASSWORD"
          icon="lock-check"
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
          placeholder="••••••••"
          returnKeyType="done"
          value={passwordConfirmation}
          onChangeText={(value) => {
            setPasswordConfirmation(value);
            setApiError(null);
          }}
          onSubmitEditing={() => void submitReset()}
          error={confirmationError}
        />
      </View>

      {apiError &&
      apiError.code !== "INVALID_OR_EXPIRED_OTP" &&
      apiError.code !== "OTP_ATTEMPTS_EXCEEDED" ? (
        <View className="mt-4">
          <AuthFeedback
            tone="error"
            message={apiError.message}
            onDismiss={() => setApiError(null)}
          />
        </View>
      ) : null}
      {message ? (
        <View className="mt-4">
          <AuthFeedback
            tone="success"
            message={message}
            onDismiss={() => setMessage(null)}
          />
        </View>
      ) : null}

      <View className="mt-8">
        <AuthPrimaryButton
          label="Reset Password"
          showArrow
          disabled={!canReset}
          loading={isResetting}
          onPress={() => void submitReset()}
        />
      </View>

      <View className="mt-10 items-center gap-6">
        <AuthFooterLink
          prompt="Didn’t receive the code?"
          action={
            isResending
              ? "Sending..."
              : resendSeconds > 0
                ? `Resend in ${resendSeconds}s`
                : "Resend OTP"
          }
          onPress={
            resendSeconds === 0 && !isResending
              ? () => void resendCode()
              : undefined
          }
        />
      </View>
    </AuthScreen>
  );
}
