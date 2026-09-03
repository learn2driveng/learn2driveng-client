/** Canonical booking entity — package purchase entitlement (server Booking). */
export type BookingStatus =
  | "initiated"
  | "active"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  learnerId: string;
  schoolId: string;
  packageId: string;
  status: BookingStatus;
  amount: number;
  currency: string;
  sessionsTotal: number;
  sessionsScheduledCount: number;
  sessionsCompletedCount: number;
  cancelReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingPayload {
  packageId: string;
}

export interface CancelBookingPayload {
  cancelReason?: string;
}

/**
 * Expanded booking for list UIs (joins school/package names).
 * Matches enriched server list payloads where present.
 */
export interface BookingListItem extends Booking {
  schoolName?: string;
  packageName?: string;
  learnerFirstName?: string;
  learnerLastName?: string;
  learnerEmail?: string;
}

/**
 * Presentation card for a scheduled lesson in the learner Sessions tab.
 * Derived from TrainingSession + TrainingSessionParticipant (not the Booking entity).
 */
export interface LearnerLessonCard {
  id: string;
  sessionId: string;
  bookingId: string;
  participantId?: string;
  reference?: string;
  school: string;
  packageName: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  status:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "missed";
}

/** @deprecated Use LearnerLessonCard for session UI, Booking for API. */
export type LearnerBooking = LearnerLessonCard;
