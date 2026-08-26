import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type SupportRequestScreenProps = {
  backHref?: "/student/profile/help" | "/instructor/profile/help";
};

export function SupportRequestScreen({ backHref }: SupportRequestScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isProblemReport = mode === "report";
  const isSchoolRequest = mode === "school";
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  if (submitted) {
    return (
      <DashboardScreen>
        <View className="items-center pt-12">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={46}
              color={colors.success}
            />
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            className="mt-7 text-center font-figtree-bold text-[27px]"
            style={{ color: colors.text }}
          >
            {isProblemReport ? "Problem report ready" : "Support request ready"}
          </Text>
          <Text
            className="mt-3 max-w-[320px] text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            The form flow is complete. Connect this action to the support
            service before enabling it in production.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            backHref ? router.replace(backHref) : router.back()
          }
          className="mt-10 h-14 items-center justify-center rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            {backHref ? "Back to help" : "Go back"}
          </Text>
        </Pressable>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader
        title={
          isProblemReport
            ? "Report a problem"
            : isSchoolRequest
              ? "Contact your school"
              : "Contact support"
        }
      />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        {isProblemReport
          ? "Describe what happened and what you expected to see."
          : isSchoolRequest
            ? "Tell your school what you need help with."
            : "Tell us what you need help with and provide enough detail to investigate."}
      </Text>

      <Text
        className="mb-2 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.2px]"
        style={{ color: colors.textSubtle }}
      >
        SUBJECT
      </Text>
      <TextInput
        accessibilityLabel="Subject"
        value={subject}
        onChangeText={setSubject}
        placeholder={
          isProblemReport
            ? "Briefly describe the problem"
            : "What do you need help with?"
        }
        placeholderTextColor={colors.textFaint}
        className="h-14 rounded-2xl border px-4 text-[14px]"
        style={{
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          fontFamily: fontFamily.figtree,
        }}
      />

      <Text
        className="mb-2 mt-6 ml-1 font-figtree-bold text-[11px] tracking-[1.2px]"
        style={{ color: colors.textSubtle }}
      >
        DETAILS
      </Text>
      <TextInput
        accessibilityLabel="Details"
        value={message}
        onChangeText={setMessage}
        placeholder="Add the details here"
        placeholderTextColor={colors.textFaint}
        multiline
        textAlignVertical="top"
        className="min-h-[160px] rounded-2xl border px-4 py-4 text-[14px]"
        style={{
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          fontFamily: fontFamily.figtree,
        }}
      />

      <View
        className="mt-5 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={19}
          color={colors.textMuted}
        />
        <Text
          className="flex-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          This currently demonstrates the support UI. No external message is
          sent until a support endpoint is configured.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        disabled={!canSubmit}
        onPress={() => setSubmitted(true)}
        className="mt-7 h-14 items-center justify-center rounded-2xl active:opacity-80"
        style={{
          backgroundColor: canSubmit ? colors.primary : colors.surfaceStrong,
        }}
      >
        <Text
          className="font-figtree-bold text-[15px]"
          style={{ color: canSubmit ? colors.onPrimary : colors.textSubtle }}
        >
          {isProblemReport ? "Submit report" : "Submit request"}
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}
