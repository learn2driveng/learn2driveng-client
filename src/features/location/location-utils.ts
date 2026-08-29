import type * as Location from "expo-location";

export function toLocationPingPayload(location: Location.LocationObject) {
  const { coords, timestamp } = location;
  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracyInMeters: coords.accuracy ?? undefined,
    heading: coords.heading != null && coords.heading >= 0 ? coords.heading : undefined,
    speed: coords.speed != null && coords.speed >= 0 ? coords.speed : undefined,
    recordedAt: new Date(timestamp).toISOString(),
  };
}

export function toSessionCoordinates(location: Location.LocationObject) {
  const payload = toLocationPingPayload(location);
  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    accuracy: payload.accuracyInMeters ?? null,
    accuracyInMeters: payload.accuracyInMeters ?? null,
    heading: payload.heading ?? null,
    speed: payload.speed ?? null,
    recordedAt: payload.recordedAt,
  };
}
