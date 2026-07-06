import type {
  GuardianLearnerSummary,
  GuardianLink,
  GuardianProfileSummary,
  LiveLocationShare,
} from "@/types";
import { studentProfile } from "./student";

/** Presentation fixtures for the guardian experience. */
export const guardianProfile: GuardianProfileSummary = {
  id: "guardian-helen",
  name: "Helen Jordan",
  firstName: "Helen",
  initials: "HJ",
};

export const guardianLinks: GuardianLink[] = [
  {
    id: "guardian-link-alex",
    guardianId: guardianProfile.id,
    guardianName: guardianProfile.name,
    guardianInitials: guardianProfile.initials,
    learnerId: studentProfile.id,
    learnerName: studentProfile.name,
    learnerInitials: studentProfile.initials,
    relationship: "parent",
    status: "active",
    linkedAt: "2026-05-18T09:30:00.000Z",
  },
];

export const guardianLearners: GuardianLearnerSummary[] = [
  {
    id: studentProfile.id,
    guardianLinkId: "guardian-link-alex",
    name: studentProfile.name,
    initials: studentProfile.initials,
    relationshipLabel: "Son",
    schoolName: "Elite Safety Driving Academy",
    activePackageName: "Defensive Driving Pro",
    completedSessions: 6,
    totalSessions: 10,
    nextSession: null,
  },
];

const previewLocationTimestamp = new Date().toISOString();

export const guardianLocationShares: LiveLocationShare[] = [
  {
    sessionId: "session-alex-1000",
    learnerId: studentProfile.id,
    guardianLinkIds: ["guardian-link-alex"],
    status: "sharing",
    lastLocation: {
      latitude: 6.4474,
      longitude: 3.4723,
      accuracy: 14,
    },
    lastUpdatedAt: previewLocationTimestamp,
    startedAt: previewLocationTimestamp,
    endedAt: null,
    failureReason: null,
  },
];

export function getGuardianLearner(learnerId: string | undefined) {
  return guardianLearners.find((learner) => learner.id === learnerId);
}
