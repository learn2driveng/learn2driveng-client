import { create } from "zustand";

import type {
  EnrichedTrainingSession,
  TrainingSessionParticipant,
} from "@/types";

type TrainingSessionState = {
  sessions: Record<string, EnrichedTrainingSession>;
  participantsBySessionId: Record<string, TrainingSessionParticipant>;
  activeSessionId: string | null;
  hydrateFromApi: (input: {
    sessions: Record<string, EnrichedTrainingSession>;
    participantsBySessionId: Record<string, TrainingSessionParticipant>;
    activeSessionId: string | null;
  }) => void;
  resetTrainingSessions: () => void;
  startSession: (sessionId: string) => void;
  endSession: (sessionId: string) => void;
};

export const useTrainingSessionStore = create<TrainingSessionState>((set) => ({
  sessions: {},
  participantsBySessionId: {},
  activeSessionId: null,
  hydrateFromApi: ({ sessions, participantsBySessionId, activeSessionId }) =>
    set({
      sessions,
      participantsBySessionId,
      activeSessionId,
    }),
  resetTrainingSessions: () =>
    set({
      sessions: {},
      participantsBySessionId: {},
      activeSessionId: null,
    }),
  startSession: (sessionId) =>
    set((state) => {
      const session = state.sessions[sessionId];
      if (
        !session ||
        session.status !== "scheduled" ||
        state.activeSessionId !== null
      ) {
        return state;
      }

      return {
        activeSessionId: sessionId,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            status: "in_progress",
            actualStartTime: new Date().toISOString(),
            actualEndTime: null,
          },
        },
      };
    }),
  endSession: (sessionId) =>
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session || session.status !== "in_progress") return state;
      const endedAt = new Date().toISOString();

      return {
        activeSessionId:
          state.activeSessionId === sessionId ? null : state.activeSessionId,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            status: "completed",
            actualEndTime: endedAt,
          },
        },
      };
    }),
}));
