import type { InstructorLessonStatus, TrainingSessionStatus } from "@/types";

export function toInstructorLessonStatus(
  sessionStatus: TrainingSessionStatus | undefined,
  fallback: InstructorLessonStatus,
): InstructorLessonStatus {
  if (sessionStatus === "completed") return "completed";
  if (sessionStatus === "in_progress") return "in_progress";
  if (sessionStatus === "missed") return "missed";
  if (sessionStatus === "scheduled") {
    return fallback === "missed" ? "missed" : "scheduled";
  }
  if (sessionStatus === "cancelled") return "cancelled";
  return fallback;
}
