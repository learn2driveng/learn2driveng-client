import { api } from "@/lib/api/client";
import type {
  ApiSuccessResponse,
  AuthSessionResponse,
  AuthUser,
  CompleteGoogleSignupPayload,
  GoogleAuthenticationResult,
  LoginCredentials,
  RegisterPayload,
} from "@/types";

type SignupResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: null;
  };
};

type VerificationResponse = {
  success: boolean;
  message: string;
  data: AuthSessionResponse | null;
};

type AuthActionResponse = {
  success: boolean;
  message: string;
  data: null;
};

export async function signInWithPassword(credentials: LoginCredentials) {
  const { data } = await api.post<ApiSuccessResponse<AuthSessionResponse>>(
    "/auth/sign-in",
    credentials,
  );

  return data.data;
}

export async function registerAccount(payload: RegisterPayload) {
  const { data } = await api.post<SignupResponse>("/auth/sign-up", payload);
  return data;
}

export async function verifyEmailOtp(email: string, otp: string) {
  const { data } = await api.post<VerificationResponse>("/auth/verify-otp", {
    email,
    otp,
  });

  if (!data.success || !data.data) {
    throw {
      message: data.message,
      statusCode: 400,
    };
  }

  return data.data;
}

export async function resendVerificationOtp(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>(
    "/auth/resend-verification-otp",
    { email },
  );
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data } = await api.post<AuthActionResponse>(
    "/auth/forgot-password",
    { email },
  );
  return data;
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const { data } = await api.post<AuthActionResponse>(
    "/auth/reset-password",
    payload,
  );

  if (!data.success) {
    throw {
      message: data.message,
      statusCode: 400,
    };
  }

  return data;
}

export async function getAuthenticatedUser() {
  const { data } = await api.get<ApiSuccessResponse<AuthUser>>("/auth/me");
  return data.data;
}

export async function logOutSession() {
  await api.post("/auth/logout");
}

export async function authenticateWithGoogle(idToken: string) {
  const { data } = await api.post<
    ApiSuccessResponse<GoogleAuthenticationResult>
  >("/auth/google", { idToken });

  return data.data;
}

export async function completeGoogleSignup(
  payload: CompleteGoogleSignupPayload,
) {
  const { data } = await api.post<
    ApiSuccessResponse<
      {
        status: "authenticated";
      } & AuthSessionResponse
    >
  >("/auth/google/complete-signup", payload);

  return data.data;
}

export async function linkGoogleAccount(
  linkToken: string,
  accessToken: string,
) {
  const { data } = await api.post<
    ApiSuccessResponse<
      AuthSessionResponse & {
        status: "authenticated";
        linkStatus: "linked";
      }
    >
  >(
    "/auth/google/link",
    { linkToken },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  return data.data;
}
