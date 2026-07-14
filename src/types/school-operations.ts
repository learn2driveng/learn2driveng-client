export type SchoolVerificationStatus =
  | "draft"
  | "pending_review"
  | "verified"
  | "suspended";

export type SchoolInstructorStatus =
  | "invited"
  | "profile_pending"
  | "active"
  | "suspended";

export type InstructorAssignmentPolicy =
  | "school_assigned"
  | "learner_preference"
  | "learner_selected";

export type SchoolVehicleStatus = "active" | "maintenance" | "inactive";

export type SchoolPackageStatus = "draft" | "active" | "paused";

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
  address: string;
  description: string;
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
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: SchoolInstructorStatus;
  assignedLocation: string;
  allowedTransmissions: Array<"Automatic" | "Manual">;
  invitedAt: string | null;
  activatedAt: string | null;
  lessonsThisWeek: number;
};

export type SchoolVehicle = {
  id: string;
  name: string;
  plateNumber: string;
  transmission: "Automatic" | "Manual";
  assignedLocation: string;
  status: SchoolVehicleStatus;
  lastInspectionAt: string;
  lessonsThisWeek: number;
};

export type SchoolPackageDefinition = {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  duration: string;
  eligibleTransmissions: Array<"Automatic" | "Manual">;
  status: SchoolPackageStatus;
  purchasesThisMonth: number;
};

export type SchoolBookingAssignment = {
  id: string;
  learnerName: string;
  learnerInitials: string;
  packageName: string;
  lessonNumber: number;
  totalLessons: number;
  scheduledAt: string;
  location: string;
  transmission: "Automatic" | "Manual";
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
  | "frsc_licence"
  | "cac_registration"
  | "proof_of_address"
  | "administrator_id"
  | "vehicle_insurance";

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
};
