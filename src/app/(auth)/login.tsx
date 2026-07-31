import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  AuthDivider,
  AuthFeedback,
  AuthField,
  GoogleAuthButton,
  AuthPrimaryButton,
  AuthScreen,
} from "@/components/auth";
import { AppLogo } from "@/components/common/app-logo";
import { destinationForRole, useGoogleAuth } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { linkGoogleAccount, signInWithPassword } from "@/lib/api";
import { isValidEmail } from "@/lib/auth/validation";
import { useAuthStore } from "@/store/auth.store";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import type { ApiError } from "@/types";

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

export default function LoginScreen() {
  const router = useRouter();
  const { passwordReset, returnTo } = useLocalSearchParams<{
    passwordReset?: string;
    returnTo?: string;
  }>();
  const authenticate = useAuthStore((state) => state.authenticate);
  const pendingGoogleLink = useGoogleAuthStore((state) => state.pendingLink);
  const clearGoogleLink = useGoogleAuthStore((state) => state.clearLink);
  const { colors } = useAppTheme();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPasswordResetMessage, setShowPasswordResetMessage] = useState(
    passwordReset === "true",
  );
  const [loginError, setLoginError] = useState<ApiError | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { continueWithGoogle, googleError, isGoogleLoading } = useGoogleAuth(
    "learner",
    returnTo,
  );
  const verificationEmail =
    typeof loginError?.details?.email === "string"
      ? loginError.details.email
      : isValidEmail(identifier)
        ? identifier.trim().toLowerCase()
        : null;

  const handleLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const passwordSession = await signInWithPassword({
        identifier: identifier.trim(),
        password,
      });
      const session = pendingGoogleLink
        ? await linkGoogleAccount(
            pendingGoogleLink.linkToken,
            passwordSession.accessToken,
          )
        : passwordSession;

      await authenticate(session);
      clearGoogleLink();
      router.replace(
        destinationForRole(
          session.user.role,
          returnTo ?? pendingGoogleLink?.returnTo,
        ),
      );
    } catch (error) {
      setLoginError(
        error &&
          typeof error === "object" &&
          "message" in error &&
          typeof (error as ApiError).message === "string"
          ? (error as ApiError)
          : {
              message: "We could not sign you in. Please try again.",
              statusCode: 0,
            },
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthScreen contentClassName="justify-between">
      <View>
        <View className="flex-row items-start justify-between gap-4">
          <AppLogo height={50} />
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

        <View className="mt-8">
          <Text
            accessibilityRole="header"
            className="font-figtree-bold text-[36px] leading-[42px]"
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
          {showPasswordResetMessage ? (
            <View className="mt-4">
              <AuthFeedback
                tone="success"
                message="Password updated. Sign in with your new password."
                onDismiss={() => setShowPasswordResetMessage(false)}
              />
            </View>
          ) : null}
        </View>

        <View className="mt-8 gap-4">
          <View>
            <AuthField
              label="EMAIL OR PHONE NUMBER"
              icon="email"
              autoCapitalize="none"
              placeholder="alex.jordan@safety.com"
              returnKeyType="next"
              value={identifier}
              onChangeText={(value) => {
                setIdentifier(value);
                setLoginError(null);
              }}
              error={loginError?.message}
            />
            {pendingGoogleLink ? (
              <Text
                className="ml-5 mt-2 font-figtree-medium text-[13px]"
                style={{ color: colors.primary }}
              >
                Use your email or phone to link Google.
              </Text>
            ) : null}
            {loginError?.code === "EMAIL_NOT_VERIFIED" &&
            verificationEmail ? (
              <Pressable
                accessibilityRole="button"
                className="ml-5 mt-2 self-start active:opacity-60"
                onPress={() =>
                  router.push({
                    pathname: "/verify-email",
                    params: {
                      email: verificationEmail,
                      ...(typeof returnTo === "string" ? { returnTo } : {}),
                    },
                  })
                }
              >
                <Text
                  className="font-figtree-semibold text-[13px]"
                  style={{ color: colors.primary }}
                >
                  Verify email
                </Text>
              </Pressable>
            ) : null}
          </View>
          <View>
            <AuthField
              label="PASSWORD"
              icon="lock"
              isPassword
              autoCapitalize="none"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setLoginError(null);
              }}
              onSubmitEditing={() => void handleLogin()}
            />
            <Pressable
              accessibilityRole="button"
              className="mt-3 self-end active:opacity-60"
              onPress={() =>
                router.push({
                  pathname: "/forgot-password",
                  params: isValidEmail(identifier)
                    ? { email: identifier.trim().toLowerCase() }
                    : undefined,
                })
              }
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
            label={
              pendingGoogleLink
                ? "SIGN IN & LINK GOOGLE"
                : "LOGIN TO DASHBOARD"
            }
            showArrow
            disabled={!identifier.trim() || !password}
            loading={isLoggingIn}
            onPress={() => void handleLogin()}
          />
        </View>

        <View className="mb-6 mt-8">
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
            onPress={() =>
              router.push({
                pathname: "/signup",
                params: typeof returnTo === "string" ? { returnTo } : undefined,
              })
            }
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
