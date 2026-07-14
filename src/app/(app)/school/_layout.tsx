import { Redirect, Stack, usePathname } from "expo-router";

import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolLayout() {
  const { colors } = useAppTheme();
  const role = useAuthStore((state) => state.role);
  const pathname = usePathname();
  const verificationStatus = useSchoolOperationsStore(
    (state) => state.profile.verificationStatus,
  );

  if (role !== "school_admin") {
    return (
      <Redirect
        href={
          role === "learner"
            ? "/student"
            : role === "instructor"
              ? "/instructor"
              : role === "guardian"
                ? "/guardian"
                : "/login"
        }
      />
    );
  }

  if (
    verificationStatus !== "verified" &&
    !pathname.startsWith("/school/onboarding")
  ) {
    return <Redirect href="/school/onboarding" />;
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
