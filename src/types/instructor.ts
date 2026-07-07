export type InstructorLessonStatus = "upcoming" | "in_progress" | "completed";

export type InstructorLessonSummary = {
  id: string;
  sessionId: string;
  bookingId: string;
  learnerId: string;
  scheduledAt: string;
  learnerName: string;
  learnerInitials: string;
  packageName: string;
  time: string;
  duration: string;
  location: string;
  transmission: "Automatic" | "Manual";
  status: InstructorLessonStatus;
};

export type InstructorProfileSummary = {
  schoolId: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  instructorId: string;
  licenceNumber: string;
  schoolName: string;
  verified: boolean;
  availableToday: boolean;
  outstandingReports: number;
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
