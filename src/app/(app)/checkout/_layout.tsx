import { Redirect, Stack } from "expo-router";

import { useRoleRouteAccess } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function CheckoutLayout() {
  const { colors } = useAppTheme();
  const access = useRoleRouteAccess("learner", "/student/explore");

  if (access.status === "checking") return null;
  if (access.status === "redirect") return <Redirect href={access.href} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
