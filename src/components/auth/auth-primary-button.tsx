import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type AuthPrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
};

export function AuthPrimaryButton({
  label,
  onPress,
  showArrow = false,
}: AuthPrimaryButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-16 flex-row items-center justify-center gap-3 rounded-[18px] active:opacity-80"
      style={{ backgroundColor: colors.primary }}
    >
      <Text
        className="font-figtree-bold text-[17px]"
        style={{ color: colors.onPrimary }}
      >
        {label}
      </Text>
      {showArrow ? (
        <MaterialCommunityIcons name="arrow-right" size={24} color={colors.onPrimary} />
      ) : null}
    </Pressable>
  );
}
