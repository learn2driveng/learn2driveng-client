import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type BookingOptionCardProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  meta?: string;
  selected: boolean;
  onPress: () => void;
};

export function BookingOptionCard({
  icon,
  title,
  description,
  meta,
  selected,
  onPress,
}: BookingOptionCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-3xl border-2 p-4 active:opacity-75"
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: selected ? colors.primary : colors.surfaceStrong,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={selected ? "#041320" : colors.text}
        />
      </View>
      <View className="flex-1">
        <Text
          className="font-figtree-bold text-[15px]"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        <Text
          className="mt-1 font-figtree text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {description}
        </Text>
        {meta ? (
          <Text
            className="mt-2 font-figtree-semibold text-[12px]"
            style={{ color: colors.primary }}
          >
            {meta}
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons
        name={selected ? "check-circle" : "circle-outline"}
        size={23}
        color={selected ? colors.primary : colors.textSubtle}
      />
    </Pressable>
  );
}
