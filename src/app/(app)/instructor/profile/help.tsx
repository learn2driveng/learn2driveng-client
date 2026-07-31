import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { FaqItem } from "@/features/profile";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function InstructorHelpScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Help & support" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Find quick answers or contact your school for help.
      </Text>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        FREQUENTLY ASKED QUESTIONS
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <FaqItem
          question="How are lessons assigned?"
          answer="Your school assigns lessons within the hours you mark as available."
        />
        <View
          className="mx-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <FaqItem
          question="What happens after a lesson?"
          answer="End the active session, then complete the attendance and learner report."
        />
        <View
          className="mx-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <FaqItem
          question="Who controls live location sharing?"
          answer="The learner creates and shares a private tracking link during an active lesson. No guardian account is required."
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        CONTACT
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="school-outline"
          title="Contact your school"
          description="Questions about assignments, schedules, or learners"
          onPress={() =>
            router.push({
              pathname: "/instructor/profile/support",
              params: { mode: "school" },
            })
          }
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="lifebuoy"
          title="Contact Learn2Drive"
          description="Technical or account support"
          onPress={() =>
            router.push({
              pathname: "/instructor/profile/support",
              params: { mode: "contact" },
            })
          }
        />
      </View>
    </DashboardScreen>
  );
}
