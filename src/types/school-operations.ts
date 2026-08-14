import type {
  DrivingSchoolVerificationDocumentStatus,
  DrivingSchoolVerificationDocumentType,
  DrivingSchoolVerificationStatus,
  TrainingPackage,
  Vehicle,
  VehicleTransmissionType,
} from "./school";
import type { UserStatus } from "./auth";

/**
 * Local onboarding draft before a school profile exists on the server.
 * Once created, use DrivingSchoolVerificationStatus (`pending` | `approved` | `rejected`).
 */
export type SchoolOnboardingDraftStatus = "draft";

export type SchoolVerificationStatus =
  | SchoolOnboardingDraftStatus
  | DrivingSchoolVerificationStatus;

/** Roster status maps to UserStatus; invite UX may still use pending. */
export type SchoolInstructorStatus = UserStatus | "invited";

export type InstructorAssignmentPolicy =
  | "school_assigned"
  | "learner_preference"
  | "learner_selected";

export type SchoolBookingAssignmentStatus =
  | "unassigned"
  | "assigned"
  | "confirmed"
  | "cancelled";

export type SchoolOperationsProfile = {
  id: string;
  name: string;
  initials: string;
  adminName: string;
  verificationStatus: SchoolVerificationStatus;
  frscRegistrationNumber: string;
  primaryLocation: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  /** @deprecated Prefer addressLine1 + city + state */
  address: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  operatingAreas: string[];
  assignmentPolicy: InstructorAssignmentPolicy;
  activeInstructors: number;
  pendingInvites: number;
  activeBookings: number;
  vehicles: number;
  packages: number;
};

export type SchoolInstructorRosterItem = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: SchoolInstructorStatus;
  profilePhoto?: string | null;
  assignedLocation?: string;
  allowedTransmissions?: VehicleTransmissionType[];
  invitedAt?: string | null;
  activatedAt?: string | null;
  lessonsThisWeek?: number;
};

/** School fleet row — Vehicle entity + optional ops overlays. */
export type SchoolVehicle = Vehicle & {
  /** Convenience display name */
  name: string;
  assignedLocation?: string;
  lastInspectionAt?: string;
  lessonsThisWeek?: number;
};

/** School package row — Package entity + optional ops overlays. */
export type SchoolPackageDefinition = TrainingPackage & {
  eligibleTransmissions?: VehicleTransmissionType[];
  purchasesThisMonth?: number;
};

/**
 * Ops booking board row. Today this is UI-oriented; long-term maps to
 * Booking + TrainingSessionParticipant assignment fields.
 */
export type SchoolBookingAssignment = {
  id: string;
  bookingId?: string;
  sessionId?: string;
  learnerName: string;
  learnerInitials: string;
  packageName: string;
  lessonNumber: number;
  totalLessons: number;
  scheduledAt: string;
  location: string;
  transmission: VehicleTransmissionType;
  instructorPreferenceId: string | null;
  instructorId: string | null;
  vehicleId: string | null;
  status: SchoolBookingAssignmentStatus;
  requestedAt: string;
  rescheduledAt: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
};

export type SchoolRescheduleSlot = {
  id: string;
  scheduledAt: string;
  label: string;
};

export type SchoolVerificationDocumentType =
  DrivingSchoolVerificationDocumentType;

export type SchoolVerificationDocument = {
  type: SchoolVerificationDocumentType;
  label: string;
  description: string;
  required: boolean;
  fileName: string | null;
  uri: string | null;
  mimeType: string | null;
  size: number | null;
  uploadedAt: string | null;
  status?: DrivingSchoolVerificationDocumentStatus;
  reviewNotes?: string | null;
};
