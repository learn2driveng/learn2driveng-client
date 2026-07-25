import { getApiBaseUrl } from "@/lib/api/config";
import type { ApiError } from "@/types/api";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  signal?: AbortSignal;
};

type ErrorPayload = {
  message?: string | string[];
  statusCode?: number;
  error?: string;
};

function normalizeErrorMessage(payload: ErrorPayload, fallback: string) {
  const message = payload.message;
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  return fallback;
}

async function parseJsonSafely(response: Response) {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = "GET", body, accessToken, signal } = options;
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorPayload = (payload ?? {}) as ErrorPayload;
    const apiError: ApiError = {
      message: normalizeErrorMessage(
        errorPayload,
        `Request failed (${response.status})`,
      ),
      statusCode: errorPayload.statusCode ?? response.status,
    };
    throw apiError;
  }

  return payload as T;
}
