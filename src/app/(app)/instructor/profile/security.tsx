import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { instructorProfile } from "@/sample_data/instructor";

export default function InstructorSecurityScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Security" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Manage your password and account access.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="lock-reset"
          title="Change password"
          description={`Receive a verification code at ${instructorProfile.email}`}
          onPress={() =>
            router.push({
              pathname: "/forgot-password",
              params: { email: instructorProfile.email },
            })
          }
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="shield-check-outline"
          title="Account verification"
          description="Instructor identity and licence verified"
          value="Verified"
        />
      </View>
    </DashboardScreen>
  );
}
