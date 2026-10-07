import { Redirect } from "expo-router";

// Legacy purchase-as-lesson links must never expose local-only mutations.
export default function LegacySchoolBookingDetail() {
  return <Redirect href="/school/bookings" />;
}
