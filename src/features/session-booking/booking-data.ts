import type { LearnerBooking } from "@/types";

export const learnerBookings: LearnerBooking[] = [
  {
    id: "booking-a7",
    reference: "L2D-240625-A7",
    school: "Elite Safety Driving Academy",
    packageName: "Defensive Driving Pro",
    date: "Tue, 25 June",
    time: "11:30 AM",
    location: "Wuse II Training Centre",
    instructor: "John Adeyemi",
    status: "upcoming",
  },
  {
    id: "booking-f2",
    reference: "L2D-170625-F2",
    school: "Elite Safety Driving Academy",
    packageName: "Defensive Driving Pro",
    date: "Tue, 17 June",
    time: "9:00 AM",
    location: "Wuse II Training Centre",
    instructor: "Grace Okafor",
    status: "completed",
  },
  {
    id: "booking-c4",
    reference: "L2D-100625-C4",
    school: "Pro-Wheels Training",
    packageName: "Driving Essentials",
    date: "Tue, 10 June",
    time: "2:00 PM",
    location: "Maitama Training Centre",
    instructor: "Amina Bello",
    status: "cancelled",
  },
];

export function getBookingById(bookingId: string | undefined) {
  return learnerBookings.find((booking) => booking.id === bookingId);
}
