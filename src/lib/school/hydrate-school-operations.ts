import { fetchSchoolBookings } from "@/lib/api/bookings";
import { fetchMyDrivingSchool } from "@/lib/api/driving-schools";
import { fetchSchoolInstructors } from "@/lib/api/instructors";
import { fetchSchoolPackages } from "@/lib/api/packages";
import { fetchSchoolVehicles } from "@/lib/api/vehicles";
import {
  bookingToSchoolAssignment,
  drivingSchoolToProfile,
  instructorUserToRosterItem,
  mergeVerificationDocuments,
  packageToSchoolPackage,
  vehicleToSchoolVehicle,
} from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, DrivingSchool } from "@/types";

function countInstructors(
  instructors: ReturnType<typeof instructorUserToRosterItem>[],
) {
  const activeInstructors = instructors.filter(
    (item) => item.status === "active",
  ).length;
  const pendingInstructors = instructors.length - activeInstructors;
  return { activeInstructors, pendingInstructors };
}

function applyHydratedSchool(
  school: DrivingSchool,
  adminName: string,
  options?: { includeOperations?: boolean },
) {
  const includeOperations = options?.includeOperations ?? false;
  const store = useSchoolOperationsStore.getState();

  if (!includeOperations) {
    store.hydrateFromApi({
      profile: drivingSchoolToProfile(school, adminName),
      verificationDocuments: mergeVerificationDocuments(
        school.verificationDocuments,
      ),
      onboardingSubmitted: true,
    });
    return;
  }

  Promise.all([
    fetchSchoolInstructors().catch(() => []),
    fetchSchoolVehicles().catch(() => []),
    fetchSchoolPackages().catch(() => []),
    fetchSchoolBookings().catch(() => []),
  ]).then(([instructors, vehicles, packages, bookings]) => {
    const roster = instructors.map(instructorUserToRosterItem);
    const { activeInstructors, pendingInstructors } = countInstructors(roster);
    const mappedBookings = bookings.map(bookingToSchoolAssignment);
    const activeBookings = mappedBookings.filter(
      (booking) => booking.status !== "cancelled",
    ).length;

    store.hydrateFromApi({
      profile: drivingSchoolToProfile(school, adminName, {
        activeInstructors,
        pendingInstructors,
        activeBookings,
        vehicles: vehicles.length,
        packages: packages.length,
      }),
      instructors: roster,
      vehicles: vehicles.map(vehicleToSchoolVehicle),
      packages: packages.map(packageToSchoolPackage),
      bookings: mappedBookings,
      verificationDocuments: mergeVerificationDocuments(
        school.verificationDocuments,
      ),
      onboardingSubmitted: true,
    });
  });
}

export async function hydrateSchoolOperations(adminName: string) {
  try {
    const school = await fetchMyDrivingSchool();
    applyHydratedSchool(school, adminName, {
      includeOperations: school.verificationStatus === "approved",
    });
    return school;
  } catch (error) {
    const apiError = error as ApiError;
    if (apiError.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

export function hydrateSchoolFromRecord(
  school: DrivingSchool,
  adminName: string,
) {
  applyHydratedSchool(school, adminName, {
    includeOperations: school.verificationStatus === "approved",
  });
}

export async function refreshApprovedSchoolOperations(adminName: string) {
  const school = await fetchMyDrivingSchool();
  if (school.verificationStatus !== "approved") {
    hydrateSchoolFromRecord(school, adminName);
    return school;
  }

  const [instructors, vehicles, packages, bookings] = await Promise.all([
    fetchSchoolInstructors(),
    fetchSchoolVehicles(),
    fetchSchoolPackages(),
    fetchSchoolBookings(),
  ]);

  const roster = instructors.map(instructorUserToRosterItem);
  const { activeInstructors, pendingInstructors } = countInstructors(roster);
  const mappedBookings = bookings.map(bookingToSchoolAssignment);
  const activeBookings = mappedBookings.filter(
    (booking) => booking.status !== "cancelled",
  ).length;

  useSchoolOperationsStore.getState().hydrateFromApi({
    profile: drivingSchoolToProfile(school, adminName, {
      activeInstructors,
      pendingInstructors,
      activeBookings,
      vehicles: vehicles.length,
      packages: packages.length,
    }),
    instructors: roster,
    vehicles: vehicles.map(vehicleToSchoolVehicle),
    packages: packages.map(packageToSchoolPackage),
    bookings: mappedBookings,
    verificationDocuments: mergeVerificationDocuments(
      school.verificationDocuments,
    ),
    onboardingSubmitted: true,
  });

  return school;
}
