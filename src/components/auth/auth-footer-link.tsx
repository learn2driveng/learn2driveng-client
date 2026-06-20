import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type AuthFooterLinkProps = {
  prompt: string;
  action: string;
  onPress: () => void;
  underline?: boolean;
};

export function AuthFooterLink({
  prompt,
  action,
  onPress,
  underline = false,
}: AuthFooterLinkProps) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row flex-wrap items-center justify-center">
      <Text
        className="font-figtree text-[15px]"
        style={{ color: colors.textMuted }}
      >
        {prompt}{" "}
      </Text>
      <Pressable
        accessibilityRole="link"
        onPress={onPress}
        className={`${underline ? "border-b-2" : ""} active:opacity-60`}
        style={underline ? { borderColor: colors.primary } : undefined}
      >
        <Text
          className="font-figtree-semibold text-[15px]"
          style={{ color: colors.text }}
        >
          {action}
        </Text>
      </Pressable>
    </View>
  );
}
