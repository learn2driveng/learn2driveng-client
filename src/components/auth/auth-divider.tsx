import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

export function AuthDivider() {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-4">
      <View
        className="h-px flex-1"
        style={{ backgroundColor: colors.border }}
      />
      <Text
        className="font-figtree-semibold text-[11px] tracking-[2.3px]"
        style={{ color: colors.textSubtle }}
      >
        OR CONTINUE WITH
      </Text>
      <View
        className="h-px flex-1"
        style={{ backgroundColor: colors.border }}
      />
    </View>
  );
}
