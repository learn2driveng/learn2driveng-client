export type GuardianMapLocation = {
  latitude: number;
  longitude: number;
  heading?: number | null;
  accuracyInMeters?: number | null;
};

export type GuardianLiveLocationMapProps = {
  /** Latest training-vehicle position (instructor GPS preferred). */
  vehicle: GuardianMapLocation | null;
  vehicleLabel?: string;
  /** Vehicle route polyline. */
  path?: GuardianMapLocation[];
};
