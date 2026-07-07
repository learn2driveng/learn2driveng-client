import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type FaqItemProps = {
  question: string;
  answer: string;
};

export function FaqItem({ question, answer }: FaqItemProps) {
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
