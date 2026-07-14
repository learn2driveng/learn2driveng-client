import { Stack } from "expo-router";

import { useAppTheme } from "@/hooks/use-app-theme";

export default function SchoolOnboardingLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
