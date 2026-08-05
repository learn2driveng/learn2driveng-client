import { api } from "@/lib/api/client";
import type {
  AddressSuggestion,
  ApiSuccessResponse,
  CreateDrivingSchoolInput,
  DrivingSchool,
  DrivingSchoolVerificationDocument,
  DrivingSchoolVerificationDocumentType,
} from "@/types";

export type UpdateDrivingSchoolInput = {
  name?: string;
  businessRegistrationNumber?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
};

export type CreateDocumentUploadUrlInput = {
  type: DrivingSchoolVerificationDocumentType;
  filename: string;
  mimeType: string;
  label?: string;
};

export type AttachDrivingSchoolDocumentInput = {
  type: DrivingSchoolVerificationDocumentType;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  label?: string;
  sizeInBytes?: number;
};

export type DocumentUploadUrlResponse = {
  key: string;
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds?: number;
  method?: "PUT";
  headers?: Record<string, string>;
};

export async function searchSchoolAddresses(
  query: string,
  signal?: AbortSignal,
) {
  const { data } = await api.get<ApiSuccessResponse<AddressSuggestion[]>>(
    "/driving-schools/address-suggestions",
    { params: { query }, signal },
  );
  return data.data;
}

export async function createDrivingSchool(input: CreateDrivingSchoolInput) {
  const { data } = await api.post<ApiSuccessResponse<DrivingSchool>>(
    "/driving-schools",
    input,
  );
  return data.data;
}

export async function fetchMyDrivingSchool() {
  const { data } = await api.get<ApiSuccessResponse<DrivingSchool>>(
    "/driving-schools/me",
  );
  return data.data;
}

export async function updateMyDrivingSchool(input: UpdateDrivingSchoolInput) {
  const { data } = await api.patch<ApiSuccessResponse<DrivingSchool>>(
    "/driving-schools/me",
    input,
  );
  return data.data;
}

export async function createSchoolDocumentUploadUrl(
  input: CreateDocumentUploadUrlInput,
) {
  const { data } = await api.post<
    ApiSuccessResponse<DocumentUploadUrlResponse>
  >("/driving-schools/me/documents/upload-url", input);
  return data.data;
}

export async function attachSchoolDocument(
  input: AttachDrivingSchoolDocumentInput,
) {
  const { data } = await api.post<
    ApiSuccessResponse<DrivingSchoolVerificationDocument[]>
  >("/driving-schools/me/documents", input);
  return data.data;
}

export async function fetchSchoolDocuments() {
  const { data } = await api.get<
    ApiSuccessResponse<DrivingSchoolVerificationDocument[]>
  >("/driving-schools/me/documents");
  return data.data;
}
