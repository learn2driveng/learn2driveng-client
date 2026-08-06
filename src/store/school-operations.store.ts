import { create } from "zustand";

import { parseVehicleDisplayName, vehicleNameFromParts } from "@/lib/school/vehicle-input";
import { createEmptyVerificationDocuments } from "@/lib/school/verification-documents";
import type {
  SchoolBookingAssignment,
  SchoolInstructorRosterItem,
  SchoolOperationsProfile,
  SchoolPackageDefinition,
  SchoolVehicle,
  SchoolVerificationDocument,
  SchoolVerificationDocumentType,
} from "@/types";

import type { VehicleTransmissionType } from "@/types/school";

const emptyProfile: SchoolOperationsProfile = {
  id: "",
  name: "",
  initials: "",
  adminName: "",
  verificationStatus: "draft",
  frscRegistrationNumber: "",
  primaryLocation: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: null,
  city: "",
  state: "",
  country: "Nigeria",
  address: "",
  description: "",
  latitude: null,
  longitude: null,
  operatingAreas: [],
  assignmentPolicy: "learner_preference",
  activeInstructors: 0,
  pendingInvites: 0,
  activeBookings: 0,
  vehicles: 0,
  packages: 0,
};

type VehicleInput = {
  name: string;
  plateNumber: string;
  transmissionType: VehicleTransmissionType;
  assignedLocation: string;
};

type PackageInput = {
  name: string;
  description: string;
  price: number;
  numberOfLessons: number;
  durationInDays: number;
  eligibleTransmissions: SchoolPackageDefinition["eligibleTransmissions"];
};

type SchoolOperationsHydration = {
  profile?: SchoolOperationsProfile;
  bookings?: SchoolBookingAssignment[];
  instructors?: SchoolInstructorRosterItem[];
  vehicles?: SchoolVehicle[];
  packages?: SchoolPackageDefinition[];
  verificationDocuments?: SchoolVerificationDocument[];
  onboardingSubmitted?: boolean;
};

type SchoolOperationsState = {
  profile: SchoolOperationsProfile;
  bookings: SchoolBookingAssignment[];
  instructors: SchoolInstructorRosterItem[];
  vehicles: SchoolVehicle[];
  packages: SchoolPackageDefinition[];
  verificationDocuments: SchoolVerificationDocument[];
  onboardingSubmitted: boolean;
  hydrateFromApi: (input: SchoolOperationsHydration) => void;
  resetSchoolOperations: () => void;
  activateInstructor: (instructorId: string) => void;
  suspendInstructor: (instructorId: string) => void;
  resendInstructorInvite: (instructorId: string) => void;
  upsertInstructor: (instructor: SchoolInstructorRosterItem) => void;
  addVehicle: (input: VehicleInput) => SchoolVehicle;
  upsertVehicle: (vehicle: SchoolVehicle) => void;
  setVehicleActive: (vehicleId: string, isActive: boolean) => void;
  addPackage: (input: PackageInput) => SchoolPackageDefinition;
  upsertPackage: (packageDefinition: SchoolPackageDefinition) => void;
  removePackage: (packageId: string) => void;
  setPackageActive: (packageId: string, isActive: boolean) => void;
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
      Partial<
        Pick<
          SchoolOperationsProfile,
          | "addressLine1"
          | "addressLine2"
          | "city"
          | "state"
          | "country"
          | "latitude"
          | "longitude"
          | "operatingAreas"
        >
      >,
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

const initialState = {
  profile: emptyProfile,
  bookings: [] as SchoolBookingAssignment[],
  instructors: [] as SchoolInstructorRosterItem[],
  vehicles: [] as SchoolVehicle[],
  packages: [] as SchoolPackageDefinition[],
  verificationDocuments: createEmptyVerificationDocuments(),
  onboardingSubmitted: false,
};

export const useSchoolOperationsStore = create<SchoolOperationsState>(
  (set) => ({
    ...initialState,
    hydrateFromApi: (input) =>
      set((state) => ({
        ...state,
        ...input,
      })),
    resetSchoolOperations: () => set(initialState),
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
    upsertInstructor: (instructor) =>
      set((state) => {
        const exists = state.instructors.some((item) => item.id === instructor.id);
        return {
          instructors: exists
            ? state.instructors.map((item) =>
                item.id === instructor.id ? instructor : item,
              )
            : [instructor, ...state.instructors],
        };
      }),
    addVehicle: (input) => {
      const { make, model, year } = parseVehicleDisplayName(input.name);
      const vehicle: SchoolVehicle = {
        id: `vehicle-${Date.now().toString(36)}`,
        schoolId: useSchoolOperationsStore.getState().profile.id,
        make,
        model,
        year,
        plateNumber: input.plateNumber.trim().toUpperCase(),
        color: null,
        transmissionType: input.transmissionType,
        isActive: true,
        name: vehicleNameFromParts({ make, model, year }),
        assignedLocation: input.assignedLocation.trim(),
        lastInspectionAt: new Date().toISOString(),
        lessonsThisWeek: 0,
      };

      set((state) => ({
        vehicles: [vehicle, ...state.vehicles],
      }));

      return vehicle;
    },
    upsertVehicle: (vehicle) =>
      set((state) => {
        const exists = state.vehicles.some((item) => item.id === vehicle.id);
        return {
          vehicles: exists
            ? state.vehicles.map((item) => (item.id === vehicle.id ? vehicle : item))
            : [vehicle, ...state.vehicles],
          profile: {
            ...state.profile,
            vehicles: exists ? state.vehicles.length : state.vehicles.length + 1,
          },
        };
      }),
    setVehicleActive: (vehicleId, isActive) =>
      set((state) => ({
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === vehicleId ? { ...vehicle, isActive } : vehicle,
        ),
      })),
    addPackage: (input) => {
      const packageDefinition: SchoolPackageDefinition = {
        id: `package-${Date.now().toString(36)}`,
        schoolId: useSchoolOperationsStore.getState().profile.id,
        name: input.name.trim(),
        description: input.description.trim(),
        price: input.price,
        currency: "NGN",
        numberOfLessons: input.numberOfLessons,
        durationInDays: input.durationInDays,
        isActive: false,
        eligibleTransmissions: input.eligibleTransmissions,
        purchasesThisMonth: 0,
      };

      set((state) => ({
        packages: [packageDefinition, ...state.packages],
      }));

      return packageDefinition;
    },
    upsertPackage: (packageDefinition) =>
      set((state) => {
        const exists = state.packages.some(
          (item) => item.id === packageDefinition.id,
        );
        return {
          packages: exists
            ? state.packages.map((item) =>
                item.id === packageDefinition.id ? packageDefinition : item,
              )
            : [packageDefinition, ...state.packages],
          profile: {
            ...state.profile,
            packages: exists ? state.packages.length : state.packages.length + 1,
          },
        };
      }),
    removePackage: (packageId) =>
      set((state) => ({
        packages: state.packages.filter((item) => item.id !== packageId),
        profile: {
          ...state.profile,
          packages: state.packages.filter((item) => item.id !== packageId).length,
        },
      })),
    setPackageActive: (packageId, isActive) =>
      set((state) => ({
        packages: state.packages.map((packageDefinition) =>
          packageDefinition.id === packageId
            ? { ...packageDefinition, isActive }
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
          profile: { ...state.profile, verificationStatus: "pending" },
        };
      });
      return submitted;
    },
    beginSchoolOnboarding: (input) =>
      set({
        ...initialState,
        onboardingSubmitted: false,
        profile: {
          ...emptyProfile,
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
      }),
  }),
);
