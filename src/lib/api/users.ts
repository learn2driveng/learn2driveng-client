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

export type MyInstructorPhotoUploadUrl = {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  headers?: Record<string, string>;
};

export async function createMyInstructorPhotoUploadUrl(input: {
  filename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}) {
  const { data } = await api.post<ApiSuccessResponse<MyInstructorPhotoUploadUrl>>(
    "/users/profile/photo/upload-url",
    input,
  );
  return data.data;
}

export type InstructorPhotoSubmission = {
  id: string;
  instructorId: string;
  status: "pending" | "approved" | "rejected" | "superseded";
  photoUrl: string;
  createdAt: string;
  instructorName?: string;
};

export async function fetchMyInstructorPhotoSubmission() {
  const { data } = await api.get<ApiSuccessResponse<InstructorPhotoSubmission | null>>(
    "/users/profile/photo-submission",
  );
  return data.data;
}

export async function submitMyInstructorPhoto(key: string) {
  const { data } = await api.put<ApiSuccessResponse<InstructorPhotoSubmission>>(
    "/users/profile/photo",
    { key },
  );
  return data.data;
}
