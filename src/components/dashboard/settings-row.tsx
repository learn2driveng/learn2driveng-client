import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type SettingsRowProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

export function SettingsRow({
  icon,
  title,
  description,
  value,
  onPress,
  destructive = false,
}: SettingsRowProps) {
  const { colors } = useAppTheme();
  const foreground = destructive ? colors.error : colors.text;

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      disabled={!onPress}
      className="min-h-18 flex-row items-center gap-4 px-4 py-3 active:opacity-65"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons name={icon} size={21} color={foreground} />
      </View>
      <View className="flex-1">
        <Text
          className="font-figtree-semibold text-[15px]"
          style={{ color: foreground }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            className="mt-0.5 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text
          className="font-figtree text-[13px]"
          style={{ color: colors.textMuted }}
        >
          {value}
        </Text>
      ) : null}
      {onPress ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.textSubtle}
        />
      ) : null}
    </Pressable>
  );
}
