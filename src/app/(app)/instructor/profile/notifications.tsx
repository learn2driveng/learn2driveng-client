import { useState } from "react";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  ToggleSettingRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function InstructorNotificationPreferencesScreen() {
  const { colors } = useAppTheme();
  const [lessonReminders, setLessonReminders] = useState(true);
  const [scheduleChanges, setScheduleChanges] = useState(true);
  const [reportReminders, setReportReminders] = useState(true);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Notifications" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Choose the teaching updates you want to receive.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <ToggleSettingRow
          title="Lesson reminders"
          description="A reminder before each scheduled lesson."
          value={lessonReminders}
          onValueChange={setLessonReminders}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Schedule changes"
          description="New assignments, reschedules, and cancellations."
          value={scheduleChanges}
          onValueChange={setScheduleChanges}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Report reminders"
          description="Prompts when a completed lesson still needs a report."
          value={reportReminders}
          onValueChange={setReportReminders}
        />
      </View>
    </DashboardScreen>
  );
}
