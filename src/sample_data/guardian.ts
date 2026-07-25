import type {
  GuardianLearnerSummary,
  GuardianLinkView,
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

export const guardianLinks: GuardianLinkView[] = [
  {
    id: "guardian-link-alex",
    guardianUserId: guardianProfile.id,
    learnerUserId: studentProfile.id,
    relationship: "parent",
    status: "approved",
    approvedAt: "2026-05-18T09:30:00.000Z",
    rejectedAt: null,
    revokedAt: null,
    createdAt: "2026-05-18T09:30:00.000Z",
    guardianName: guardianProfile.name,
    guardianInitials: guardianProfile.initials,
    guardianContact: "+234 800 123 4567",
    learnerName: studentProfile.name,
    learnerInitials: studentProfile.initials,
  },
  {
    id: "guardian-link-sam",
    guardianUserId: "guardian-sam",
    learnerUserId: studentProfile.id,
    relationship: "other",
    status: "pending",
    approvedAt: null,
    rejectedAt: null,
    revokedAt: null,
    createdAt: "2026-07-01T09:30:00.000Z",
    guardianName: "Samuel Okafor",
    guardianInitials: "SO",
    guardianContact: "samuel.okafor@example.com",
    learnerName: studentProfile.name,
    learnerInitials: studentProfile.initials,
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
