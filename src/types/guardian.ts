export type GuardianRelationship =
  | "parent"
  | "sibling"
  | "spouse"
  | "guardian"
  | "other";

export type GuardianLinkStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";

export type GuardianLinkResponseAction = "approve" | "reject";

/** Canonical guardian link (server GuardianLink). */
export type GuardianLink = {
  id: string;
  guardianUserId: string;
  learnerUserId: string;
  relationship: GuardianRelationship;
  status: GuardianLinkStatus;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type CreateGuardianLinkPayload = {
  learnerId: string;
  relationship?: GuardianRelationship;
};

export type RespondGuardianLinkPayload = {
  action: GuardianLinkResponseAction;
};

/**
 * Enriched link for UI lists (names/contacts from joined user profiles).
 */
export type GuardianLinkView = GuardianLink & {
  guardianName: string;
  guardianInitials: string;
  guardianContact: string;
  learnerName: string;
  learnerInitials: string;
};

export type GuardianProfileSummary = {
  id: string;
  name: string;
  firstName: string;
  initials: string;
};

export type GuardianLearnerNextSession = {
  bookingId: string;
  sessionId?: string;
  dateLabel: string;
  timeLabel: string;
  instructorName: string;
  location: string;
};

export type GuardianLearnerSummary = {
  id: string;
  guardianLinkId: string;
  name: string;
  initials: string;
  relationshipLabel: string;
  schoolName: string;
  activePackageName: string;
  completedSessions: number;
  totalSessions: number;
  nextSession: GuardianLearnerNextSession | null;
};
