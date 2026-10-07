const DEFAULT_API_BASE_URL = "http://localhost:7777/api/v1";

/** REST base URL including `/api/v1` (see server `main.ts`). */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) {
    if (!__DEV__) {
      throw new Error("EXPO_PUBLIC_API_URL is required for production builds.");
    }
    return DEFAULT_API_BASE_URL;
  }

  const normalized = configured.replace(/\/+$/, "");
  const protocol = new URL(normalized).protocol;
  if (!__DEV__ && protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use HTTPS in production builds.");
  }
  if (__DEV__ && protocol !== "http:" && protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use HTTP or HTTPS.");
  }

  return normalized;
}

export function getRealtimeBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_SOCKET_URL?.trim();
  const normalized = (
    configured || getApiBaseUrl().replace(/\/api\/v1\/?$/, "")
  ).replace(/\/+$/, "");
  const protocol = new URL(normalized).protocol;

  if (!__DEV__ && protocol !== "https:") {
    throw new Error(
      "EXPO_PUBLIC_SOCKET_URL must use HTTPS in production builds.",
    );
  }
  if (__DEV__ && protocol !== "http:" && protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_SOCKET_URL must use HTTP or HTTPS.");
  }

  return normalized;
}
