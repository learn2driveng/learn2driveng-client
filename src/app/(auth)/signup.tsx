import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDivider,
  AuthField,
  AuthPrimaryButton,
  AuthScreen,
  SocialAuthButtons,
} from "@/components/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

export default function SignupScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { colors } = useAppTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleCreateAccount = () => {
    const safeReturnTo =
      typeof returnTo === "string" &&
      (returnTo.startsWith("/student/") || returnTo.startsWith("/checkout/"))
        ? (returnTo as Href)
        : "/student";

    signIn();
    router.replace(safeReturnTo);
  };

  return (
    <AuthScreen scrollEnabled={false} contentClassName="justify-between">
      <View>
        <View className="items-end">
          <View
            className="h-9 flex-row items-center gap-2 rounded-full border px-3"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <View className="h-6 w-6 items-center justify-center overflow-hidden rounded-sm">
              <Image
                source={{ uri: FRSC_SEAL_URI }}
                className="h-5 w-5"
                contentFit="contain"
              />
            </View>
            <Text
              className="font-figtree-bold text-[11px] tracking-[0.7px]"
              style={{ color: colors.textMuted }}
            >
              FRSC VERIFIED
            </Text>
          </View>
        </View>

        <View className="mt-5">
          <Text
            accessibilityRole="header"
            className="font-figtree-bold text-[30px] leading-[36px] tracking-[-0.8px]"
            style={{ color: colors.text }}
          >
            Create your account
          </Text>
          <Text
            className="mt-1 font-figtree-medium text-[14px]"
            style={{ color: colors.primary }}
          >
            Join the FRSC-verified driving community.
          </Text>
        </View>

        <View className="mt-5 gap-3">
          <AuthField
            label="FULL NAME"
            icon="account"
            autoCapitalize="words"
            autoComplete="name"
            placeholder="Enter your full name"
            returnKeyType="next"
            value={fullName}
            onChangeText={setFullName}
          />
          <AuthField
            label="EMAIL ADDRESS"
            icon="email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="name@example.com"
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
          />
          <AuthField
            label="PHONE NUMBER"
            icon="phone"
            autoComplete="tel"
            keyboardType="phone-pad"
            placeholder="+234 000 000 0000"
            returnKeyType="next"
            value={phone}
            onChangeText={setPhone}
          />
          <AuthField
            label="CREATE PASSWORD"
            icon="lock"
            isPassword
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View className="mt-5">
          <AuthPrimaryButton
            label="Create Account"
            onPress={handleCreateAccount}
          />
        </View>

        <View className="mb-4 mt-5">
          <AuthDivider />
        </View>
        <SocialAuthButtons compact />
      </View>

      <View className="items-center gap-3 pt-4">
        <View className="flex-row flex-wrap items-center justify-center">
          <Text
            className="font-figtree text-[15px]"
            style={{ color: colors.text }}
          >
            Already have an account?{" "}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              router.replace({
                pathname: "/login",
                params: typeof returnTo === "string" ? { returnTo } : undefined,
              })
            }
            className="active:opacity-60"
          >
            <Text
              className="font-figtree-semibold text-[15px]"
              style={{ color: colors.primary }}
            >
              Log in
            </Text>
          </Pressable>
        </View>
        <Text
          className="max-w-[300px] text-center font-figtree text-[11px] leading-4"
          style={{ color: colors.text }}
        >
          By creating an account, you agree to our Terms and Privacy.
        </Text>
      </View>
    </AuthScreen>
  );
}
