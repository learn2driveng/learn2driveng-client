import { Stack } from "expo-router";

import { MarketplaceNavigationProvider } from "@/features/school-discovery/marketplace-navigation";

export default function ExploreLayout() {
  return (
    <MarketplaceNavigationProvider scope="learner">
      <Stack screenOptions={{ headerShown: false }} />
    </MarketplaceNavigationProvider>
  );
}
