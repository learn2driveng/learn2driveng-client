import { create } from "zustand";

import {
  instructorTrainingSessionParticipants,
  instructorTrainingSessions,
} from "@/sample_data/instructor";
import type {
  LiveLocationShare,
  LocationSharingFailureReason,
  SessionCoordinates,
  TrainingSession,
  TrainingSessionParticipant,
} from "@/types";

type TrainingSessionState = {
  sessions: Record<string, TrainingSession>;
  participantsBySessionId: Record<string, TrainingSessionParticipant>;
  activeSessionId: string | null;
  locationShares: Record<string, LiveLocationShare>;
  devicePublishingSessionId: string | null;
  startSession: (sessionId: string) => void;
  endSession: (sessionId: string) => void;
  requestLocationSharing: (sessionId: string, learnerId: string) => void;
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
  instructorTrainingSessions.find((session) => session.status === "in_progress")
    ?.id ?? null;
const initialParticipantsBySessionId = Object.fromEntries(
  instructorTrainingSessionParticipants.map((participant) => [
    participant.sessionId,
    participant,
  ]),
);

const PUBLIC_APP_URL = (
  process.env.EXPO_PUBLIC_WEB_APP_URL ?? "https://learn2drive.ng"
).replace(/\/+$/, "");

function createPreviewShareToken() {
  return [
    Date.now().toString(36),
    Math.random().toString(36).slice(2),
    Math.random().toString(36).slice(2),
  ].join("-");
}

function createShareUrl(token: string) {
  return `${PUBLIC_APP_URL}/track/${encodeURIComponent(token)}`;
}

export const useTrainingSessionStore = create<TrainingSessionState>((set) => ({
  sessions: initialSessions,
  participantsBySessionId: initialParticipantsBySessionId,
  activeSessionId: initialActiveSessionId,
  locationShares: {},
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
            actualEndTime: endedAt,
          },
        },
      };
    }),
  requestLocationSharing: (sessionId, learnerId) =>
    set((state) => {
      const session = state.sessions[sessionId];
      if (
        !session ||
        session.status !== "in_progress" ||
        state.participantsBySessionId[sessionId]?.learnerId !== learnerId
      ) {
        return state;
      }

      const shareToken = createPreviewShareToken();
      return {
        locationShares: {
          ...state.locationShares,
          [sessionId]: {
            sessionId,
            learnerId,
            shareToken,
            shareUrl: createShareUrl(shareToken),
            expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
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
        session.status !== "in_progress" ||
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
