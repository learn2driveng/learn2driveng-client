import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type {
  AvailableTrainingSession,
  InstructorAssignedSession,
  LearnerJoinedSession,
  PublicLocationShare,
  TrainingSession,
  TrainingSessionParticipant,
  TrainingSessionType,
  RecurringTrainingSchedule,
  SessionCoordinates,
  SessionLocationHistory,
} from "@/types/training-session";

export type CreateRecurringTrainingScheduleInput = {
  instructorId: string;
  vehicleId?: string;
  eligiblePackageIds: string[];
  title: string;
  sessionType: TrainingSessionType;
  weekdays: number[];
  startTime: string;
  durationMinutes: number;
  capacity: number;
  startsOn: string;
  endsOn?: string;
  notes?: string;
};

export async function createRecurringTrainingSchedule(
  input: CreateRecurringTrainingScheduleInput,
) {
  const { data } = await api.post<
    ApiSuccessResponse<RecurringTrainingSchedule>
  >("/training-sessions/recurring", input);
  return data.data;
}

export async function fetchRecurringTrainingSchedules() {
  const { data } = await api.get<
    ApiSuccessResponse<RecurringTrainingSchedule[]>
  >("/training-sessions/recurring");
  return data.data;
}

export async function pauseRecurringTrainingSchedule(scheduleId: string) {
  const { data } = await api.post<
    ApiSuccessResponse<RecurringTrainingSchedule>
  >(`/training-sessions/recurring/${encodeURIComponent(scheduleId)}/pause`, {});
  return data.data;
}

export async function resumeRecurringTrainingSchedule(scheduleId: string) {
  const { data } = await api.post<
    ApiSuccessResponse<RecurringTrainingSchedule>
  >(
    `/training-sessions/recurring/${encodeURIComponent(scheduleId)}/resume`,
    {},
  );
  return data.data;
}

export async function updateRecurringTrainingSchedule(
  scheduleId: string,
  input: Partial<CreateRecurringTrainingScheduleInput>,
) {
  const { data } = await api.patch<
    ApiSuccessResponse<RecurringTrainingSchedule>
  >(`/training-sessions/recurring/${encodeURIComponent(scheduleId)}`, input);
  return data.data;
}

export type CreateSchoolTrainingSessionInput = {
  instructorId: string;
  vehicleId?: string;
  eligiblePackageIds: string[];
  title: string;
  sessionType: TrainingSessionType;
  scheduledStartTime: string;
  scheduledEndTime: string;
  capacity: number;
  notes?: string;
};

export type UpdateSchoolTrainingSessionInput =
  Partial<CreateSchoolTrainingSessionInput>;

export async function fetchSchoolTrainingSessions() {
  const { data } =
    await api.get<ApiSuccessResponse<TrainingSession[]>>("/training-sessions");
  return data.data;
}

export async function fetchSchoolTrainingSession(sessionId: string) {
  const { data } = await api.get<ApiSuccessResponse<TrainingSession>>(
    `/training-sessions/${encodeURIComponent(sessionId)}`,
  );
  return data.data;
}

export async function createSchoolTrainingSession(
  input: CreateSchoolTrainingSessionInput,
) {
  const { data } = await api.post<ApiSuccessResponse<TrainingSession>>(
    "/training-sessions",
    input,
  );
  return data.data;
}

export async function updateSchoolTrainingSession(
  sessionId: string,
  input: UpdateSchoolTrainingSessionInput,
) {
  const { data } = await api.patch<ApiSuccessResponse<TrainingSession>>(
    `/training-sessions/${encodeURIComponent(sessionId)}`,
    input,
  );
  return data.data;
}

export async function cancelSchoolTrainingSession(sessionId: string) {
  const { data } = await api.post<ApiSuccessResponse<TrainingSession>>(
    `/training-sessions/${encodeURIComponent(sessionId)}/cancel`,
    {},
  );
  return data.data;
}

export type AvailableTrainingSessionsQuery = {
  sessionType?: string;
  startsFrom?: string;
  startsBefore?: string;
  page?: number;
  limit?: number;
};

type AvailableSessionsResponse = {
  success: boolean;
  message?: string;
  data: AvailableTrainingSession[];
  pagination: PaginationMeta;
};

export async function fetchInstructorAssignedSessions() {
  const { data } = await api.get<
    ApiSuccessResponse<InstructorAssignedSession[]>
  >("/training-sessions/instructor/me");
  return data.data;
}

export async function fetchInstructorAssignedSession(sessionId: string) {
  const { data } = await api.get<ApiSuccessResponse<InstructorAssignedSession>>(
    `/training-sessions/instructor/me/${encodeURIComponent(sessionId)}`,
  );
  return data.data;
}

export async function startInstructorTrainingSession(sessionId: string) {
  const { data } = await api.post<
    ApiSuccessResponse<InstructorAssignedSession>
  >(`/training-sessions/${encodeURIComponent(sessionId)}/start`, {});
  return data.data;
}

export type SessionLocationPingInput = {
  latitude: number;
  longitude: number;
  accuracyInMeters?: number;
  heading?: number;
  speed?: number;
  recordedAt: string;
};

export async function recordInstructorSessionLocation(
  sessionId: string,
  location: SessionLocationPingInput,
) {
  const { data } = await api.post<
    ApiSuccessResponse<SessionCoordinates & { sessionId: string }>
  >(
    `/training-sessions/${encodeURIComponent(sessionId)}/location-pings`,
    location,
  );
  return data.data;
}

export async function endInstructorTrainingSession(
  sessionId: string,
  completionNotes?: string,
) {
  const { data } = await api.post<
    ApiSuccessResponse<InstructorAssignedSession>
  >(
    `/training-sessions/${encodeURIComponent(sessionId)}/end`,
    completionNotes ? { completionNotes } : {},
  );
  return data.data;
}

export async function markInstructorSessionAttendance(
  sessionId: string,
  participantId: string,
  status: "present" | "absent",
  report?: {
    instructorFeedback?: string;
    nextFocus?: string;
    skillRatings?: Record<string, string>;
  },
) {
  const { data } = await api.post<
    ApiSuccessResponse<TrainingSessionParticipant>
  >(`/training-sessions/${encodeURIComponent(sessionId)}/attendance`, {
    participantId,
    status,
    ...report,
  });
  return data.data;
}

export async function fetchLearnerJoinedSessions() {
  const { data } = await api.get<ApiSuccessResponse<LearnerJoinedSession[]>>(
    "/training-sessions/learner/me",
  );
  return data.data;
}

export async function fetchLearnerJoinedSession(participantId: string) {
  const { data } = await api.get<ApiSuccessResponse<LearnerJoinedSession>>(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}`,
  );
  return data.data;
}

export async function cancelLearnerTrainingSession(participantId: string) {
  const { data } = await api.post<
    ApiSuccessResponse<TrainingSessionParticipant>
  >(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/cancel`,
    {},
  );
  return data.data;
}

export async function rescheduleLearnerTrainingSession(
  participantId: string,
  targetSessionId: string,
) {
  const { data } = await api.post<
    ApiSuccessResponse<TrainingSessionParticipant>
  >(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/reschedule`,
    { targetSessionId },
  );
  return data.data;
}

export type SessionLocationShareResponse = {
  shareUrl: string;
  sessionId: string;
  expiresAt: string;
};

/** @deprecated Use fetchLearnerLocationShare */
export type LearnerLocationShare = SessionLocationShareResponse & {
  token?: string;
};

export async function fetchLearnerLocationShare(participantId: string) {
  const { data } = await api.get<ApiSuccessResponse<SessionLocationShareResponse>>(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/location-share`,
  );
  return data.data;
}

export async function createLearnerLocationShare(participantId: string) {
  const { data } = await api.post<ApiSuccessResponse<SessionLocationShareResponse>>(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/location-share`,
    {},
  );
  return data.data;
}

export async function recordLearnerSessionLocation(
  participantId: string,
  location: SessionLocationPingInput,
) {
  const { data } = await api.post<
    ApiSuccessResponse<SessionCoordinates & { sessionId: string; sourceRole: string }>
  >(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/location-pings`,
    location,
  );
  return data.data;
}

export async function revokeLearnerLocationShare(participantId: string) {
  await api.post(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/location-share/revoke`,
    {},
  );
}

export async function fetchSchoolLocationShare(sessionId: string) {
  const { data } = await api.get<ApiSuccessResponse<SessionLocationShareResponse>>(
    `/training-sessions/school/${encodeURIComponent(sessionId)}/location-share`,
  );
  return data.data;
}

export async function revokeSchoolLocationShare(sessionId: string) {
  await api.post(
    `/training-sessions/school/${encodeURIComponent(sessionId)}/location-share/revoke`,
    {},
  );
}

export async function fetchSchoolLocationHistory(sessionId: string) {
  const { data } = await api.get<ApiSuccessResponse<SessionLocationHistory>>(
    `/training-sessions/school/${encodeURIComponent(sessionId)}/location-history`,
  );
  return data.data;
}

export async function fetchLearnerLocationHistory(participantId: string) {
  const { data } = await api.get<ApiSuccessResponse<SessionLocationHistory>>(
    `/training-sessions/learner/me/${encodeURIComponent(participantId)}/location-history`,
  );
  return data.data;
}

export type PublicLessonLocationShare = PublicLocationShare;

export async function fetchPublicLessonLocationShare(token: string) {
  const { data } = await api.get<ApiSuccessResponse<PublicLessonLocationShare>>(
    `/training-sessions/location-shares/${encodeURIComponent(token)}`,
  );
  return data.data;
}

export async function fetchAvailableTrainingSessions(
  bookingId: string,
  query: AvailableTrainingSessionsQuery = {},
) {
  const { data } = await api.get<AvailableSessionsResponse>(
    `/training-sessions/bookings/${encodeURIComponent(bookingId)}/available`,
    { params: query },
  );

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function joinTrainingSession(
  sessionId: string,
  bookingId: string,
) {
  const { data } = await api.post<
    ApiSuccessResponse<TrainingSessionParticipant>
  >(`/training-sessions/${encodeURIComponent(sessionId)}/join`, { bookingId });
  return data.data;
}
