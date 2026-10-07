import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";

export type InstructorAvailabilitySettings = {
  instructorId: string;
  acceptingAssignments: boolean;
  weeklyHours: { id: string; enabled: boolean; shiftId: string }[];
  timeOffDates: string[];
  updatedAt: string | null;
};

export type UpdateInstructorAvailabilityInput = Pick<
  InstructorAvailabilitySettings,
  "acceptingAssignments" | "weeklyHours" | "timeOffDates"
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
