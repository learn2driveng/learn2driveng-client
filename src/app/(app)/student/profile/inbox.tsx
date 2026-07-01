import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function NotificationInboxScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Notifications" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Booking reminders, package updates and important account activity.
      </Text>

      <View className="mt-8">
        <DashboardEmptyState
          icon="bell-check-outline"
          title="You’re all caught up"
          description="New session reminders and package updates will appear here."
          actionLabel="Notification preferences"
          onActionPress={() => router.push("/student/profile/notifications")}
        />
      </View>
    </DashboardScreen>
  );
}
