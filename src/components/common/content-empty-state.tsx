import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type ContentEmptyStateProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function ContentEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onActionPress,
}: ContentEmptyStateProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const showAction = Boolean(actionLabel && onActionPress);

  return (
    <View
      accessibilityLiveRegion="polite"
      className="items-center rounded-3xl border px-6 py-12"
      style={surfaces.card}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={30}
          color={colors.textSubtle}
        />
      </View>

      <Text
        accessibilityRole="header"
        className="mt-4 text-center text-[17px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        {title}
      </Text>
      <Text
        className="mt-2 max-w-[290px] text-center text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        {description}
      </Text>

      {showAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onActionPress}
          className="mt-5 h-12 items-center justify-center rounded-full px-6 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
