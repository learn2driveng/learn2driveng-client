import { Text } from "react-native";

import { DashboardScreen } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentProgressScreen() {
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <Text
        className="font-figtree-bold text-[30px]"
        style={{ color: colors.text }}
      >
        Progress
      </Text>
      <Text
        className="mt-2 font-figtree text-[16px]"
        style={{ color: colors.textMuted }}
      >
        Learning milestones, assessments and driving hours will appear here.
      </Text>
    </DashboardScreen>
  );
}
