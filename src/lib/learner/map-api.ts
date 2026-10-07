import type { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { AuthUser, BookingListItem } from "@/types";

const packageIcons: ComponentProps<
  typeof MaterialCommunityIcons
>["name"][] = [
  "shield-car",
  "steering",
  "car-shift-pattern",
  "car-sports",
  "car-estate",
];

type EnrichedRef = {
  id?: string;
  name?: string;
};

type EnrichedLearnerBooking = BookingListItem & {
  packageId?: string | EnrichedRef;
  schoolId?: string | EnrichedRef;
};

export type LearnerPackageCredit = {
  id: string;
  bookingId: string;
  packageId: string;
  name: string;
  schoolName: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  totalSessions: number;
  remainingSessions: number;
  expiresAt?: string | null;
  status: "active" | "expired" | "pending" | "completed" | "cancelled";
};

function readRefName(value: string | EnrichedRef | undefined, fallback: string) {
  if (typeof value === "object" && value && "name" in value && value.name) {
    return value.name;
  }
  return fallback;
}

function packageIconForName(name: string) {
  const hash = name
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  return packageIcons[hash % packageIcons.length] ?? "steering";
}

function remainingSessions(booking: BookingListItem) {
  return Math.max(
    booking.sessionsTotal - booking.sessionsScheduledCount,
    0,
  );
}

function readRefId(value: string | EnrichedRef | undefined) {
  return typeof value === "string" ? value : (value?.id ?? "");
}

function packageStatus(
  booking: BookingListItem,
): LearnerPackageCredit["status"] {
  if (booking.status === "cancelled") return "cancelled";
  if (booking.status === "completed") return "completed";
  if (booking.status === "initiated") {
    return "pending";
  }
  if (booking.expiresAt && Date.parse(booking.expiresAt) <= Date.now()) {
    return "expired";
  }
  return "active";
}

export function bookingToLearnerPackage(
  booking: EnrichedLearnerBooking,
): LearnerPackageCredit {
  const packageName =
    booking.packageName ??
    readRefName(booking.packageId, "Training package");
  const schoolName =
    booking.schoolName ?? readRefName(booking.schoolId, "Driving school");

  return {
    id: booking.packageId && typeof booking.packageId === "string"
      ? `${booking.id}-${booking.packageId}`
      : booking.id,
    bookingId: booking.id,
    packageId: readRefId(booking.packageId),
    name: packageName,
    schoolName,
    icon: packageIconForName(packageName),
    totalSessions: booking.sessionsTotal,
    remainingSessions: remainingSessions(booking),
    expiresAt: booking.expiresAt,
    status: packageStatus(booking),
  };
}

export function learnerPackagesFromBookings(bookings: BookingListItem[]) {
  return bookings.map(bookingToLearnerPackage);
}

export function userDisplayName(user: Pick<AuthUser, "firstName" | "lastName">) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function userInitials(user: Pick<AuthUser, "firstName" | "lastName">) {
  const parts = userDisplayName(user).split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatLearnerId(userId: string) {
  return `L2D-${userId.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

export function activeLearnerPackages(packages: LearnerPackageCredit[]) {
  return packages.filter((item) => item.status === "active");
}

export function expiredLearnerPackages(packages: LearnerPackageCredit[]) {
  return packages.filter((item) =>
    item.status === "expired" || item.status === "completed" || item.status === "cancelled",
  );
}
