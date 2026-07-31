import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, DrivingSchool } from "@/types";

export async function fetchMyDrivingSchool() {
  const { data } = await api.get<ApiSuccessResponse<DrivingSchool>>(
    "/driving-schools/me",
  );
  return data.data;
}
