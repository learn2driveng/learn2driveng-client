import type { InstructorLessonStatus, TrainingSessionStatus } from "@/types";

export function toInstructorLessonStatus(
  sessionStatus: TrainingSessionStatus | undefined,
  fallback: InstructorLessonStatus,
): InstructorLessonStatus {
  if (sessionStatus === "active") return "in_progress";
  if (sessionStatus === "completed") return "completed";
  if (sessionStatus === "scheduled") return "upcoming";
  return fallback;
}
