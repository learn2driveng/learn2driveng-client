import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type DashboardEmptyStateProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  actionLabel: string;
  onActionPress: () => void;
};

export function DashboardEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: DashboardEmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="items-center rounded-3xl border px-6 py-8"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons name={icon} size={27} color={colors.primary} />
      </View>
      <Text
        accessibilityRole="header"
        className="mt-4 text-center font-figtree-bold text-[17px]"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      <Text
        className="mt-2 max-w-[280px] text-center font-figtree text-[13px] leading-5"
        style={{ color: colors.textMuted }}
      >
        {description}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onActionPress}
        className="mt-5 h-12 items-center justify-center rounded-2xl px-6 active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <Text
          className="font-figtree-bold text-[14px]"
          style={{ color: colors.onPrimary }}
        >
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}
