export type GuardianMapLocation = {
  latitude: number;
  longitude: number;
  heading?: number | null;
  accuracyInMeters?: number | null;
};

export type GuardianLiveLocationMapProps = {
  instructor: GuardianMapLocation | null;
  learner: GuardianMapLocation | null;
  instructorLabel?: string;
  learnerLabel?: string;
  path?: GuardianMapLocation[];
};
