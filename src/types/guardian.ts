export type GuardianRelationship =
  | "parent"
  | "legal_guardian"
  | "family_member"
  | "other";

export type GuardianInviteStatus = "draft" | "sent" | "accepted" | "expired";

export type GuardianLinkStatus = "pending" | "active" | "revoked" | "expired";

export type GuardianLink = {
  id: string;
  guardianId: string;
  guardianName: string;
  guardianInitials: string;
  guardianContact: string;
  learnerId: string;
  learnerName: string;
  learnerInitials: string;
  relationship: GuardianRelationship;
  status: GuardianLinkStatus;
  inviteStatus: GuardianInviteStatus;
  linkedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  lastAccessedAt: string | null;
};

export type GuardianProfileSummary = {
  id: string;
  name: string;
  firstName: string;
  initials: string;
};

export type GuardianLearnerNextSession = {
  bookingId: string;
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
