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
