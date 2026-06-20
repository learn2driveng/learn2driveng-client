import { MaterialCommunityIcons } from "@expo/vector-icons";
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

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthScreen>
      <View className="flex-row items-center justify-between">
        <MaterialCommunityIcons name="car" size={30} color={colors.text} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Account creation help"
        >
          <MaterialCommunityIcons
            name="help-circle"
            size={30}
            color={colors.textSubtle}
          />
        </Pressable>
      </View>

      <View className="mt-10">
        <Text
          className="font-figtree-bold text-[36px] leading-[43px] tracking-[-1px]"
          style={{ color: colors.text }}
        >
          Create your account
        </Text>
        <Text
          className="mt-2 font-figtree-medium text-[17px]"
          style={{ color: colors.textMuted }}
        >
          Join the FRSC-verified driving community.
        </Text>
      </View>

      <View className="mt-10 gap-6">
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

      <View className="mt-8">
        <AuthPrimaryButton label="Create Account" />
      </View>

      <View className="mb-6 mt-16">
        <AuthDivider />
      </View>
      <SocialAuthButtons compact />

      <View className="mt-10 items-center gap-6">
        <AuthFooterLink
          prompt="Already have an account?"
          action="Log in"
          onPress={() => router.replace("/login")}
        />
        <Text
          className="max-w-[330px] text-center font-figtree text-[12px] leading-5"
          style={{ color: colors.textSubtle }}
        >
          By creating an account, you agree to our Terms and Privacy.
        </Text>
      </View>
    </AuthScreen>
  );
}
