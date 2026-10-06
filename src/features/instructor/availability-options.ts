import type {
  InstructorAvailabilityDay,
  InstructorAvailabilityShift,
} from "@/types";

export const instructorAvailabilityShifts: InstructorAvailabilityShift[] = [
  { id: "early", label: "8:00 AM – 4:00 PM", description: "Early teaching shift" },
  { id: "standard", label: "9:00 AM – 5:00 PM", description: "Standard teaching shift" },
  { id: "late", label: "10:00 AM – 6:00 PM", description: "Late teaching shift" },
  { id: "weekend", label: "9:00 AM – 2:00 PM", description: "Short weekend shift" },
];

export const defaultWeeklyAvailability: InstructorAvailabilityDay[] = [
  { id: "monday", label: "Monday", shortLabel: "Mon", enabled: true, shiftId: "standard" },
  { id: "tuesday", label: "Tuesday", shortLabel: "Tue", enabled: true, shiftId: "standard" },
  { id: "wednesday", label: "Wednesday", shortLabel: "Wed", enabled: true, shiftId: "standard" },
  { id: "thursday", label: "Thursday", shortLabel: "Thu", enabled: true, shiftId: "standard" },
  { id: "friday", label: "Friday", shortLabel: "Fri", enabled: true, shiftId: "standard" },
  { id: "saturday", label: "Saturday", shortLabel: "Sat", enabled: true, shiftId: "weekend" },
  { id: "sunday", label: "Sunday", shortLabel: "Sun", enabled: false, shiftId: "weekend" },
];

export function formatTimeOffDate(dateId: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${dateId}T12:00:00.000Z`));
}

export function upcomingTimeOffOptions(daysAhead = 365) {
  // Nigeria has no daylight-saving changes; deriving dates in WAT avoids
  // offering yesterday when the device or server uses another time zone.
  const nowInWat = new Date(Date.now() + 60 * 60 * 1000);
  const start = Date.UTC(
    nowInWat.getUTCFullYear(),
    nowInWat.getUTCMonth(),
    nowInWat.getUTCDate(),
  );
  return Array.from({ length: daysAhead }, (_, offset) => {
    const date = new Date(start + offset * 24 * 60 * 60 * 1000);
    const id = date.toISOString().slice(0, 10);
    return {
      id,
      label: formatTimeOffDate(id),
      description: "Full day",
    };
  });
}
