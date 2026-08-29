import { Stack } from "expo-router";

import { PushNotificationsProvider } from "@/features/notifications";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function AppLayout() {
  const { colors } = useAppTheme();

  return (
    <>
      <PushNotificationsProvider />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  );
}
