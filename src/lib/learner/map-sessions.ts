import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type {
  BookingListItem,
  LearnerLessonCard,
  LearnerProgressLesson,
  ProgressSkill,
} from "@/types";
import type {
  AvailableTrainingSession,
  EnrichedTrainingSession,
  LearnerJoinedSession,
  TrainingSessionParticipant,
  TrainingSessionStatus,
} from "@/types/training-session";

type EnrichedRef = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  addressLine1?: string;
};

function readRefName(value: string | EnrichedRef | undefined, fallback: string) {
  if (typeof value === "object" && value) {
    if ("name" in value && value.name) return value.name;
    if (value.firstName || value.lastName) {
      return `${value.firstName ?? ""} ${value.lastName ?? ""}`.trim();
    }
  }
  return fallback;
}

function readSession(
  participant: LearnerJoinedSession,
): EnrichedTrainingSession | null {
  return typeof participant.sessionId === "object"
    ? participant.sessionId
    : null;
}

function formatLessonDate(value?: string | null) {
  if (!value) return "Date to be confirmed";
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatLessonTime(value?: string | null) {
  if (!value) return "Time to be confirmed";
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

function sessionLocation(session: EnrichedTrainingSession | null) {
  if (!session) return "To be confirmed";
  const school = session.schoolId as string | EnrichedRef;
  if (typeof school === "object" && school) {
    return [school.addressLine1, school.city, school.state]
      .filter(Boolean)
      .join(", ");
  }
  return "To be confirmed";
}

function mapLessonStatus(
  sessionStatus?: TrainingSessionStatus,
  participantStatus?: LearnerJoinedSession["status"],
): LearnerLessonCard["status"] {
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

export function participantToLessonCard(
  participant: LearnerJoinedSession,
): LearnerLessonCard {
  const session = readSession(participant);
  const packageName = readRefName(participant.packageId, "Training package");
  const schoolName = readRefName(session?.schoolId, "Driving school");
  const instructorName = readRefName(session?.instructorId, "Instructor");

  return {
    id: participant.id,
    sessionId: session?.id ?? participant.sessionId.toString(),
    bookingId:
      typeof participant.bookingId === "object"
        ? participant.bookingId.id
        : participant.bookingId,
    participantId: participant.id,
    reference: `L2D-${participant.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    school: schoolName,
    packageName,
    date: formatLessonDate(session?.scheduledStartTime),
    time: formatLessonTime(session?.scheduledStartTime),
    location: sessionLocation(session),
    instructor: instructorName,
    status: mapLessonStatus(session?.status, participant.status),
  };
}

export function joinedSessionsToLessonCards(sessions: LearnerJoinedSession[]) {
  return sessions.map(participantToLessonCard);
}

export function participantToProgressLesson(
  participant: LearnerJoinedSession,
): LearnerProgressLesson | null {
  const session = readSession(participant);
  if (!session || session.status !== "completed") {
    return null;
  }

  const packageName = readRefName(participant.packageId, "Training package");
  const schoolName = readRefName(session.schoolId, "Driving school");
  const instructorName = readRefName(session.instructorId, "Instructor");
  const completedAt = session.actualEndTime ?? session.scheduledEndTime;

  return {
    id: participant.id,
    title: session.title || packageName,
    schoolName,
    instructorName,
    completedAt: formatLessonDate(completedAt),
    duration: formatDurationMinutes(
      session.actualStartTime ?? session.scheduledStartTime,
      completedAt,
    ),
    score: participant.status === "present" ? 100 : 0,
    focusAreas: [session.sessionType.replace(/_/g, " ")],
    feedback:
      session.notes?.trim() ||
      "Lesson completed. Review your instructor notes after your next session.",
  };
}

export function joinedSessionsToProgressLessons(
  sessions: LearnerJoinedSession[],
) {
  return sessions
    .map(participantToProgressLesson)
    .filter((lesson): lesson is LearnerProgressLesson => lesson !== null);
}

export function computeProgressSummary(
  bookings: BookingListItem[],
  joinedSessions: LearnerJoinedSession[],
) {
  const totalLessons = bookings.reduce(
    (total, booking) => total + booking.sessionsTotal,
    0,
  );
  const completedLessons = bookings.reduce(
    (total, booking) => total + booking.sessionsCompletedCount,
    0,
  );
  const remainingLessons = Math.max(totalLessons - completedLessons, 0);
  const readiness =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const completedSessions = joinedSessions.filter((item) => {
    const session = readSession(item);
    return session?.status === "completed";
  });

  const drivingMinutes = completedSessions.reduce((total, item) => {
    const session = readSession(item);
    if (!session) return total;
    const start = session.actualStartTime ?? session.scheduledStartTime;
    const end = session.actualEndTime ?? session.scheduledEndTime;
    if (!start || !end) return total;
    return (
      total +
      Math.max(
        Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000),
        0,
      )
    );
  }, 0);

  const drivingHours = Math.floor(drivingMinutes / 60);
  const drivingRemainder = drivingMinutes % 60;
  const drivingTime =
    drivingMinutes === 0
      ? "0h"
      : drivingHours > 0
        ? `${drivingHours}h ${drivingRemainder}m`
        : `${drivingRemainder}m`;

  return {
    readiness,
    completedLessons,
    totalLessons,
    remainingLessons,
    drivingTime,
    bestScore: completedLessons > 0 ? 100 : 0,
  };
}

const skillDefinitions: Array<{
  id: string;
  name: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  sessionTypes: EnrichedTrainingSession["sessionType"][];
  note: string;
}> = [
  {
    id: "vehicle-control",
    name: "Vehicle control",
    icon: "steering",
    sessionTypes: ["practical"],
    note: "Built from completed practical sessions.",
  },
  {
    id: "road-awareness",
    name: "Road awareness",
    icon: "road-variant",
    sessionTypes: ["theory", "assessment"],
    note: "Built from theory and assessment sessions.",
  },
  {
    id: "parking",
    name: "Parking",
    icon: "parking",
    sessionTypes: ["practical", "mock_test"],
    note: "Built from practical and mock test sessions.",
  },
];

export function computeProgressSkills(
  bookings: BookingListItem[],
  joinedSessions: LearnerJoinedSession[],
): ProgressSkill[] {
  const totalLessons = bookings.reduce(
    (total, booking) => total + booking.sessionsTotal,
    0,
  );
  const fallbackProgress =
    totalLessons > 0
      ? Math.round(
          (bookings.reduce(
            (total, booking) => total + booking.sessionsCompletedCount,
            0,
          ) /
            totalLessons) *
            100,
        )
      : 0;

  return skillDefinitions.map((skill) => {
    const relevantCompleted = joinedSessions.filter((item) => {
      const session = readSession(item);
      return (
        session?.status === "completed" &&
        item.status === "present" &&
        skill.sessionTypes.includes(session.sessionType)
      );
    }).length;

    const relevantTotal = joinedSessions.filter((item) => {
      const session = readSession(item);
      return (
        session && skill.sessionTypes.includes(session.sessionType)
      );
    }).length;

    const progress =
      relevantTotal > 0
        ? Math.round((relevantCompleted / relevantTotal) * 100)
        : fallbackProgress;

    return {
      id: skill.id,
      name: skill.name,
      icon: skill.icon,
      progress,
      note:
        relevantTotal > 0
          ? `${relevantCompleted} of ${relevantTotal} relevant sessions completed.`
          : skill.note,
    };
  });
}

export function groupAvailableSessionsByDate(
  sessions: AvailableTrainingSession[],
) {
  const groups = new Map<
    string,
    { id: string; label: string; sessions: AvailableTrainingSession[] }
  >();

  for (const session of sessions) {
    const date = new Date(session.scheduledStartTime);
    const id = date.toISOString().slice(0, 10);
    const label = new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(date);
    const existing = groups.get(id);
    if (existing) {
      existing.sessions.push(session);
      continue;
    }
    groups.set(id, { id, label, sessions: [session] });
  }

  return [...groups.values()];
}

export function availableSessionTimeLabel(session: AvailableTrainingSession) {
  const start = formatLessonTime(session.scheduledStartTime);
  const end = formatLessonTime(session.scheduledEndTime);
  return `${start} - ${end}`;
}

export function availableSessionInstructorLabel(
  session: AvailableTrainingSession,
) {
  return readRefName(session.instructorId, "Assigned instructor");
}

export function sessionsAndParticipantsFromJoined(
  joinedSessions: LearnerJoinedSession[],
) {
  const sessions: Record<string, EnrichedTrainingSession> = {};
  const participantsBySessionId: Record<string, TrainingSessionParticipant> = {};

  for (const item of joinedSessions) {
    if (typeof item.sessionId === "object") {
      sessions[item.sessionId.id] = item.sessionId;
    }
    participantsBySessionId[item.sessionId.toString()] = {
      id: item.id,
      sessionId:
        typeof item.sessionId === "object"
          ? item.sessionId.id
          : item.sessionId,
      learnerId: item.learnerId,
      bookingId:
        typeof item.bookingId === "object" ? item.bookingId.id : item.bookingId,
      packageId:
        typeof item.packageId === "object" ? item.packageId.id : item.packageId,
      status: item.status,
      joinedAt: item.joinedAt,
      attendanceMarkedAt: item.attendanceMarkedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  const activeSessionId =
    Object.values(sessions).find((session) => session.status === "in_progress")
      ?.id ?? null;

  return { sessions, participantsBySessionId, activeSessionId };
}

export function findJoinedSessionByParticipantId(
  joinedSessions: LearnerJoinedSession[],
  participantId: string | undefined,
) {
  return joinedSessions.find((item) => item.id === participantId);
}

export function findJoinedSessionByBookingId(
  joinedSessions: LearnerJoinedSession[],
  bookingId: string | undefined,
) {
  if (!bookingId) return undefined;
  return joinedSessions.find((item) => {
    const participantBookingId =
      typeof item.bookingId === "object" ? item.bookingId.id : item.bookingId;
    return participantBookingId === bookingId;
  });
}
