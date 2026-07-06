export type TrainingSessionStatus =
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled";

export type LocationSharingStatus =
  | "inactive"
  | "requesting_permission"
  | "sharing"
  | "stopped"
  | "failed";

export type LocationSharingFailureReason =
  | "permission_denied"
  | "location_unavailable";

export type SessionCoordinates = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type TrainingSession = {
  id: string;
  bookingId: string;
  learnerId: string;
  instructorId: string;
  schoolId: string;
  status: TrainingSessionStatus;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
};

export type LiveLocationShare = {
  sessionId: string;
  learnerId: string;
  guardianLinkIds: string[];
  status: LocationSharingStatus;
  lastLocation: SessionCoordinates | null;
  lastUpdatedAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  failureReason: LocationSharingFailureReason | null;
};
