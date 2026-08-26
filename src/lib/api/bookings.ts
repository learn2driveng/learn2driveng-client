import { api } from "@/lib/api/client";
import type {
  ApiSuccessResponse,
  Booking,
  BookingListItem,
  CancelBookingPayload,
  CreateBookingPayload,
} from "@/types";
import type { SchoolLearnerListItem } from "@/types/readiness-assessment";

export async function fetchSchoolBookings() {
  const { data } = await api.get<ApiSuccessResponse<BookingListItem[]>>(
    "/bookings/school",
  );
  return data.data;
}

export async function fetchSchoolLearners() {
  const { data } = await api.get<ApiSuccessResponse<SchoolLearnerListItem[]>>(
    "/bookings/school/learners",
  );
  return data.data;
}

export async function fetchLearnerBookings() {
  const { data } = await api.get<ApiSuccessResponse<BookingListItem[]>>(
    "/bookings",
  );
  return data.data;
}

export async function fetchLearnerBookingById(bookingId: string) {
  const { data } = await api.get<ApiSuccessResponse<BookingListItem>>(
    `/bookings/${encodeURIComponent(bookingId)}`,
  );
  return data.data;
}

export async function createLearnerBooking(payload: CreateBookingPayload) {
  const { data } = await api.post<ApiSuccessResponse<Booking>>(
    "/bookings",
    payload,
  );
  return data.data;
}

export async function cancelLearnerBooking(
  bookingId: string,
  payload: CancelBookingPayload = {},
) {
  const { data } = await api.post<ApiSuccessResponse<Booking>>(
    `/bookings/${encodeURIComponent(bookingId)}/cancel`,
    payload,
  );
  return data.data;
}
