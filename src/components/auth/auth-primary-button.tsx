import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { borderRadius } from "@/constants/theme";
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
      className="h-16 flex-row items-center justify-center gap-3 rounded-full active:opacity-80"
      style={{
        backgroundColor: colors.primary,
        borderRadius: borderRadius.button,
        overflow: "hidden",
      }}
    >
      <Text
        className="font-figtree-bold text-[17px]"
        style={{ color: "#041320" }}
      >
        {label}
      </Text>
      {showArrow ? (
        <MaterialCommunityIcons name="arrow-right" size={24} color="#041320" />
      ) : null}
    </Pressable>
  );
}
