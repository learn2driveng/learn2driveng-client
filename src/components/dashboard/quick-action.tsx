import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { useAppTheme } from "@/hooks/use-app-theme";

type QuickActionProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function QuickAction({ icon, label, onPress, style }: QuickActionProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className="min-h-24 flex-1 items-center justify-center gap-3 rounded-3xl border p-4 active:opacity-70"
      style={[
        {
          ...surfaces.card,
          opacity: onPress ? 1 : 0.7,
        },
        style,
      ]}
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
