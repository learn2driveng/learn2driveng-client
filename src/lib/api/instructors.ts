import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, AuthUser, UserStatus } from "@/types";

export type InstructorPhotoUploadUrlResponse = {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  headers?: Record<string, string>;
};

export type CreateInstructorInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  temporaryPassword: string;
  confirmTemporaryPassword: string;
  profilePhoto?: string;
};

export type UpdateInstructorInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  profilePhoto?: string;
  status?: UserStatus;
};

export async function fetchSchoolInstructors() {
  const { data } =
    await api.get<ApiSuccessResponse<AuthUser[]>>("/instructors");
  return data.data;
}

export async function createSchoolInstructor(input: CreateInstructorInput) {
  const { data } = await api.post<ApiSuccessResponse<AuthUser>>(
    "/instructors",
    input,
  );
  return data.data;
}

export async function updateSchoolInstructor(
  instructorId: string,
  input: UpdateInstructorInput,
) {
  const { data } = await api.patch<ApiSuccessResponse<AuthUser>>(
    `/instructors/${instructorId}`,
    input,
  );
  return data.data;
}

export async function createInstructorPhotoUploadUrl(
  instructorId: string,
  input: { filename: string; mimeType: "image/jpeg" | "image/png" | "image/webp" },
) {
  const { data } = await api.post<ApiSuccessResponse<InstructorPhotoUploadUrlResponse>>(
    `/instructors/${instructorId}/photo/upload-url`,
    input,
  );
  return data.data;
}
