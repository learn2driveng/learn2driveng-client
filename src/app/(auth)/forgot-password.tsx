import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");

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

      <View className="mt-16">
        <View
          className="mb-8 h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="lock-reset"
            size={34}
            color={colors.primary}
          />
        </View>
        <Text
          className="font-figtree-bold text-[36px] leading-[43px] tracking-[-1px]"
          style={{ color: colors.text }}
        >
          Forgot password?
        </Text>
        <Text
          className="mt-3 max-w-[420px] font-figtree text-[17px] leading-6"
          style={{ color: colors.textMuted }}
        >
          Enter the email address linked to your account and we’ll send you a
          six-digit verification code.
        </Text>
      </View>

      <View className="mt-12">
        <AuthField
          label="EMAIL ADDRESS"
          icon="email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="name@example.com"
          returnKeyType="send"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mt-8">
        <AuthPrimaryButton
          label="Send OTP"
          showArrow
          onPress={() =>
            router.push({
              pathname: "/reset-password",
              params: { email },
            })
          }
        />
      </View>

      <View className="mt-auto items-center pt-16">
        <AuthFooterLink
          prompt="Remembered your password?"
          action="Log in"
          onPress={() => router.replace("/login")}
        />
        <View className="mt-6 flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="shield-check"
            size={14}
            color={colors.textFaint}
          />
          <Text
            className="font-figtree-bold text-[10px] tracking-[1.2px]"
            style={{ color: colors.textFaint }}
          >
            SECURE OTP VERIFICATION
          </Text>
        </View>
      </View>
    </AuthScreen>
  );
}
