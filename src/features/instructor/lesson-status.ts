import type { InstructorLessonStatus, TrainingSessionStatus } from "@/types";

export function toInstructorLessonStatus(
  sessionStatus: TrainingSessionStatus | undefined,
  fallback: InstructorLessonStatus,
): InstructorLessonStatus {
  if (sessionStatus === "completed") return "completed";
  if (sessionStatus === "in_progress") return "in_progress";
  if (sessionStatus === "scheduled") return "scheduled";
  if (sessionStatus === "cancelled") return "cancelled";
  return fallback;
}
