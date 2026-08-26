import { Stack } from "expo-router";

import { MarketplaceNavigationProvider } from "@/features/school-discovery/marketplace-navigation";

export default function PublicExploreLayout() {
  return (
    <MarketplaceNavigationProvider scope="public">
      <Stack screenOptions={{ headerShown: false }} />
    </MarketplaceNavigationProvider>
  );
}
