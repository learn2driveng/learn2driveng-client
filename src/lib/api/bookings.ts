import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, BookingListItem } from "@/types";

export async function fetchSchoolBookings() {
  const { data } = await api.get<ApiSuccessResponse<BookingListItem[]>>(
    "/bookings/school",
  );
  return data.data;
}
