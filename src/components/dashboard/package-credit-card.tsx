import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type PackageCreditCardProps = {
  name: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  totalSessions: number;
  remainingSessions: number;
  onPress?: () => void;
  selected?: boolean;
};

export function PackageCreditCard({
  name,
  icon,
  totalSessions,
  remainingSessions,
  onPress,
  selected,
}: PackageCreditCardProps) {
  const { colors } = useAppTheme();
  const isSelectable = selected !== undefined;
  const remainingPercentage =
    `${Math.round((remainingSessions / totalSessions) * 100)}%` as const;

  return (
    <Pressable
      accessibilityRole={isSelectable ? "radio" : "button"}
      accessibilityState={isSelectable ? { selected } : undefined}
      onPress={onPress}
      className="rounded-3xl border-2 p-5 active:opacity-70"
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={25}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree-bold text-[16px]"
            style={{ color: colors.text }}
          >
            {name}
          </Text>
          <Text
            className="mt-1 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {remainingSessions} of {totalSessions} sessions remaining
          </Text>
        </View>
        <MaterialCommunityIcons
          name={
            isSelectable
              ? selected
                ? "check-circle"
                : "circle-outline"
              : "chevron-right"
          }
          size={23}
          color={selected ? colors.primary : colors.textSubtle}
        />
      </View>
      <View
        className="mt-4 h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: remainingPercentage,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </Pressable>
  );
}
