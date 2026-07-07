import { View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";

export default function GuardianActivityScreen() {
  return (
    <DashboardScreen>
      <DashboardPageHeader title="Activity" showBack={false} />
      <View className="mt-8">
        <ContentEmptyState
          icon="history"
          title="No learner activity yet"
          description="Completed sessions and progress updates from linked learners will appear here."
        />
      </View>
    </DashboardScreen>
  );
}
