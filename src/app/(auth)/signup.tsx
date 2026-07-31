import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDateOfBirthField,
  AuthDivider,
  AuthFeedback,
  AuthField,
  GoogleAuthButton,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { useGoogleAuth } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { registerAccount } from "@/lib/api";
import {
  isStrongPassword,
  isValidEmail,
  PASSWORD_REQUIREMENTS,
} from "@/lib/auth/validation";
import type { ApiError } from "@/types";

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

export default function SignupScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { colors } = useAppTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const { continueWithGoogle, googleError, isGoogleLoading } = useGoogleAuth(
    "learner",
    returnTo,
  );

  const name = useMemo(() => {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  }, [fullName]);
  const canSubmit =
    name.firstName.length >= 2 &&
    name.lastName.length >= 2 &&
    isValidEmail(email) &&
    phone.trim().length > 0 &&
    Boolean(dateOfBirth) &&
    isStrongPassword(password) &&
    acceptTerms;

  const handleCreateAccount = async () => {
    setSignupError(null);
    setIsSigningUp(true);

    try {
      await registerAccount({
        ...name,
        email: email.trim(),
        phone: phone.trim(),
        dateOfBirth: dateOfBirth.trim(),
        password,
        acceptTerms: true,
        role: "learner",
      });
      router.push({
        pathname: "/verify-email",
        params: {
          email: email.trim(),
          ...(typeof returnTo === "string" ? { returnTo } : {}),
        },
      });
    } catch (error) {
      setSignupError(
        error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as ApiError).message === "string"
          ? (error as ApiError).message
          : "We could not create your account. Please try again.",
      );
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <AuthScreen contentClassName="justify-between">
      <View>
        <View className="flex-row items-start justify-between gap-4">
          <AppLogo height={46} />
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
            className="font-figtree-bold text-[30px] leading-[36px]"
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
            error={
              email && !isValidEmail(email)
                ? "Enter a valid email address."
                : null
            }
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
          <AuthDateOfBirthField
            value={dateOfBirth}
            onChange={setDateOfBirth}
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
            error={
              password && !isStrongPassword(password)
                ? PASSWORD_REQUIREMENTS
                : null
            }
          />
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptTerms }}
          onPress={() => setAcceptTerms((accepted) => !accepted)}
          className="mt-4 flex-row items-start active:opacity-70"
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
            className="ml-3 flex-1 font-figtree text-[12px] leading-5"
            style={{ color: colors.textMuted }}
          >
            I agree to the Terms of Service and Privacy Policy.
          </Text>
        </Pressable>

        <View className="mt-5">
          <AuthPrimaryButton
            label="Create Account"
            disabled={!canSubmit}
            loading={isSigningUp}
            onPress={() => void handleCreateAccount()}
          />
        </View>

        {signupError ? (
          <View className="mt-3">
            <AuthFeedback
              tone="error"
              message={signupError}
              onDismiss={() => setSignupError(null)}
            />
          </View>
        ) : null}

        <View className="mb-4 mt-5">
          <AuthDivider />
        </View>
        <GoogleAuthButton
          onPress={continueWithGoogle}
          loading={isGoogleLoading}
        />
        {googleError ? (
          <View className="mt-3">
            <AuthFeedback tone="error" message={googleError} />
          </View>
        ) : null}
      </View>

      <View className="items-center gap-3 pt-4">
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push("/school-signup")}
          className="active:opacity-60"
        >
          <Text
            className="font-figtree-semibold text-[14px]"
            style={{ color: colors.primary }}
          >
            Register a driving school
          </Text>
        </Pressable>
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
      </View>
    </AuthScreen>
  );
}
