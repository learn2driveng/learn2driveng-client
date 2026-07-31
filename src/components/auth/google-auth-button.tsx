import { FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator, Pressable } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type GoogleAuthButtonProps = {
  onPress: () => void;
  loading?: boolean;
};

export function GoogleAuthButton({
  onPress,
  loading = false,
}: GoogleAuthButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue with Google"
      accessibilityState={{ busy: loading, disabled: loading }}
      disabled={loading}
      hitSlop={8}
      onPress={onPress}
      className="h-14 w-14 items-center justify-center self-center rounded-full border active:opacity-70"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <FontAwesome name="google" size={21} color={colors.text} />
      )}
    </Pressable>
  );
}
