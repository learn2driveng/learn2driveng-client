import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type AuthPrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

export function AuthPrimaryButton({
  label,
  onPress,
  showArrow = false,
  disabled = false,
  loading = false,
}: AuthPrimaryButtonProps) {
  const { colors } = useAppTheme();
  const isDisabled = disabled || loading || !onPress;

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
      {loading ? (
        <ActivityIndicator size="small" color={colors.textSubtle} />
      ) : (
        <Text
          className="font-figtree-bold text-[17px]"
          style={{ color: isDisabled ? colors.textSubtle : colors.onPrimary }}
        >
          {label}
        </Text>
      )}
      {showArrow && !loading ? (
        <MaterialCommunityIcons
          name="arrow-right"
          size={24}
          color={isDisabled ? colors.textSubtle : colors.onPrimary}
        />
      ) : null}
    </Pressable>
  );
}
