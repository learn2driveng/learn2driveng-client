import type { SessionCoordinates } from "@/types";

export function formatLiveLocation(coordinates: SessionCoordinates) {
  const address = coordinates.address?.formattedAddress?.trim();

  return (
    address ??
    `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}`
  );
}
