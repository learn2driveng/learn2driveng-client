import { Stack } from "expo-router";

import { RoleRouteGuard } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function CheckoutLayout() {
  const { colors } = useAppTheme();
  return (
    <RoleRouteGuard allowedRoles={["learner"]} fallbackReturnTo="/student/explore">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </RoleRouteGuard>
  );
}
