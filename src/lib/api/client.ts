import {
  create,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { getApiBaseUrl } from "@/lib/api/config";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError, ApiSuccessResponse, AuthTokens } from "@/types";

type ErrorPayload = Partial<ApiError> & {
  message?: string | string[];
  error?: string;
  errors?: string[];
};

export const api = create({
  baseURL: getApiBaseUrl(),
  headers: { Accept: "application/json" },
});

const refreshApi = create({
  baseURL: getApiBaseUrl(),
  headers: { Accept: "application/json" },
});

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string> | null = null;

function normalizeApiError(error: AxiosError<ErrorPayload>): ApiError {
  const payload = error.response?.data;
  const message = Array.isArray(payload?.message)
    ? payload.message.join(", ")
    : payload?.message || payload?.error || error.message;

  return {
    message,
    statusCode: payload?.statusCode ?? error.response?.status ?? 0,
    code: payload?.code,
    details:
      payload?.details ??
      (payload?.errors ? { request: payload.errors } : undefined),
  };
}

async function refreshAccessToken() {
  const { refreshToken, updateTokens } = useAuthStore.getState();
  if (!refreshToken) throw new Error("Refresh token is unavailable.");

  const { data } = await refreshApi.post<ApiSuccessResponse<AuthTokens>>(
    "/auth/refresh",
    undefined,
    { headers: { Authorization: `Bearer ${refreshToken}` } },
  );

  await updateTokens(data.data);
  return data.data.accessToken;
}

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorPayload>) => {
    const request = error.config as RetryableRequest | undefined;
    const refreshToken = useAuthStore.getState().refreshToken;
    const isAuthenticationRequest =
      request?.url?.startsWith("/auth/sign-in") ||
      request?.url?.startsWith("/auth/google") ||
      request?.url?.startsWith("/auth/verify-otp") ||
      request?.url?.startsWith("/auth/sign-up") ||
      request?.url?.startsWith("/auth/forgot-password") ||
      request?.url?.startsWith("/auth/reset-password") ||
      request?.url?.startsWith("/auth/resend-verification-otp");

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isAuthenticationRequest &&
      refreshToken
    ) {
      request._retry = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        request.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(request);
      } catch {
        await useAuthStore.getState().signOut();
        return Promise.reject({
          message: "Your session has expired. Please sign in again.",
          statusCode: 401,
          code: "SESSION_EXPIRED",
        } satisfies ApiError);
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);
