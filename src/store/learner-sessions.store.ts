import { create } from "zustand";

import { fetchLearnerJoinedSessions } from "@/lib/api/training-sessions";
import {
  joinedSessionsToLessonCards,
  joinedSessionsToProgressLessons,
  sessionsAndParticipantsFromJoined,
} from "@/lib/learner/map-sessions";
import { useTrainingSessionStore } from "@/store/training-session.store";
import type { LearnerLessonCard, LearnerProgressLesson } from "@/types";
import type { LearnerJoinedSession } from "@/types/training-session";

interface LearnerSessionsState {
  joinedSessions: LearnerJoinedSession[];
  lessonCards: LearnerLessonCard[];
  progressLessons: LearnerProgressLesson[];
  hydrated: boolean;
  isRefreshing: boolean;
  hydrateFromApi: (joinedSessions: LearnerJoinedSession[]) => void;
  resetLearnerSessions: () => void;
  refreshJoinedSessions: () => Promise<void>;
}

function deriveState(joinedSessions: LearnerJoinedSession[]) {
  const { sessions, participantsBySessionId, activeSessionId } =
    sessionsAndParticipantsFromJoined(joinedSessions);

  useTrainingSessionStore.getState().hydrateFromApi({
    sessions,
    participantsBySessionId,
    activeSessionId,
  });

  return {
    joinedSessions,
    lessonCards: joinedSessionsToLessonCards(joinedSessions),
    progressLessons: joinedSessionsToProgressLessons(joinedSessions),
    hydrated: true,
  };
}

export const useLearnerSessionsStore = create<LearnerSessionsState>(
  (set, get) => ({
    joinedSessions: [],
    lessonCards: [],
    progressLessons: [],
    hydrated: false,
    isRefreshing: false,
    hydrateFromApi: (joinedSessions) => set(deriveState(joinedSessions)),
    resetLearnerSessions: () => {
      useTrainingSessionStore.getState().resetTrainingSessions();
      set({
        joinedSessions: [],
        lessonCards: [],
        progressLessons: [],
        hydrated: false,
        isRefreshing: false,
      });
    },
    refreshJoinedSessions: async () => {
      set({ isRefreshing: true });
      try {
        const joinedSessions = await fetchLearnerJoinedSessions();
        get().hydrateFromApi(joinedSessions);
      } finally {
        set({ isRefreshing: false });
      }
    },
  }),
);

type LessonCardGroups = {
  upcoming: LearnerLessonCard[];
  active: LearnerLessonCard | null;
};

const lessonCardGroupsCache = new WeakMap<
  LearnerLessonCard[],
  LessonCardGroups
>();

function selectLessonCardGroups(lessonCards: LearnerLessonCard[]) {
  const cached = lessonCardGroupsCache.get(lessonCards);
  if (cached) return cached;

  const groups = {
    upcoming: lessonCards.filter((item) => item.status === "scheduled"),
    active:
      lessonCards.find((item) => item.status === "in_progress") ?? null,
  };
  lessonCardGroupsCache.set(lessonCards, groups);
  return groups;
}

export function selectUpcomingLessonCards(state: LearnerSessionsState) {
  return selectLessonCardGroups(state.lessonCards).upcoming;
}

export function selectActiveLessonCard(state: LearnerSessionsState) {
  return selectLessonCardGroups(state.lessonCards).active;
}
