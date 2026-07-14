import { create } from "zustand";

import {
  schoolBookingAssignments,
  schoolInstructorRoster,
  schoolPackageDefinitions,
  schoolOperationsProfile,
  schoolVehicles,
  schoolVerificationDocuments,
} from "@/sample_data";
import type {
  SchoolBookingAssignment,
  SchoolInstructorRosterItem,
  SchoolOperationsProfile,
  SchoolPackageDefinition,
  SchoolVehicle,
  SchoolVerificationDocument,
  SchoolVerificationDocumentType,
} from "@/types";

type VehicleInput = {
  name: string;
  plateNumber: string;
  transmission: SchoolVehicle["transmission"];
  assignedLocation: string;
};

type PackageInput = {
  name: string;
  description: string;
  price: number;
  sessions: number;
  duration: string;
  eligibleTransmissions: SchoolPackageDefinition["eligibleTransmissions"];
};

type SchoolOperationsState = {
  profile: SchoolOperationsProfile;
  bookings: SchoolBookingAssignment[];
  instructors: SchoolInstructorRosterItem[];
  vehicles: SchoolVehicle[];
  packages: SchoolPackageDefinition[];
  verificationDocuments: SchoolVerificationDocument[];
  onboardingSubmitted: boolean;
  activateInstructor: (instructorId: string) => void;
  suspendInstructor: (instructorId: string) => void;
  resendInstructorInvite: (instructorId: string) => void;
  addVehicle: (input: VehicleInput) => SchoolVehicle;
  setVehicleStatus: (
    vehicleId: string,
    status: SchoolVehicle["status"],
  ) => void;
  addPackage: (input: PackageInput) => SchoolPackageDefinition;
  setPackageStatus: (
    packageId: string,
    status: SchoolPackageDefinition["status"],
  ) => void;
  assignBooking: (
    bookingId: string,
    instructorId: string,
    vehicleId: string,
  ) => void;
  confirmBookingAssignment: (bookingId: string) => void;
  rescheduleBooking: (bookingId: string, scheduledAt: string) => void;
  cancelBooking: (bookingId: string, reason: string) => void;
  updateProfile: (
    input: Pick<
      SchoolOperationsProfile,
      "name" | "email" | "phone" | "address" | "description" | "primaryLocation"
    > &
      Partial<Pick<SchoolOperationsProfile, "operatingAreas">>,
  ) => void;
  setVerificationDocument: (
    type: SchoolVerificationDocumentType,
    file: Pick<
      SchoolVerificationDocument,
      "fileName" | "uri" | "mimeType" | "size"
    >,
  ) => void;
  removeVerificationDocument: (type: SchoolVerificationDocumentType) => void;
  submitVerificationApplication: () => boolean;
  beginSchoolOnboarding: (input: {
    schoolName: string;
    adminName: string;
    email: string;
    phone: string;
  }) => void;
};

export const useSchoolOperationsStore = create<SchoolOperationsState>(
  (set) => ({
    profile: schoolOperationsProfile,
    bookings: schoolBookingAssignments,
    instructors: schoolInstructorRoster,
    vehicles: schoolVehicles,
    packages: schoolPackageDefinitions,
    verificationDocuments: schoolVerificationDocuments,
    onboardingSubmitted: true,
    activateInstructor: (instructorId) =>
      set((state) => ({
        instructors: state.instructors.map((instructor) =>
          instructor.id === instructorId
            ? {
                ...instructor,
                status: "active",
                activatedAt: new Date().toISOString(),
              }
            : instructor,
        ),
      })),
    suspendInstructor: (instructorId) =>
      set((state) => ({
        instructors: state.instructors.map((instructor) =>
          instructor.id === instructorId
            ? {
                ...instructor,
                status: "suspended",
              }
            : instructor,
        ),
      })),
    resendInstructorInvite: (instructorId) =>
      set((state) => ({
        instructors: state.instructors.map((instructor) =>
          instructor.id === instructorId && instructor.status === "invited"
            ? {
                ...instructor,
                invitedAt: new Date().toISOString(),
              }
            : instructor,
        ),
      })),
    addVehicle: (input) => {
      const vehicle: SchoolVehicle = {
        id: `vehicle-${Date.now().toString(36)}`,
        name: input.name.trim(),
        plateNumber: input.plateNumber.trim().toUpperCase(),
        transmission: input.transmission,
        assignedLocation: input.assignedLocation.trim(),
        status: "active",
        lastInspectionAt: new Date().toISOString(),
        lessonsThisWeek: 0,
      };

      set((state) => ({
        vehicles: [vehicle, ...state.vehicles],
      }));

      return vehicle;
    },
    setVehicleStatus: (vehicleId, status) =>
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, status } : vehicle,
        ),
      })),
    addPackage: (input) => {
      const packageDefinition: SchoolPackageDefinition = {
        id: `package-${Date.now().toString(36)}`,
        name: input.name.trim(),
        description: input.description.trim(),
        price: input.price,
        sessions: input.sessions,
        duration: input.duration.trim(),
        eligibleTransmissions: input.eligibleTransmissions,
        status: "draft",
        purchasesThisMonth: 0,
      };

      set((state) => ({
        packages: [packageDefinition, ...state.packages],
      }));

      return packageDefinition;
    },
    setPackageStatus: (packageId, status) =>
      set((state) => ({
        packages: state.packages.map((packageDefinition) =>
          packageDefinition.id === packageId
            ? { ...packageDefinition, status }
            : packageDefinition,
        ),
      })),
    assignBooking: (bookingId, instructorId, vehicleId) =>
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                instructorId,
                vehicleId,
                status: "assigned",
              }
            : booking,
        ),
      })),
    confirmBookingAssignment: (bookingId) =>
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId &&
          booking.instructorId !== null &&
          booking.vehicleId !== null
            ? { ...booking, status: "confirmed" }
            : booking,
        ),
      })),
    rescheduleBooking: (bookingId, scheduledAt) =>
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId && booking.status !== "cancelled"
            ? {
                ...booking,
                scheduledAt,
                rescheduledAt: new Date().toISOString(),
                status:
                  booking.instructorId && booking.vehicleId
                    ? "assigned"
                    : "unassigned",
              }
            : booking,
        ),
      })),
    cancelBooking: (bookingId, reason) =>
      set((state) => ({
        bookings: state.bookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "cancelled",
                cancellationReason: reason.trim(),
                cancelledAt: new Date().toISOString(),
              }
            : booking,
        ),
      })),
    updateProfile: (input) =>
      set((state) => ({
        profile: {
          ...state.profile,
          ...input,
          initials: input.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join(""),
        },
      })),
    setVerificationDocument: (type, file) =>
      set((state) => ({
        verificationDocuments: state.verificationDocuments.map((document) =>
          document.type === type
            ? { ...document, ...file, uploadedAt: new Date().toISOString() }
            : document,
        ),
      })),
    removeVerificationDocument: (type) =>
      set((state) => ({
        verificationDocuments: state.verificationDocuments.map((document) =>
          document.type === type
            ? {
                ...document,
                fileName: null,
                uri: null,
                mimeType: null,
                size: null,
                uploadedAt: null,
              }
            : document,
        ),
      })),
    submitVerificationApplication: () => {
      let submitted = false;
      set((state) => {
        const complete = state.verificationDocuments
          .filter((document) => document.required)
          .every((document) => document.uri !== null);
        if (!complete) return state;
        submitted = true;
        return {
          onboardingSubmitted: true,
          profile: { ...state.profile, verificationStatus: "pending_review" },
        };
      });
      return submitted;
    },
    beginSchoolOnboarding: (input) =>
      set((state) => ({
        onboardingSubmitted: false,
        profile: {
          ...state.profile,
          name: input.schoolName.trim(),
          initials: input.schoolName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join(""),
          adminName: input.adminName.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          verificationStatus: "draft",
        },
        verificationDocuments: state.verificationDocuments.map((document) => ({
          ...document,
          fileName: null,
          uri: null,
          mimeType: null,
          size: null,
          uploadedAt: null,
        })),
      })),
  }),
);
