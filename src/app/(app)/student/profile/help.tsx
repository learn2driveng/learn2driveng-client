import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

type FaqItemProps = {
  question: string;
  answer: string;
};

function FaqItem({ question, answer }: FaqItemProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={() => setExpanded((current) => !current)}
      className="px-5 py-4 active:opacity-70"
    >
      <View className="flex-row items-center gap-4">
        <Text
          className="flex-1 font-figtree-bold text-[14px]"
          style={{ color: colors.text }}
        >
          {question}
        </Text>
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={21}
          color={colors.textSubtle}
        />
      </View>
      {expanded ? (
        <Text
          className="mt-3 font-figtree text-[13px] leading-5"
          style={{ color: colors.textMuted }}
        >
          {answer}
        </Text>
      ) : null}
    </Pressable>
  );
}

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
          answer="Open an upcoming booking from Sessions. Rescheduling and cancellation remain subject to the school’s policy."
        />
        <View
          className="mx-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <FaqItem
          question="Why does Learn2Drive request my location?"
          answer="Location helps sort nearby verified schools. You can continue with Lagos as your default instead."
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
