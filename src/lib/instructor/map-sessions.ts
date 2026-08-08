import type {
  InstructorLessonSummary,
  InstructorScheduleDay,
  VehicleTransmissionType,
} from "@/types";
import type {
  EnrichedLearnerRef,
  EnrichedTrainingSession,
  EnrichedVehicleRef,
  InstructorAssignedSession,
  InstructorSessionParticipant,
  TrainingSessionParticipant,
  TrainingSessionStatus,
} from "@/types/training-session";

type LessonContext = {
  lesson: InstructorLessonSummary;
  day: InstructorScheduleDay;
};

function readRefName(
  value:
    | string
    | {
        id?: string;
        name?: string;
        firstName?: string;
        lastName?: string;
      }
    | undefined,
  fallback: string,
) {
  if (typeof value === "object" && value) {
    if ("name" in value && value.name) return value.name;
    if (value.firstName || value.lastName) {
      return `${value.firstName ?? ""} ${value.lastName ?? ""}`.trim();
    }
  }
  return fallback;
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatLessonTime(value?: string | null) {
  if (!value) return "Time pending";
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDurationMinutes(start?: string | null, end?: string | null) {
  if (!start || !end) return "Duration pending";
  const minutes = Math.max(
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
    0,
  );
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function sessionLocation(session: EnrichedTrainingSession) {
  const school = session.schoolId;
  if (typeof school === "object" && school) {
    return [school.addressLine1, school.city, school.state]
      .filter(Boolean)
      .join(", ");
  }
  return "To be confirmed";
}

function readTransmission(
  vehicle: EnrichedTrainingSession["vehicleId"],
): VehicleTransmissionType {
  if (typeof vehicle === "object" && vehicle?.transmissionType) {
    return vehicle.transmissionType;
  }
  return "automatic";
}

function mapLessonStatus(
  sessionStatus: TrainingSessionStatus,
  participantStatus?: InstructorSessionParticipant["status"],
): InstructorLessonSummary["status"] {
  if (
    sessionStatus === "cancelled" ||
    participantStatus === "cancelled"
  ) {
    return "cancelled";
  }
  if (sessionStatus === "completed" || participantStatus === "present") {
    return "completed";
  }
  if (sessionStatus === "in_progress") {
    return "in_progress";
  }
  return "scheduled";
}

function dayLabels(date: Date, now: Date) {
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();

  const dayLabel = sameDay
    ? "Today"
    : isTomorrow
      ? "Tomorrow"
      : new Intl.DateTimeFormat("en-NG", { weekday: "short" }).format(date);
  const dateLabel = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
  }).format(date);
  const fullLabel = sameDay
    ? `Today, ${new Intl.DateTimeFormat("en-NG", {
        day: "numeric",
        month: "long",
      }).format(date)}`
    : new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(date);

  return { dayLabel, dateLabel, fullLabel };
}

function participantToLesson(
  session: InstructorAssignedSession,
  participant: InstructorSessionParticipant,
): InstructorLessonSummary {
  const learnerName = readRefName(participant.learnerId, "Assigned learner");
  const packageName = readRefName(participant.packageId, session.title);

  return {
    id: participant.id,
    sessionId: session.id,
    bookingId:
      typeof participant.bookingId === "object"
        ? participant.bookingId.id
        : participant.bookingId,
    learnerId:
      typeof participant.learnerId === "object"
        ? participant.learnerId.id
        : participant.learnerId,
    participantId: participant.id,
    scheduledAt: session.scheduledStartTime,
    scheduledStartTime: session.scheduledStartTime,
    scheduledEndTime: session.scheduledEndTime,
    learnerName,
    learnerInitials: initialsFromName(learnerName),
    packageName,
    time: formatLessonTime(session.scheduledStartTime),
    duration: formatDurationMinutes(
      session.scheduledStartTime,
      session.scheduledEndTime,
    ),
    location: sessionLocation(session),
    transmission: readTransmission(session.vehicleId),
    status: mapLessonStatus(session.status, participant.status),
    sessionStatus: session.status,
  };
}

function sessionToPlaceholderLesson(
  session: InstructorAssignedSession,
): InstructorLessonSummary {
  return {
    id: session.id,
    sessionId: session.id,
    bookingId: "",
    learnerId: "",
    scheduledAt: session.scheduledStartTime,
    scheduledStartTime: session.scheduledStartTime,
    scheduledEndTime: session.scheduledEndTime,
    learnerName: "No learner assigned",
    learnerInitials: "NA",
    packageName: session.title,
    time: formatLessonTime(session.scheduledStartTime),
    duration: formatDurationMinutes(
      session.scheduledStartTime,
      session.scheduledEndTime,
    ),
    location: sessionLocation(session),
    transmission: readTransmission(session.vehicleId),
    status: mapLessonStatus(session.status),
    sessionStatus: session.status,
  };
}

export function assignedSessionsToLessons(sessions: InstructorAssignedSession[]) {
  return sessions.flatMap((session) =>
    session.participants.length > 0
      ? session.participants.map((participant) =>
          participantToLesson(session, participant),
        )
      : [sessionToPlaceholderLesson(session)],
  );
}

export function assignedSessionsToScheduleDays(
  sessions: InstructorAssignedSession[],
): InstructorScheduleDay[] {
  const now = new Date();
  const lessons = assignedSessionsToLessons(sessions);
  const groups = new Map<string, InstructorScheduleDay>();

  for (const lesson of lessons) {
    const date = new Date(lesson.scheduledStartTime ?? lesson.scheduledAt);
    const id = date.toISOString().slice(0, 10);
    const labels = dayLabels(date, now);
    const existing = groups.get(id);

    if (existing) {
      existing.lessons.push(lesson);
      continue;
    }

    groups.set(id, {
      id,
      ...labels,
      scheduledDuration: "0h",
      lessons: [lesson],
    });
  }

  return [...groups.values()]
    .map((day) => {
      const totalMinutes = day.lessons.reduce((total, lesson) => {
        if (!lesson.scheduledStartTime || !lesson.scheduledEndTime) {
          return total + 60;
        }
        return (
          total +
          Math.max(
            Math.round(
              (new Date(lesson.scheduledEndTime).getTime() -
                new Date(lesson.scheduledStartTime).getTime()) /
                60000,
            ),
            0,
          )
        );
      }, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const scheduledDuration =
        hours > 0
          ? minutes > 0
            ? `${hours}h ${minutes}m`
            : `${hours}h`
          : `${minutes}m`;

      return {
        ...day,
        scheduledDuration,
        lessons: [...day.lessons].sort(
          (left, right) =>
            new Date(left.scheduledStartTime ?? left.scheduledAt).getTime() -
            new Date(right.scheduledStartTime ?? right.scheduledAt).getTime(),
        ),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function selectTodayLessons(scheduleDays: InstructorScheduleDay[]) {
  const today = scheduleDays.find((day) => day.dayLabel === "Today");
  return today?.lessons ?? [];
}

export function countOutstandingReports(sessions: InstructorAssignedSession[]) {
  return sessions.filter((session) => session.status === "in_progress").length;
}

export function readSchoolNameFromSessions(
  sessions: InstructorAssignedSession[],
) {
  for (const session of sessions) {
    const school = session.schoolId;
    if (typeof school === "object" && school?.name) {
      return school.name;
    }
  }
  return "Driving school";
}

export function readInstructorNameFromSession(
  session: EnrichedTrainingSession | undefined,
) {
  return readRefName(session?.instructorId, "Instructor");
}

export function sessionsAndParticipantsFromAssigned(
  sessions: InstructorAssignedSession[],
) {
  const sessionMap: Record<string, EnrichedTrainingSession> = {};
  const participantsBySessionId: Record<string, TrainingSessionParticipant> = {};

  for (const session of sessions) {
    const { participants, ...sessionRecord } = session;
    sessionMap[session.id] = sessionRecord;

    const primaryParticipant = participants[0];
    if (primaryParticipant) {
      participantsBySessionId[session.id] = {
        id: primaryParticipant.id,
        sessionId: session.id,
        learnerId:
          typeof primaryParticipant.learnerId === "object"
            ? primaryParticipant.learnerId.id
            : primaryParticipant.learnerId,
        bookingId:
          typeof primaryParticipant.bookingId === "object"
            ? primaryParticipant.bookingId.id
            : primaryParticipant.bookingId,
        packageId:
          typeof primaryParticipant.packageId === "object"
            ? primaryParticipant.packageId.id
            : primaryParticipant.packageId,
        status: primaryParticipant.status,
        joinedAt: primaryParticipant.joinedAt,
        attendanceMarkedAt: primaryParticipant.attendanceMarkedAt,
        createdAt: primaryParticipant.createdAt,
        updatedAt: primaryParticipant.updatedAt,
      };
    }
  }

  const activeSessionId =
    sessions.find((session) => session.status === "in_progress")?.id ?? null;

  return { sessions: sessionMap, participantsBySessionId, activeSessionId };
}

export function findLessonContext(
  scheduleDays: InstructorScheduleDay[],
  lessonId: string | undefined,
): LessonContext | undefined {
  if (!lessonId) return undefined;

  for (const day of scheduleDays) {
    const lesson = day.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return { lesson, day };
    }
  }

  return undefined;
}

export function findLessonContextBySessionId(
  scheduleDays: InstructorScheduleDay[],
  sessionId: string | undefined,
): LessonContext | undefined {
  if (!sessionId) return undefined;

  for (const day of scheduleDays) {
    const lesson = day.lessons.find((item) => item.sessionId === sessionId);
    if (lesson) {
      return { lesson, day };
    }
  }

  return undefined;
}

export function sessionDisplayLocation(session: EnrichedTrainingSession) {
  return sessionLocation(session);
}

export function readLearnerLabelFromParticipant(
  participant: TrainingSessionParticipant | undefined,
) {
  if (!participant?.learnerId) return "Learner";
  return participant.learnerId;
}
