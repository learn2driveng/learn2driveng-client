import { Redirect, Stack } from "expo-router";

import { homeForRole } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

export default function AuthLayout() {
  const { colors } = useAppTheme();
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);

  if (status === "checking") return null;
  if (status === "authenticated" && role) {
    return <Redirect href={homeForRole(role)} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
