import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthTokens } from "@/types";

const SESSION_KEY = "learn2drive.auth.tokens";

function isAuthTokens(value: unknown): value is AuthTokens {
  if (!value || typeof value !== "object") return false;

  const tokens = value as Partial<AuthTokens>;
  return (
    typeof tokens.accessToken === "string" &&
    (Platform.OS === "web" || typeof tokens.refreshToken === "string")
  );
}

function getWebStorage() {
  return typeof sessionStorage === "undefined" ? null : sessionStorage;
}

export async function readSessionTokens(): Promise<AuthTokens | null> {
  const serialized =
    Platform.OS === "web"
      ? getWebStorage()?.getItem(SESSION_KEY)
      : await SecureStore.getItemAsync(SESSION_KEY);

  if (!serialized) return null;

  try {
    const tokens: unknown = JSON.parse(serialized);
    return isAuthTokens(tokens) ? tokens : null;
  } catch {
    await clearSessionTokens();
    return null;
  }
}

export async function writeSessionTokens(tokens: AuthTokens) {
  const serialized = JSON.stringify(tokens);

  if (Platform.OS === "web") {
    getWebStorage()?.setItem(
      SESSION_KEY,
      JSON.stringify({ accessToken: tokens.accessToken, refreshToken: null }),
    );
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, serialized, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearSessionTokens() {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}
