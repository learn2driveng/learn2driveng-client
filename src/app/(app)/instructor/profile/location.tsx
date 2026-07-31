import { useState } from "react";
import { Linking, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
  ToggleSettingRow,
} from "@/components/dashboard";
import { useUserLocation } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function InstructorLocationSettingsScreen() {
  const { colors } = useAppTheme();
  const location = useUserLocation();
  const [useDuringLessons, setUseDuringLessons] = useState(true);
  const locationValue = location.isChecking
    ? "Checking"
    : location.isGranted
      ? "Allowed"
      : "Not allowed";

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Location" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Control how location is used while you teach.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="map-marker-radius-outline"
          title="Location access"
          description="Used for lesson check-in and active session records."
          value={locationValue}
          onPress={() => {
            if (location.isGranted || location.canAskAgain) {
              void location.requestLocation();
              return;
            }
            void Linking.openSettings();
          }}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Use during active lessons"
          description="Record location only while a teaching session is active."
          value={useDuringLessons}
          onValueChange={setUseDuringLessons}
        />
      </View>

      <View
        className="mt-5 flex-row gap-3 rounded-2xl px-4 py-4"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <Text
          className="flex-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          Private live-location links belong to the learner. This setting only
          controls the instructor-side session record.
        </Text>
      </View>
    </DashboardScreen>
  );
}
