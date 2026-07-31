import { api } from "@/lib/api/client";
import type {
  AddressSuggestion,
  ApiSuccessResponse,
  CreateDrivingSchoolInput,
  DrivingSchool,
} from "@/types";

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
