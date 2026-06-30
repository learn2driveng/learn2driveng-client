import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type QuickActionProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
};

export function QuickAction({ icon, label, onPress }: QuickActionProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className="min-h-24 flex-1 items-center justify-center gap-3 rounded-3xl border p-4 active:opacity-70"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: onPress ? 1 : 0.7,
      }}
    >
      <MaterialCommunityIcons name={icon} size={25} color={colors.primary} />
      <Text
        className="text-center font-figtree-semibold text-[13px]"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
