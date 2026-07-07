import { create } from "zustand";

import { guardianLocationShares } from "@/sample_data/guardian";
import { instructorTrainingSessions } from "@/sample_data/instructor";
import type {
  LiveLocationShare,
  LocationSharingFailureReason,
  SessionCoordinates,
  TrainingSession,
} from "@/types";

type TrainingSessionState = {
  sessions: Record<string, TrainingSession>;
  activeSessionId: string | null;
  locationShares: Record<string, LiveLocationShare>;
  devicePublishingSessionId: string | null;
  startSession: (sessionId: string) => void;
  endSession: (sessionId: string) => void;
  requestLocationSharing: (
    sessionId: string,
    learnerId: string,
    guardianLinkIds: string[],
  ) => void;
  startLocationSharing: (
    sessionId: string,
    location: SessionCoordinates,
  ) => void;
  updateSharedLocation: (
    sessionId: string,
    location: SessionCoordinates,
  ) => void;
  failLocationSharing: (
    sessionId: string,
    reason: LocationSharingFailureReason,
  ) => void;
  stopLocationSharing: (sessionId: string) => void;
};

const initialSessions = Object.fromEntries(
  instructorTrainingSessions.map((session) => [session.id, session]),
);
const initialActiveSessionId =
  instructorTrainingSessions.find((session) => session.status === "active")
    ?.id ?? null;
const initialLocationShares = Object.fromEntries(
  guardianLocationShares.map((share) => [share.sessionId, share]),
);

export const useTrainingSessionStore = create<TrainingSessionState>((set) => ({
  sessions: initialSessions,
  activeSessionId: initialActiveSessionId,
  locationShares: initialLocationShares,
  devicePublishingSessionId: null,
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
            status: "active",
            startedAt: new Date().toISOString(),
            endedAt: null,
          },
        },
      };
    }),
  endSession: (sessionId) =>
    set((state) => {
      const session = state.sessions[sessionId];
      if (!session || session.status !== "active") return state;
      const locationShare = state.locationShares[sessionId];
      const endedAt = new Date().toISOString();

      return {
        activeSessionId:
          state.activeSessionId === sessionId ? null : state.activeSessionId,
        devicePublishingSessionId:
          state.devicePublishingSessionId === sessionId
            ? null
            : state.devicePublishingSessionId,
        locationShares: locationShare
          ? {
              ...state.locationShares,
              [sessionId]: {
                ...locationShare,
                status: "stopped",
                endedAt,
              },
            }
          : state.locationShares,
        sessions: {
          ...state.sessions,
          [sessionId]: {
            ...session,
            status: "completed",
            endedAt,
          },
        },
      };
    }),
  requestLocationSharing: (sessionId, learnerId, guardianLinkIds) =>
    set((state) => {
      const session = state.sessions[sessionId];
      if (
        !session ||
        session.status !== "active" ||
        session.learnerId !== learnerId ||
        guardianLinkIds.length === 0
      ) {
        return state;
      }

      return {
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            sessionId,
            learnerId,
            guardianLinkIds,
            status: "requesting_permission",
            lastLocation: null,
            lastUpdatedAt: null,
            startedAt: null,
            endedAt: null,
            failureReason: null,
          },
        },
      };
    }),
  startLocationSharing: (sessionId, location) =>
    set((state) => {
      const session = state.sessions[sessionId];
      const share = state.locationShares[sessionId];
      if (
        !session ||
        session.status !== "active" ||
        !share ||
        share.status !== "requesting_permission"
      ) {
        return state;
      }

      const timestamp = new Date().toISOString();
      return {
        devicePublishingSessionId: sessionId,
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            ...share,
            status: "sharing",
            lastLocation: location,
            lastUpdatedAt: timestamp,
            startedAt: timestamp,
            failureReason: null,
          },
        },
      };
    }),
  updateSharedLocation: (sessionId, location) =>
    set((state) => {
      const share = state.locationShares[sessionId];
      if (!share || share.status !== "sharing") return state;

      return {
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            ...share,
            lastLocation: location,
            lastUpdatedAt: new Date().toISOString(),
          },
        },
      };
    }),
  failLocationSharing: (sessionId, reason) =>
    set((state) => {
      const share = state.locationShares[sessionId];
      if (!share) return state;

      return {
        devicePublishingSessionId:
          state.devicePublishingSessionId === sessionId
            ? null
            : state.devicePublishingSessionId,
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            ...share,
            status: "failed",
            failureReason: reason,
            endedAt: new Date().toISOString(),
          },
        },
      };
    }),
  stopLocationSharing: (sessionId) =>
    set((state) => {
      const share = state.locationShares[sessionId];
      if (!share) return state;

      return {
        devicePublishingSessionId:
          state.devicePublishingSessionId === sessionId
            ? null
            : state.devicePublishingSessionId,
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            ...share,
            status: "stopped",
            endedAt: new Date().toISOString(),
          },
        },
      };
    }),
}));
