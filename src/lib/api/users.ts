import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, AuthUser, UpdateUserProfilePayload } from "@/types";

export async function fetchMyProfile() {
  const { data } = await api.get<ApiSuccessResponse<AuthUser>>("/users/profile");
  return data.data;
}

export async function updateMyProfile(payload: UpdateUserProfilePayload) {
  const { data } = await api.put<ApiSuccessResponse<AuthUser>>(
    "/users/profile",
    payload,
  );
  return data.data;
}
