import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDivider,
  AuthField,
  AuthFooterLink,
  AuthPrimaryButton,
  AuthScreen,
  SocialAuthButtons,
} from "@/components/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2.5">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.text }}
          >
            <MaterialCommunityIcons
              name="car-emergency"
              size={27}
              color={colors.primary}
            />
          </View>
          <Text
            className="font-figtree-bold text-[22px] tracking-[-0.6px]"
            style={{ color: colors.text }}
          >
            Learn<Text style={{ color: colors.primary }}>2</Text>Drive
          </Text>
        </View>

        <View
          className="h-10 flex-row items-center gap-2 rounded-full border px-3"
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

      <View className="mt-12">
        <Text
          className="font-figtree-bold text-[36px] leading-[43px] tracking-[-1px]"
          style={{ color: colors.text }}
        >
          Welcome Back
        </Text>
        <Text
          className="mt-2 font-figtree text-[17px]"
          style={{ color: colors.textMuted }}
        >
          Sign in to continue your driving journey
        </Text>
      </View>

      <View className="mt-11 gap-7">
        <AuthField
          label="EMAIL ADDRESS"
          icon="email"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="alex.jordan@safety.com"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
        />
        <View>
          <AuthField
            label="PASSWORD"
            icon="lock"
            isPassword
            autoCapitalize="none"
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            accessibilityRole="button"
            className="mt-4 self-end active:opacity-60"
            onPress={() => router.push("/forgot-password")}
          >
            <Text
              className="font-figtree-semibold text-[13px]"
              style={{ color: colors.primary }}
            >
              FORGOT PASSWORD?
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-9">
        <AuthPrimaryButton
          label="LOGIN TO DASHBOARD"
          showArrow
          onPress={() => router.replace("/student")}
        />
      </View>

      <View className="my-10">
        <AuthDivider />
      </View>
      <SocialAuthButtons />

      <View className="mt-auto items-center pt-14">
        <AuthFooterLink
          prompt="Don’t have an account?"
          action="Sign Up"
          underline
          onPress={() => router.push("/signup")}
        />
        <View className="mt-5 flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="shield-check"
            size={14}
            color={colors.textFaint}
          />
          <Text
            className="font-figtree-bold text-[10px] tracking-[1.2px]"
            style={{ color: colors.textFaint }}
          >
            END-TO-END ENCRYPTED SESSION
          </Text>
        </View>
      </View>
    </AuthScreen>
  );
}
