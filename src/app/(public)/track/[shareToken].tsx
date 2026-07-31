import { useLocalSearchParams } from "expo-router";

import { PublicLiveLocationScreen } from "@/features/live-location/public-live-location-screen";

export default function PublicLiveLocationRoute() {
  const { shareToken } = useLocalSearchParams<{ shareToken?: string }>();

  return <PublicLiveLocationScreen shareToken={shareToken} />;
}
