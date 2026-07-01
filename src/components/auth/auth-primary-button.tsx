import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type AuthPrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
};

export function AuthPrimaryButton({
  label,
  onPress,
  showArrow = false,
  disabled = false,
}: AuthPrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || !onPress;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className="h-16 flex-row items-center justify-center gap-3 rounded-full active:opacity-80"
      style={{
        backgroundColor: isDisabled ? colors.surfaceStrong : colors.primary,
        borderRadius: borderRadius.button,
        overflow: "hidden",
      }}
    >
      <Text
        className="font-figtree-bold text-[17px]"
        style={{ color: isDisabled ? colors.textSubtle : colors.onPrimary }}
      >
        {label}
      </Text>
      {showArrow ? (
        <MaterialCommunityIcons
          name="arrow-right"
          size={24}
          color={isDisabled ? colors.textSubtle : colors.onPrimary}
        />
      ) : null}
    </Pressable>
  );
}
