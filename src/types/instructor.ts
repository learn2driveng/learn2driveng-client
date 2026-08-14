import type { VehicleTransmissionType } from "./school";
import type { TrainingSessionStatus } from "./training-session";

/** Maps scheduled/in_progress/completed for instructor lesson cards. */
export type InstructorLessonStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type InstructorLessonSummary = {
  id: string;
  sessionId: string;
  bookingId: string;
  learnerId: string;
  participantId?: string;
  scheduledAt: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  learnerName: string;
  learnerInitials: string;
  packageName: string;
  time: string;
  duration: string;
  location: string;
  transmission: VehicleTransmissionType;
  status: InstructorLessonStatus;
  sessionStatus?: TrainingSessionStatus;
  learnerCount?: number;
  learners?: {
    participantId: string;
    learnerId: string;
    name: string;
    initials: string;
    packageName: string;
    status: "scheduled" | "present" | "absent" | "cancelled";
  }[];
};

export type InstructorProfileSummary = {
  schoolId: string;
  instructorId: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  profilePhoto?: string | null;
  status?: "active" | "pending" | "suspended";
  schoolName: string;
  /** Local/UI until InstructorProfile entity exists on server. */
  licenceNumber?: string;
  verified?: boolean;
  availableToday?: boolean;
  outstandingReports?: number;
};

export type InstructorScheduleDay = {
  id: string;
  dayLabel: string;
  dateLabel: string;
  fullLabel: string;
  scheduledDuration: string;
  lessons: InstructorLessonSummary[];
};

export type InstructorAvailabilityShift = {
  id: string;
  label: string;
  description: string;
};

export type InstructorAvailabilityDay = {
  id: string;
  label: string;
  shortLabel: string;
  enabled: boolean;
  shiftId: string;
};
