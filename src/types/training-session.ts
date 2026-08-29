export type TrainingSessionType =
  | "theory"
  | "practical"
  | "mock_test"
  | "assessment";

export type TrainingSessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TrainingSessionParticipantStatus =
  | "scheduled"
  | "present"
  | "absent"
  | "cancelled";

export type LocationSourceRole = "instructor" | "learner";

export type SessionCoordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  accuracyInMeters?: number | null;
  heading?: number | null;
  speed?: number | null;
  recordedAt?: string;
};

/** GPS ping emitted during an active session (server entity). */
export type TrainingSessionLocationPing = {
  id: string;
  sessionId: string;
  sourceRole: LocationSourceRole;
  instructorId?: string | null;
  learnerId?: string | null;
  latitude: number;
  longitude: number;
  accuracyInMeters?: number | null;
  heading?: number | null;
  speed?: number | null;
  recordedAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SessionLocationSnapshot = Pick<
  TrainingSessionLocationPing,
  | "sessionId"
  | "sourceRole"
  | "instructorId"
  | "learnerId"
  | "latitude"
  | "longitude"
  | "heading"
  | "speed"
  | "accuracyInMeters"
  | "recordedAt"
>;

export type DualSessionLocations = {
  instructor: SessionLocationSnapshot | null;
  learner: SessionLocationSnapshot | null;
};

export type SessionLocationShare = {
  shareUrl: string;
  expiresAt: string;
  sessionId: string;
};

export type PublicLocationShare = {
  sessionId: string;
  title: string;
  status: TrainingSessionStatus;
  expiresAt: string;
  instructorFirstName?: string | null;
  learnerFirstNames?: string[];
  locations: DualSessionLocations;
  proximityMeters?: number | null;
};

/** Local presentation state for a learner-controlled public session link. */
export type LocationSharingStatus =
  | "inactive"
  | "requesting_permission"
  | "sharing"
  | "stopped"
  | "failed";

export type LocationSharingFailureReason =
  | "permission_denied"
  | "location_unavailable";

export type TrainingSession = {
  id: string;
  schoolId: string;
  instructorId: string;
  vehicleId?: string | null;
  eligiblePackageIds: string[];
  title: string;
  sessionType: TrainingSessionType;
  scheduledStartTime: string;
  scheduledEndTime: string;
  capacity: number;
  participantCount: number;
  status: TrainingSessionStatus;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  startedByInstructorId?: string | null;
  endedByInstructorId?: string | null;
  startLocation?: SessionCoordinates | null;
  endLocation?: SessionCoordinates | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingSessionParticipant = {
  id: string;
  sessionId: string;
  learnerId: string;
  bookingId: string;
  packageId: string;
  status: TrainingSessionParticipantStatus;
  joinedAt: string;
  attendanceMarkedAt?: string | null;
  instructorFeedback?: string | null;
  nextFocus?: string | null;
  skillRatings?: Record<string, string> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RecurringTrainingSchedule = {
  id: string;
  schoolId: string;
  instructorId: string;
  vehicleId?: string | null;
  eligiblePackageIds: string[];
  title: string;
  sessionType: TrainingSessionType;
  weekdays: number[];
  startTime: string;
  durationMinutes: number;
  capacity: number;
  startsOn: string;
  endsOn?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** @deprecated Use SessionLocationShare */
export type LiveLocationShare = SessionLocationShare & {
  learnerId?: string;
  shareToken?: string;
  status?: LocationSharingStatus;
  lastLocation?: SessionCoordinates | null;
  lastUpdatedAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  failureReason?: LocationSharingFailureReason | null;
};

type EnrichedNameRef = {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  addressLine1?: string;
};

export type EnrichedVehicleRef = EnrichedNameRef & {
  plateNumber?: string;
  make?: string;
  model?: string;
  year?: number;
  transmissionType?: "automatic" | "manual";
};

export type EnrichedLearnerRef = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type EnrichedTrainingSession = Omit<
  TrainingSession,
  "instructorId" | "schoolId" | "vehicleId"
> & {
  instructorId: string | EnrichedNameRef;
  schoolId: string | EnrichedNameRef;
  vehicleId?: string | EnrichedVehicleRef | null;
};

export type LearnerJoinedSession = Omit<
  TrainingSessionParticipant,
  "sessionId" | "bookingId" | "packageId"
> & {
  sessionId: EnrichedTrainingSession | string;
  bookingId: string | { id: string };
  packageId: string | { id: string; name?: string };
};

export type AvailableTrainingSession = EnrichedTrainingSession;

export type InstructorSessionParticipant = Omit<
  TrainingSessionParticipant,
  "sessionId" | "learnerId" | "bookingId" | "packageId"
> & {
  sessionId: string;
  learnerId: string | EnrichedLearnerRef;
  bookingId: string | { id: string };
  packageId: string | { id: string; name?: string };
};

export type InstructorAssignedSession = EnrichedTrainingSession & {
  participants: InstructorSessionParticipant[];
};
