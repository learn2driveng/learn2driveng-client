import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between">
      <Text
        accessibilityRole="header"
        className="font-figtree-bold text-[20px]"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${actionLabel}, ${title}`}
          hitSlop={4}
          onPress={onActionPress}
          className="-mr-2 min-h-11 justify-center px-2 active:opacity-60"
        >
          <Text
            className="font-figtree-semibold text-[13px]"
            style={{ color: colors.primary }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
