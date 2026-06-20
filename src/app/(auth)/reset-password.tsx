import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

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
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.text }}
        >
          <MaterialCommunityIcons
            name="car-emergency"
            size={25}
            color={colors.primary}
          />
        </View>
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
          className="font-figtree-bold text-[36px] leading-[43px] tracking-[-1px]"
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
          onChangeText={setOtp}
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
          onChangeText={setPassword}
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
          onChangeText={setPasswordConfirmation}
        />
      </View>

      <View className="mt-8">
        <AuthPrimaryButton label="Reset Password" showArrow />
      </View>

      <View className="mt-10 items-center gap-6">
        <AuthFooterLink
          prompt="Didn’t receive the code?"
          action="Resend OTP"
          onPress={() => {}}
        />
      </View>
    </AuthScreen>
  );
}
