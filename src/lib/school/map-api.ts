import { vehicleNameFromParts } from "@/lib/school/vehicle-input";
import { createEmptyVerificationDocuments } from "@/lib/school/verification-documents";
import type {
  AuthUser,
  Booking,
  DrivingSchool,
  DrivingSchoolVerificationDocument,
  SchoolBookingAssignment,
  SchoolInstructorRosterItem,
  SchoolOperationsProfile,
  SchoolPackageDefinition,
  SchoolVerificationDocument,
  SchoolVehicle,
  TrainingPackage,
  Vehicle,
  VehicleTransmissionType,
} from "@/types";
import type {
  SchoolLearner,
  SchoolLearnerListItem,
  SchoolLearnerStatus,
} from "@/types/readiness-assessment";

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatAddress(school: DrivingSchool) {
  return [school.addressLine1, school.addressLine2, school.city, school.state]
    .filter(Boolean)
    .join(", ");
}

function primaryLocationFromSchool(school: DrivingSchool) {
  return [school.city, school.state]
    .filter((part, index, parts) => part && parts.indexOf(part) === index)
    .join(", ");
}

export function drivingSchoolToProfile(
  school: DrivingSchool,
  adminName: string,
  counts?: {
    activeInstructors?: number;
    pendingInstructors?: number;
    activeBookings?: number;
    vehicles?: number;
    packages?: number;
  },
): SchoolOperationsProfile {
  return {
    id: school.id,
    name: school.name,
    initials: initialsFromName(school.name),
    adminName,
    verificationStatus: school.verificationStatus,
    frscRegistrationNumber: school.businessRegistrationNumber ?? "",
    primaryLocation: primaryLocationFromSchool(school),
    email: school.email,
    phone: school.phone,
    addressLine1: school.addressLine1,
    addressLine2: school.addressLine2 ?? null,
    city: school.city,
    state: school.state,
    country: school.country,
    address: formatAddress(school),
    description: school.description ?? "",
    latitude: school.latitude ?? null,
    longitude: school.longitude ?? null,
    logoUrl: school.logoUrl ?? null,
    operatingAreas: school.city ? [school.city] : [],
    assignmentPolicy: "learner_preference",
    activeInstructors:
      counts?.activeInstructors ?? school.totalInstructors ?? 0,
    pendingInvites: counts?.pendingInstructors ?? 0,
    activeBookings: counts?.activeBookings ?? 0,
    vehicles: counts?.vehicles ?? 0,
    packages: counts?.packages ?? 0,
  };
}

export function mergeVerificationDocuments(
  uploaded: DrivingSchoolVerificationDocument[] = [],
): SchoolVerificationDocument[] {
  const templates = createEmptyVerificationDocuments();
  const byType = new Map(uploaded.map((document) => [document.type, document]));

  return templates.map((template) => {
    const match = byType.get(template.type);
    if (!match) return template;

    return {
      ...template,
      fileName: match.originalFilename ?? match.label ?? template.label,
      uri: match.fileUrl,
      mimeType: match.mimeType ?? null,
      size: match.sizeInBytes ?? null,
      uploadedAt: match.uploadedAt,
      status: match.status,
    };
  });
}

export function vehicleToSchoolVehicle(vehicle: Vehicle): SchoolVehicle {
  return {
    ...vehicle,
    name: vehicleNameFromParts({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
    }),
  };
}

export function packageToSchoolPackage(
  packageDefinition: TrainingPackage,
): SchoolPackageDefinition {
  return {
    ...packageDefinition,
    eligibleTransmissions: ["automatic", "manual"],
    purchasesThisMonth: 0,
  };
}

export function instructorUserToRosterItem(
  instructor: AuthUser,
): SchoolInstructorRosterItem {
  const name = `${instructor.firstName} ${instructor.lastName}`.trim();
  const status =
    instructor.status === "active"
      ? instructor.isEmailVerified
        ? "active"
        : "pending"
      : instructor.status;

  return {
    id: instructor.id,
    firstName: instructor.firstName,
    lastName: instructor.lastName,
    name,
    initials: initialsFromName(name),
    email: instructor.email,
    phone: instructor.phone,
    status,
    profilePhoto: instructor.profilePhoto ?? null,
    invitedAt: instructor.createdAt ?? null,
    activatedAt:
      instructor.status === "active" && instructor.isEmailVerified
        ? instructor.updatedAt ?? instructor.createdAt ?? null
        : null,
    lessonsThisWeek: 0,
  };
}

type EnrichedLearner = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type EnrichedPackage = {
  id?: string;
  name?: string;
};

type EnrichedSchoolBooking = Omit<
  Booking,
  "packageId" | "learnerId" | "schoolId"
> & {
  packageId?: string | EnrichedPackage;
  schoolId?: string | { id?: string; name?: string };
  learnerId?: string | EnrichedLearner;
};

function readLearner(booking: EnrichedSchoolBooking): EnrichedLearner | null {
  if (typeof booking.learnerId === "object" && booking.learnerId) {
    return booking.learnerId;
  }
  return null;
}

function readPackageName(booking: EnrichedSchoolBooking) {
  const packageRef = booking.packageId;
  if (typeof packageRef === "object" && packageRef && "name" in packageRef) {
    return packageRef.name ?? "Training package";
  }
  return "Training package";
}

export function bookingToSchoolAssignment(
  booking: EnrichedSchoolBooking,
): SchoolBookingAssignment {
  const learner = readLearner(booking);
  const firstName = learner?.firstName ?? "Learner";
  const lastName = learner?.lastName ?? "";
  const learnerName = `${firstName} ${lastName}`.trim();
  const status =
    booking.status === "cancelled"
      ? "cancelled"
      : booking.status === "completed"
        ? "confirmed"
        : "unassigned";

  return {
    id: booking.id,
    bookingId: booking.id,
    learnerName,
    learnerInitials: initialsFromName(learnerName || "L"),
    packageName: readPackageName(booking),
    lessonNumber: Math.max(booking.sessionsCompletedCount + 1, 1),
    totalLessons: booking.sessionsTotal,
    scheduledAt: booking.createdAt,
    location: "To be scheduled",
    transmission: "automatic" as VehicleTransmissionType,
    instructorPreferenceId: null,
    instructorId: null,
    vehicleId: null,
    status,
    requestedAt: booking.createdAt,
    rescheduledAt: null,
    cancellationReason: booking.cancelReason ?? null,
    cancelledAt: booking.status === "cancelled" ? booking.updatedAt ?? null : null,
  };
}

export function schoolLearnerFromApi(learner: SchoolLearnerListItem): SchoolLearner {
  return {
    ...learner,
    initials: initialsFromName(learner.name || "L"),
    status: learner.status as SchoolLearnerStatus,
  };
}

export function schoolLearnersFromApi(learners: SchoolLearnerListItem[]) {
  return learners.map(schoolLearnerFromApi);
}
