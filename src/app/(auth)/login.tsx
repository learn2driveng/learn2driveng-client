import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen scrollEnabled={false} contentClassName="justify-between">
      <View>
        <View
          className="h-9 self-end flex-row items-center gap-2 rounded-full border px-3"
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

        <View className="mt-8">
          <Text
            className="font-figtree-bold text-[36px] leading-[42px] tracking-[-1px]"
            style={{ color: colors.text }}
          >
            Welcome!
          </Text>
          <Text
            className="mt-2 font-figtree text-[15px]"
            style={{ color: colors.primary }}
          >
            Sign in to continue your driving journey
          </Text>
        </View>

        <View className="mt-8 gap-4">
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
              className="mt-3 self-end active:opacity-60"
              onPress={() => router.push("/forgot-password")}
            >
              <Text
                className="font-figtree-semibold text-[14px]"
                style={{ color: colors.primary }}
              >
                FORGOT PASSWORD?
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-6">
          <AuthPrimaryButton
            label="LOGIN TO DASHBOARD"
            showArrow
            onPress={() => router.replace("/student")}
          />
        </View>

        <View className="mt-8 mb-6">
          <AuthDivider />
        </View>
        <SocialAuthButtons />
      </View>

      <View className="items-center pt-6">
        <View className="flex-row flex-wrap items-center justify-center">
          <Text
            className="font-figtree text-[15px]"
            style={{ color: colors.textMuted }}
          >
            Don’t have an account?{" "}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/signup")}
            className="active:opacity-60"
          >
            <Text
              className="font-figtree-semibold text-[15px]"
              style={{ color: colors.primary }}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>
        <View className="mt-3 flex-row items-center gap-2">
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
