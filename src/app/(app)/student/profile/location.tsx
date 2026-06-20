import { useState } from "react";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
  ToggleSettingRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function LocationSettingsScreen() {
  const { colors } = useAppTheme();
  const [locationAccess, setLocationAccess] = useState(false);
  const [shareDuringSessions, setShareDuringSessions] = useState(true);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Location" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Control how Learn2Drive uses your location.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <ToggleSettingRow
          title="Location access"
          description="Use your location to find nearby schools and instructors."
          value={locationAccess}
          onValueChange={setLocationAccess}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Share during sessions"
          description="Allow your assigned school to track active driving sessions."
          value={shareDuringSessions}
          onValueChange={setShareDuringSessions}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        DEFAULT AREA
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="map-marker-outline"
          title="Preferred location"
          description="Used when searching for schools and sessions"
          value="Lagos"
        />
      </View>
    </DashboardScreen>
  );
}
