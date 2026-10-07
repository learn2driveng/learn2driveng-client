import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { FaqItem } from "@/features/profile";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function HelpSupportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Help & support" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Find quick answers or send a request to the support team.
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
          question="How do session credits work?"
          answer="Each booking uses one session from the package you select. Credits remain tied to that package."
        />
        <View
          className="mx-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <FaqItem
          question="Can I reschedule or cancel a lesson?"
          answer="Open an upcoming booking from Sessions. You can reschedule or cancel until 3 hours before the lesson starts."
        />
        <View
          className="mx-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <FaqItem
          question="Why does Learn2Drive request my location?"
          answer="Location helps sort nearby verified schools. You can choose a preferred area instead."
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
          icon="message-text-outline"
          title="Contact support"
          description="Ask a question about your account or training"
          onPress={() =>
            router.push({
              pathname: "/student/profile/support",
              params: { mode: "contact" },
            })
          }
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="alert-circle-outline"
          title="Report a problem"
          description="Tell us when something in the app is not working"
          onPress={() =>
            router.push({
              pathname: "/student/profile/support",
              params: { mode: "report" },
            })
          }
        />
      </View>
    </DashboardScreen>
  );
}
