import { useState } from "react";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  ToggleSettingRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function NotificationPreferencesScreen() {
  const { colors } = useAppTheme();
  const [sessionReminders, setSessionReminders] = useState(true);
  const [packageUpdates, setPackageUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Notifications" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Choose the updates you want to receive.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <ToggleSettingRow
          title="Session reminders"
          description="Booking confirmations and reminders before each session."
          value={sessionReminders}
          onValueChange={setSessionReminders}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Package updates"
          description="Session balance, package expiry and renewal information."
          value={packageUpdates}
          onValueChange={setPackageUpdates}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Offers and announcements"
          description="Product news, promotions and driving school announcements."
          value={promotions}
          onValueChange={setPromotions}
        />
      </View>
    </DashboardScreen>
  );
}
