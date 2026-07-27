import { vehicleDisplayName } from "@/lib/school/format";

export function parseVehicleDisplayName(name: string): {
  make: string;
  model: string;
  year: number;
} {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 0) {
    return { make: "Vehicle", model: "Unknown", year: new Date().getFullYear() };
  }
  if (parts.length === 1) {
    return { make: parts[0], model: "Fleet", year: new Date().getFullYear() };
  }
  return {
    make: parts[0],
    model: parts.slice(1).join(" "),
    year: new Date().getFullYear(),
  };
}

export function vehicleNameFromParts(input: {
  make: string;
  model: string;
  year?: number;
}): string {
  return vehicleDisplayName(input);
}
