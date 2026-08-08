import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

export default function InstructorAccountScreen() {
  const { colors } = useAppTheme();
  const profile = useInstructorOperationsStore((state) => state.profile);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Account" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Your personal, school, and instructor information.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="account-outline"
          title="Full name"
          value={profile.name}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="email-outline"
          title="Email"
          value={profile.email}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="phone-outline"
          title="Phone"
          value={profile.phone}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        INSTRUCTOR DETAILS
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="identifier"
          title="Instructor ID"
          value={profile.instructorId}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="card-account-details-outline"
          title="Licence number"
          value={profile.licenceNumber ?? "Not provided"}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="school-outline"
          title="Driving school"
          value={profile.schoolName}
        />
      </View>
    </DashboardScreen>
  );
}
