const MINUTES_PER_DAY = 24 * 60;

export function timeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function minutesToTime(value: number): string {
  const normalized =
    ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}

export function formatTimetableTime(value: string): string {
  const minutes = timeToMinutes(value);
  if (minutes === null) return value;
  const hour24 = Math.floor(minutes / 60);
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minutes % 60).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
}

export function formatTimetableTimeRange(
  startTime: string,
  endTime: string,
): string {
  const start = formatTimetableTime(startTime);
  const end = formatTimetableTime(endTime);
  const startPeriod = start.slice(-2);
  return startPeriod === end.slice(-2)
    ? `${start.slice(0, -3)}–${end}`
    : `${start}–${end}`;
}

export function endTimeForDuration(
  startTime: string,
  durationMinutes: number,
): string {
  const start = timeToMinutes(startTime);
  return start === null ? "" : minutesToTime(start + durationMinutes);
}

export function durationBetweenTimes(
  startTime: string,
  endTime: string,
): number | null {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start === null || end === null) return null;
  return (end - start + MINUTES_PER_DAY) % MINUTES_PER_DAY;
}

export function formatTimetableDuration(durationMinutes: number): string {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} min`;
}

export function endsNextDay(startTime: string, endTime: string): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return start !== null && end !== null && end < start;
}
