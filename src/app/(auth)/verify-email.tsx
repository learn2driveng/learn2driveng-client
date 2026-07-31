import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthFeedback,
  AuthField,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { destinationForRole } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { resendVerificationOtp, verifyEmailOtp } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError } from "@/types";

function getErrorMessage(error: unknown, fallback: string) {
  return error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
    ? (error as ApiError).message
    : fallback;
}

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { email, returnTo } = useLocalSearchParams<{
    email?: string;
    returnTo?: string;
  }>();
  const authenticate = useAuthStore((state) => state.authenticate);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
            Verification session unavailable
          </Text>
          <Text
            className="mt-2 text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            Start account creation again so we know which email to verify.
          </Text>
          <View className="mt-7 w-full">
            <AuthPrimaryButton
              label="Return to sign up"
              onPress={() => router.replace("/signup")}
            />
          </View>
        </View>
      </AuthScreen>
    );
  }

  const verify = async () => {
    setError(null);
    setMessage(null);
    setIsVerifying(true);

    try {
      const session = await verifyEmailOtp(email, otp);
      await authenticate(session);
      router.replace(destinationForRole(session.user.role, returnTo));
    } catch (caught) {
      setError(
        getErrorMessage(
          caught,
          "We could not verify that code. Check it and try again.",
        ),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    setError(null);
    setMessage(null);
    setIsResending(true);

    try {
      const result = await resendVerificationOtp(email);
      setMessage(result.message);
    } catch (caught) {
      setError(
        getErrorMessage(
          caught,
          "We could not resend the code. Please try again.",
        ),
      );
    } finally {
      setIsResending(false);
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
            size={21}
            color={colors.text}
          />
        </Pressable>
        <AppLogo height={44} />
        <View className="h-11 w-11" />
      </View>

      <View className="mt-12">
        <Text
          accessibilityRole="header"
          className="font-figtree-bold text-[32px] leading-[38px]"
          style={{ color: colors.text }}
        >
          Verify your email
        </Text>
        <Text
          className="mt-2 font-figtree text-[14px] leading-6"
          style={{ color: colors.textMuted }}
        >
          Enter the six-digit code sent to {email}.
        </Text>
      </View>

      <View className="mt-8">
        <AuthField
          label="VERIFICATION CODE"
          icon="shield-key-outline"
          keyboardType="number-pad"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
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
      {message ? (
        <View className="mt-4">
          <AuthFeedback
            tone="success"
            message={message}
            onDismiss={() => setMessage(null)}
          />
        </View>
      ) : null}

      <View className="mt-7">
        <AuthPrimaryButton
          label="Verify and continue"
          disabled={otp.length !== 6}
          loading={isVerifying}
          onPress={() => void verify()}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isResending}
        onPress={() => void resend()}
        className="mt-5 self-center px-4 py-2 active:opacity-60"
      >
        <Text
          className="font-figtree-semibold text-[14px]"
          style={{ color: colors.primary }}
        >
          {isResending ? "Sending…" : "Resend verification code"}
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
