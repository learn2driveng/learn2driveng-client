import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type {
  AvailableTrainingSession,
  LearnerJoinedSession,
  TrainingSessionParticipant,
} from "@/types/training-session";

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
    pagination:
      data?.pagination ?? {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: 0,
        totalPages: 0,
      },
  };
}

export async function joinTrainingSession(sessionId: string, bookingId: string) {
  const { data } = await api.post<ApiSuccessResponse<TrainingSessionParticipant>>(
    `/training-sessions/${encodeURIComponent(sessionId)}/join`,
    { bookingId },
  );
  return data.data;
}
