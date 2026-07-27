import {
  computeStartingPrice,
  formatFullAddress,
  formatPackageDurationDays,
  formatSchoolLocation,
  formatTransmissionLabel,
  vehicleDisplayName,
} from "@/lib/school/format";
import type {
  DrivingSchool,
  InstructorSummary,
  PublicDrivingSchoolDetail,
  PublicDrivingSchoolListItem,
  SchoolDetail,
  SchoolSummary,
  TrainingPackage,
  VehicleSummary,
} from "@/types/school";
import type { Vehicle } from "@/types/school";

/** Maps server `GET /discover/schools` list item into marketplace SchoolSummary. */
export function mapPublicSchoolListItemToSummary(
  item: PublicDrivingSchoolListItem,
): SchoolSummary {
  const location = formatSchoolLocation(item.city, item.state);

  return {
    id: item.id,
    name: item.name,
    location,
    distanceKm: item.distanceKm ?? 0,
    startingPrice: item.startingPrice ?? 0,
    rating: item.ratingAverage,
    logoUrl: item.logoUrl,
    verificationStatus: item.verificationStatus,
  };
}

/** Maps server `GET /discover/schools/:id` payload into marketplace SchoolDetail. */
export function mapPublicSchoolDetailToSchoolDetail(
  school: PublicDrivingSchoolDetail,
  options?: { distanceKm?: number; premium?: boolean },
): SchoolDetail {
  const location = formatSchoolLocation(school.city, school.state);
  const address = formatFullAddress({
    addressLine1: school.addressLine1,
    addressLine2: school.addressLine2,
    city: school.city,
    state: school.state,
    country: school.country,
  });

  const packages = school.packages ?? [];
  const startingPrice =
    school.startingPrice ?? computeStartingPrice(packages);

  return {
    id: school.id,
    name: school.name,
    location,
    distanceKm: options?.distanceKm ?? 0,
    startingPrice,
    rating: school.ratingAverage,
    premium: options?.premium,
    logoUrl: school.logoUrl,
    verificationStatus: school.verificationStatus,
    description: school.description ?? "",
    address,
    addressLine1: school.addressLine1,
    addressLine2: school.addressLine2,
    city: school.city,
    state: school.state,
    country: school.country,
    phone: school.phone,
    email: school.email,
    latitude: school.latitude,
    longitude: school.longitude,
    reviewCount: school.totalReviews,
    instructors: (school.instructors ?? []).map(mapPublicInstructorSummary),
    vehicles: (school.vehicles ?? []).map(mapPublicVehicleSummary),
    packages,
  };
}

export function mapSchoolDetailToSummary(
  school: SchoolDetail,
): SchoolSummary {
  return {
    id: school.id,
    name: school.name,
    location: school.location,
    distanceKm: school.distanceKm,
    startingPrice: school.startingPrice,
    rating: school.rating,
    premium: school.premium,
    logoUrl: school.logoUrl,
    verificationStatus: school.verificationStatus,
  };
}

export function mapDrivingSchoolEntityToSummary(
  school: DrivingSchool,
  options: {
    distanceKm?: number;
    startingPrice?: number;
    premium?: boolean;
  } = {},
): SchoolSummary {
  const location = formatSchoolLocation(school.city, school.state);
  return {
    id: school.id,
    name: school.name,
    location,
    distanceKm: options.distanceKm ?? 0,
    startingPrice: options.startingPrice ?? 0,
    rating: school.ratingAverage,
    premium: options.premium,
    logoUrl: school.logoUrl,
    verificationStatus: school.verificationStatus,
  };
}

function mapPublicInstructorSummary(
  instructor: PublicDrivingSchoolDetail["instructors"][number],
): InstructorSummary {
  return {
    id: instructor.id,
    firstName: instructor.firstName,
    lastName: instructor.lastName,
    name: instructor.name,
    profilePhoto: instructor.profilePhoto,
  };
}

function mapPublicVehicleSummary(
  vehicle: PublicDrivingSchoolDetail["vehicles"][number],
): VehicleSummary {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    transmissionType: vehicle.transmissionType,
    name: vehicleDisplayName(vehicle),
  };
}

export function mapVehicleToSummary(vehicle: Vehicle): VehicleSummary {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    transmissionType: vehicle.transmissionType,
    name: vehicleDisplayName(vehicle),
  };
}

export function packageLessonCount(pkg: TrainingPackage): number {
  return pkg.numberOfLessons;
}

export function packageDurationLabel(pkg: TrainingPackage): string {
  return formatPackageDurationDays(pkg.durationInDays);
}

export function transmissionSummaryLabel(
  transmissionType: VehicleSummary["transmissionType"],
): string {
  return formatTransmissionLabel(transmissionType);
}
