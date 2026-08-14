export type DrivingSchoolVerificationStatus =
  | "pending"
  | "approved"
  | "rejected";

export type DrivingSchoolVerificationDocumentType =
  | "frsc_certificate"
  | "business_registration"
  | "tax_document"
  | "insurance"
  | "other";

export type DrivingSchoolVerificationDocumentStatus =
  | "uploaded"
  | "approved"
  | "rejected";

export type VehicleTransmissionType = "automatic" | "manual";

/** Canonical driving school entity (server DrivingSchool). */
export interface DrivingSchool {
  id: string;
  ownerUserId: string;
  name: string;
  businessRegistrationNumber?: string | null;
  taxId?: string | null;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  logoUrl?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  verificationStatus: DrivingSchoolVerificationStatus;
  verifiedAt?: string | null;
  verifiedByAdminId?: string | null;
  rejectionReason?: string | null;
  ratingAverage: number;
  totalReviews: number;
  totalInstructors: number;
  totalStudents: number;
  totalLessons: number;
  verificationDocuments: DrivingSchoolVerificationDocument[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressSuggestion {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type CreateDrivingSchoolInput = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  description?: string;
  latitude: number;
  longitude: number;
};

export interface DrivingSchoolVerificationDocument {
  id: string;
  type: DrivingSchoolVerificationDocumentType;
  label?: string | null;
  storageKey: string;
  fileUrl: string;
  originalFilename?: string | null;
  mimeType?: string | null;
  sizeInBytes?: number | null;
  status: DrivingSchoolVerificationDocumentStatus;
  reviewNotes?: string | null;
  uploadedAt: string;
}

/** Canonical package entity (server Package). */
export interface TrainingPackage {
  id: string;
  schoolId: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  numberOfLessons: number;
  durationInDays: number;
  /** Car types available with this package. Older API responses may omit it. */
  eligibleTransmissions?: VehicleTransmissionType[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Canonical vehicle entity (server Vehicle). */
export interface Vehicle {
  id: string;
  schoolId: string;
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string | null;
  photoUrl?: string | null;
  transmissionType: VehicleTransmissionType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolFilters {
  query?: string;
  state?: string;
  city?: string;
  minRating?: number;
  frscApprovedOnly?: boolean;
}

/**
 * Marketplace discovery card — presentation overlay on DrivingSchool.
 * Not a persistence entity; distance/startingPrice are computed client-side or by search API.
 */
export interface SchoolSummary {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  startingPrice: number;
  rating: number;
  premium?: boolean;
  logoUrl?: string | null;
  verificationStatus?: DrivingSchoolVerificationStatus;
}

export interface InstructorSummary {
  id: string;
  firstName: string;
  lastName: string;
  /** Convenience display name. */
  name: string;
  experience?: string;
  rating?: number;
  profilePhoto?: string | null;
}

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  year?: number;
  transmissionType: VehicleTransmissionType;
  /** Convenience display label, e.g. "Toyota Corolla". */
  name: string;
  plateNumber?: string;
  color?: string | null;
  photoUrl?: string | null;
}

export interface SchoolDetail extends SchoolSummary {
  description: string;
  address: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country: string;
  phone?: string;
  email?: string;
  latitude?: number | null;
  longitude?: number | null;
  reviewCount: number;
  totalInstructors: number;
  totalVehicles: number;
  instructors: InstructorSummary[];
  vehicles: VehicleSummary[];
  packages: TrainingPackage[];
}

/** @deprecated Prefer DrivingSchoolVerificationStatus */
export type FRSCApprovalStatus = DrivingSchoolVerificationStatus;

/** Nested school on public package discovery responses. */
export type DiscoverablePackageSchool = {
  id: string;
  name: string;
  city: string;
  state: string;
  logoUrl?: string | null;
  ratingAverage: number;
  totalReviews: number;
};

/** `GET /discover/packages` item shape. */
export type DiscoverablePackage = TrainingPackage & {
  school: DiscoverablePackageSchool;
};

/** `GET /discover/schools` list item. */
export type PublicDrivingSchoolListItem = Pick<
  DrivingSchool,
  | "id"
  | "name"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "country"
  | "logoUrl"
  | "description"
  | "latitude"
  | "longitude"
  | "verificationStatus"
  | "ratingAverage"
  | "totalReviews"
> & {
  startingPrice: number | null;
  /** Present when the list request included latitude and longitude. */
  distanceKm?: number | null;
};

export type PublicDrivingSchoolInstructor = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  profilePhoto?: string | null;
};

export type PublicDrivingSchoolVehicle = Pick<
  Vehicle,
  | "id"
  | "schoolId"
  | "make"
  | "model"
  | "year"
  | "plateNumber"
  | "color"
  | "photoUrl"
  | "transmissionType"
  | "isActive"
>;

/** `GET /discover/schools/:id` detail payload. */
export type PublicDrivingSchoolDetail = PublicDrivingSchoolListItem & {
  email: string;
  phone: string;
  totalInstructors: number;
  totalVehicles: number;
  totalStudents: number;
  totalLessons: number;
  packages: TrainingPackage[];
  vehicles: PublicDrivingSchoolVehicle[];
  instructors: PublicDrivingSchoolInstructor[];
};
