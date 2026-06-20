export type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

export interface LearnerBooking {
  id: string;
  reference: string;
  school: string;
  packageName: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  status: BookingStatus;
}
