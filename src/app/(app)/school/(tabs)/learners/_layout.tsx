import { Stack } from "expo-router";
import { useEffect } from "react";

import { useAppTheme } from "@/hooks/use-app-theme";
import { refreshSchoolLearners } from "@/lib/school/hydrate-school-operations";

export default function SchoolLearnersLayout() {
  const { colors } = useAppTheme();

  useEffect(() => {
    void refreshSchoolLearners().catch(() => undefined);
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
