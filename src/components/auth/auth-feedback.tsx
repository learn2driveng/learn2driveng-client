import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type AuthFeedbackTone = "error" | "success" | "info";

interface AuthFeedbackProps {
  message: string;
  tone?: AuthFeedbackTone;
  onDismiss?: () => void;
}

export function AuthFeedback({
  message,
  tone = "info",
  onDismiss,
}: AuthFeedbackProps) {
  const { colors } = useAppTheme();
  const accentColor =
    tone === "error"
      ? colors.error
      : tone === "success"
        ? colors.success
        : colors.primary;
  const backgroundColor =
    tone === "error"
      ? `${colors.error}14`
      : tone === "success"
        ? colors.successSoft
        : colors.surfaceStrong;
  const icon =
    tone === "error"
      ? "alert-circle-outline"
      : tone === "success"
        ? "check-circle-outline"
        : "information-outline";

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      accessibilityRole={tone === "error" ? "alert" : undefined}
      accessibilityLiveRegion={tone === "error" ? "assertive" : "polite"}
      className="min-h-14 flex-row items-start border px-4 py-3"
      style={{
        backgroundColor,
        borderColor: accentColor,
        borderLeftWidth: 3,
        borderRadius: 6,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={accentColor}
        style={{ marginTop: 1 }}
      />
      <Text
        className="ml-3 flex-1 text-[13px] leading-5"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
      >
        {message}
      </Text>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          hitSlop={10}
          onPress={onDismiss}
          className="ml-2 h-6 w-6 items-center justify-center active:opacity-60"
        >
          <MaterialCommunityIcons
            name="close"
            size={17}
            color={colors.textMuted}
          />
        </Pressable>
      ) : null}
    </Animated.View>
  );
}
