export type FRSCApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface DrivingSchool {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  frscStatus: FRSCApprovalStatus;
  rating?: number;
  reviewCount?: number;
  imageUrl?: string;
  phone?: string;
}

export interface SchoolFilters {
  query?: string;
  state?: string;
  city?: string;
  minRating?: number;
  frscApprovedOnly?: boolean;
}

export interface SchoolSummary {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  startingPrice: number;
  rating: number;
  premium?: boolean;
}

export interface TrainingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  sessions: number;
  duration: string;
  featured?: boolean;
}

export interface InstructorSummary {
  id: string;
  name: string;
  experience: string;
  rating: number;
}

export interface VehicleSummary {
  id: string;
  name: string;
  transmission: 'Automatic' | 'Manual';
}

export interface SchoolDetail extends SchoolSummary {
  description: string;
  address: string;
  reviewCount: number;
  instructors: InstructorSummary[];
  vehicles: VehicleSummary[];
  packages: TrainingPackage[];
}
