import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";

export type InstructorAvailabilitySettings = {
  instructorId: string;
  acceptingAssignments: boolean;
  updatedAt: string | null;
};

export type UpdateInstructorAvailabilityInput = Pick<
  InstructorAvailabilitySettings,
  "acceptingAssignments"
>;

export async function fetchInstructorAvailability() {
  const { data } = await api.get<ApiSuccessResponse<InstructorAvailabilitySettings>>(
    "/instructors/me/availability",
  );
  return data.data;
}

export async function updateInstructorAvailability(
  input: UpdateInstructorAvailabilityInput,
) {
  const { data } = await api.put<ApiSuccessResponse<InstructorAvailabilitySettings>>(
    "/instructors/me/availability",
    input,
  );
  return data.data;
}
