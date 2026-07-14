import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthField, AuthPrimaryButton, AuthScreen } from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolSignupScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const signIn = useAuthStore((state) => state.signIn);
  const beginOnboarding = useSchoolOperationsStore(
    (state) => state.beginSchoolOnboarding,
  );
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const complete =
    [schoolName, adminName, email, phone].every((value) => value.trim()) &&
    password.length >= 8;

  const createApplication = () => {
    if (!complete) return;
    beginOnboarding({ schoolName, adminName, email, phone });
    signIn("school_admin");
    router.replace("/school/onboarding");
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
        />
        <AuthField
          label="PHONE NUMBER"
          icon="phone"
          value={phone}
          onChangeText={setPhone}
          autoComplete="tel"
          keyboardType="phone-pad"
        />
        <AuthField
          label="CREATE PASSWORD"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoCapitalize="none"
          autoComplete="new-password"
        />
      </View>
      <View className="mt-8">
        <AuthPrimaryButton
          label="Start school verification"
          onPress={createApplication}
        />
      </View>
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
