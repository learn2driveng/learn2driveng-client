import type {
  InstructorAvailabilityDay,
  InstructorAvailabilityShift,
  InstructorLessonSummary,
  InstructorProfileSummary,
  InstructorScheduleDay,
  TrainingSession,
} from "@/types";
import { studentProfile } from "./student";

const previewSessionStartedAt = new Date(
  Date.now() - 12 * 60 * 1000,
).toISOString();

/** Presentation fixtures for the instructor experience. */
export const instructorProfile: InstructorProfileSummary = {
  schoolId: "school-elite-safety",
  name: "John Adeyemi",
  initials: "JA",
  email: "john.ade@example.com",
  phone: "+234 803 555 0142",
  instructorId: "L2D-INS-1048",
  licenceNumber: "LAG-DI-28419",
  schoolName: "Elite Safety Driving Academy",
  verified: true,
  availableToday: true,
  outstandingReports: 1,
};

export const instructorScheduleDays: InstructorScheduleDay[] = [
  {
    id: "2026-07-03",
    dayLabel: "Today",
    dateLabel: "3 Jul",
    fullLabel: "Today, 3 July",
    scheduledDuration: "5h",
    lessons: [
      {
        id: "lesson-ife-0800",
        sessionId: "session-ife-0800",
        bookingId: "booking-ife-0800",
        learnerId: "learner-ife",
        scheduledAt: "2026-07-03T08:00:00.000+01:00",
        learnerName: "Ife Williams",
        learnerInitials: "IW",
        packageName: "Road Ready Starter",
        time: "8:00 AM",
        duration: "1 hr",
        location: "Lekki Training Centre",
        transmission: "Automatic",
        status: "completed",
      },
      {
        id: "lesson-alex-1000",
        sessionId: "session-alex-1000",
        bookingId: "booking-alex-1000",
        learnerId: studentProfile.id,
        scheduledAt: "2026-07-03T10:00:00.000+01:00",
        learnerName: studentProfile.name,
        learnerInitials: studentProfile.initials,
        packageName: "Defensive Driving Pro",
        time: "10:00 AM",
        duration: "1 hr 30 min",
        location: "Lekki Training Centre",
        transmission: "Automatic",
        status: "in_progress",
      },
      {
        id: "lesson-chidi-1230",
        sessionId: "session-chidi-1230",
        bookingId: "booking-chidi-1230",
        learnerId: "learner-chidi",
        scheduledAt: "2026-07-03T12:30:00.000+01:00",
        learnerName: "Chidi Eze",
        learnerInitials: "CE",
        packageName: "Road Ready Starter",
        time: "12:30 PM",
        duration: "1 hr",
        location: "Lekki Training Centre",
        transmission: "Manual",
        status: "upcoming",
      },
      {
        id: "lesson-zainab-1500",
        sessionId: "session-zainab-1500",
        bookingId: "booking-zainab-1500",
        learnerId: "learner-zainab",
        scheduledAt: "2026-07-03T15:00:00.000+01:00",
        learnerName: "Zainab Musa",
        learnerInitials: "ZM",
        packageName: "City Confidence",
        time: "3:00 PM",
        duration: "1 hr 30 min",
        location: "Victoria Island Route",
        transmission: "Automatic",
        status: "upcoming",
      },
    ],
  },
  {
    id: "2026-07-04",
    dayLabel: "Sat",
    dateLabel: "4 Jul",
    fullLabel: "Saturday, 4 July",
    scheduledDuration: "3h",
    lessons: [
      {
        id: "lesson-david-0900",
        sessionId: "session-david-0900",
        bookingId: "booking-david-0900",
        learnerId: "learner-david",
        scheduledAt: "2026-07-04T09:00:00.000+01:00",
        learnerName: "David Mensah",
        learnerInitials: "DM",
        packageName: "Defensive Driving Pro",
        time: "9:00 AM",
        duration: "1 hr 30 min",
        location: "Lekki Training Centre",
        transmission: "Automatic",
        status: "upcoming",
      },
      {
        id: "lesson-mariam-1130",
        sessionId: "session-mariam-1130",
        bookingId: "booking-mariam-1130",
        learnerId: "learner-mariam",
        scheduledAt: "2026-07-04T11:30:00.000+01:00",
        learnerName: "Mariam Bello",
        learnerInitials: "MB",
        packageName: "Professional Plan",
        time: "11:30 AM",
        duration: "1 hr 30 min",
        location: "Victoria Island Route",
        transmission: "Manual",
        status: "upcoming",
      },
    ],
  },
  {
    id: "2026-07-05",
    dayLabel: "Sun",
    dateLabel: "5 Jul",
    fullLabel: "Sunday, 5 July",
    scheduledDuration: "0h",
    lessons: [],
  },
  {
    id: "2026-07-06",
    dayLabel: "Mon",
    dateLabel: "6 Jul",
    fullLabel: "Monday, 6 July",
    scheduledDuration: "1h 30m",
    lessons: [
      {
        id: "lesson-tomi-1000",
        sessionId: "session-tomi-1000",
        bookingId: "booking-tomi-1000",
        learnerId: "learner-tomi",
        scheduledAt: "2026-07-06T10:00:00.000+01:00",
        learnerName: "Tomi Adeola",
        learnerInitials: "TA",
        packageName: "City Confidence",
        time: "10:00 AM",
        duration: "1 hr 30 min",
        location: "Lekki Training Centre",
        transmission: "Automatic",
        status: "upcoming",
      },
    ],
  },
];

export const instructorTrainingSessions: TrainingSession[] =
  instructorScheduleDays.flatMap((day) =>
    day.lessons.map((lesson) => ({
      id: lesson.sessionId,
      bookingId: lesson.bookingId,
      learnerId: lesson.learnerId,
      instructorId: instructorProfile.instructorId,
      schoolId: instructorProfile.schoolId,
      status:
        lesson.status === "in_progress"
          ? "active"
          : lesson.status === "completed"
            ? "completed"
            : "scheduled",
      scheduledAt: lesson.scheduledAt,
      startedAt:
        lesson.status === "in_progress" ? previewSessionStartedAt : null,
      endedAt: null,
    })),
  );

export const instructorTodayLessons =
  instructorScheduleDays.find((day) => day.dayLabel === "Today")?.lessons ?? [];

export function getInstructorLessonContext(lessonId: string | undefined) {
  for (const day of instructorScheduleDays) {
    const lesson = day.lessons.find((item) => item.id === lessonId);
    if (lesson) return { lesson, day };
  }

  return undefined;
}

export function getInstructorLessonContextBySessionId(
  sessionId: string | undefined,
) {
  for (const day of instructorScheduleDays) {
    const lesson = day.lessons.find((item) => item.sessionId === sessionId);
    if (lesson) return { lesson, day };
  }

  return undefined;
}

export const instructorAvailabilityShifts: InstructorAvailabilityShift[] = [
  {
    id: "early",
    label: "8:00 AM – 4:00 PM",
    description: "Early teaching shift",
  },
  {
    id: "standard",
    label: "9:00 AM – 5:00 PM",
    description: "Standard teaching shift",
  },
  {
    id: "late",
    label: "10:00 AM – 6:00 PM",
    description: "Late teaching shift",
  },
  {
    id: "weekend",
    label: "9:00 AM – 2:00 PM",
    description: "Short weekend shift",
  },
];

export const instructorWeeklyAvailability: InstructorAvailabilityDay[] = [
  {
    id: "monday",
    label: "Monday",
    shortLabel: "Mon",
    enabled: true,
    shiftId: "standard",
  },
  {
    id: "tuesday",
    label: "Tuesday",
    shortLabel: "Tue",
    enabled: true,
    shiftId: "standard",
  },
  {
    id: "wednesday",
    label: "Wednesday",
    shortLabel: "Wed",
    enabled: true,
    shiftId: "standard",
  },
  {
    id: "thursday",
    label: "Thursday",
    shortLabel: "Thu",
    enabled: true,
    shiftId: "late",
  },
  {
    id: "friday",
    label: "Friday",
    shortLabel: "Fri",
    enabled: true,
    shiftId: "standard",
  },
  {
    id: "saturday",
    label: "Saturday",
    shortLabel: "Sat",
    enabled: true,
    shiftId: "weekend",
  },
  {
    id: "sunday",
    label: "Sunday",
    shortLabel: "Sun",
    enabled: false,
    shiftId: "weekend",
  },
];

export const instructorTimeOffOptions = [
  {
    id: "2026-07-06",
    label: "Monday, 6 July",
    description: "Full day",
  },
  {
    id: "2026-07-11",
    label: "Saturday, 11 July",
    description: "Full day",
  },
  {
    id: "2026-07-15",
    label: "Wednesday, 15 July",
    description: "Full day",
  },
  {
    id: "2026-07-20",
    label: "Monday, 20 July",
    description: "Full day",
  },
] as const;
