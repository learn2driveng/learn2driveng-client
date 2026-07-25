export type UserRole =
  | "learner"
  | "guardian"
  | "instructor"
  | "driving_school"
  | "admin";

export type UserStatus = "active" | "pending" | "suspended";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Authenticated user profile returned by auth/user endpoints. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  status: UserStatus;
  isEmailVerified: boolean;
  profilePhoto?: string | null;
  dateOfBirth?: string;
  schoolId?: string | null;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/** Login uses email or phone as `identifier` (server SignInDto). */
export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  dateOfBirth: string;
  acceptTerms: true;
  role?: Extract<UserRole, "learner" | "guardian" | "driving_school">;
}

export interface AuthSessionResponse {
  user: AuthUser;
  accessToken: string | null;
  refreshToken?: string;
}
