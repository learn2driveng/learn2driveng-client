const DEFAULT_API_BASE_URL = "http://localhost:7777/api/v1";

/** REST base URL including `/api/v1` (see server `main.ts`). */
export function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }

  return configured.replace(/\/+$/, "");
}
