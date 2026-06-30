import {
  Redirect,
  Stack,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";

import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

export default function AppLayout() {
  const { colors } = useAppTheme();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  if (!isAuthenticated) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string") query.set(key, value);
    });
    const returnTo = query.size ? `${pathname}?${query.toString()}` : pathname;

    return <Redirect href={{ pathname: "/login", params: { returnTo } }} />;
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
