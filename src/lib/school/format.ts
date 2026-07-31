import type { VehicleTransmissionType } from "@/types/school";

export function formatTransmissionLabel(
  transmissionType: VehicleTransmissionType,
): string {
  return transmissionType === "automatic" ? "Automatic" : "Manual";
}

export function formatPackageDurationDays(durationInDays: number): string {
  if (durationInDays < 7) {
    return durationInDays === 1 ? "1 day" : `${durationInDays} days`;
  }
  const weeks = Math.round(durationInDays / 7);
  return weeks === 1 ? "1 week" : `${weeks} weeks`;
}

export function formatSchoolLocation(city: string, state: string): string {
  return `${city}, ${state}`;
}

export function formatFullAddress(parts: {
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  country?: string;
}): string {
  const line2 = parts.addressLine2?.trim();
  const locality = formatSchoolLocation(parts.city, parts.state);
  return [parts.addressLine1, line2, locality, parts.country]
    .filter(Boolean)
    .join(", ");
}

export function vehicleDisplayName(input: {
  make: string;
  model: string;
  year?: number;
}): string {
  return input.year
    ? `${input.make} ${input.model} (${input.year})`
    : `${input.make} ${input.model}`;
}

export function computeStartingPrice(
  packages: { price: number; isActive?: boolean }[],
): number {
  const active = packages.filter((pkg) => pkg.isActive !== false);
  if (active.length === 0) {
    return 0;
  }
  return Math.min(...active.map((pkg) => pkg.price));
}

export function isSchoolMarketplaceVisible(
  verificationStatus: string | undefined,
): boolean {
  return verificationStatus === "approved";
}
