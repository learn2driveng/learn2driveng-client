import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentAccountScreen() {
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Account" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Your personal and contact information.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="account-outline"
          title="Full name"
          value="Alex Jordan"
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="email-outline"
          title="Email"
          value="alex@example.com"
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="phone-outline"
          title="Phone"
          value="+234 800 000 0000"
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow icon="identifier" title="Student ID" value="L2D-20481" />
      </View>
    </DashboardScreen>
  );
}
