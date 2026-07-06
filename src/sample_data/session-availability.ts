export type SessionDateAvailability = {
  id: string;
  label: string;
  times: readonly string[];
};

/** Presentation fixtures. Replace with school availability API responses. */
export const bookingAvailability: readonly SessionDateAvailability[] = [
  {
    id: "2026-06-24",
    label: "Mon 24",
    times: [],
  },
  {
    id: "2026-06-25",
    label: "Tue 25",
    times: ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"],
  },
  {
    id: "2026-06-26",
    label: "Wed 26",
    times: ["10:00 AM", "1:30 PM"],
  },
];

export const rescheduleAvailability: readonly SessionDateAvailability[] = [
  {
    id: "2026-06-27",
    label: "Thu 27",
    times: ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"],
  },
  {
    id: "2026-06-28",
    label: "Fri 28",
    times: [],
  },
  {
    id: "2026-06-29",
    label: "Sat 29",
    times: ["9:30 AM", "12:00 PM"],
  },
];
