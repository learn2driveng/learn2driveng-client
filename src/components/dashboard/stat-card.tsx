import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type StatCardProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  accent?: string;
};

export function StatCard({ icon, label, value, accent }: StatCardProps) {
  const { colors } = useAppTheme();
  const iconColor = accent ?? colors.primary;

  return (
    <View
      className="min-h-32 flex-1 justify-between rounded-3xl border p-5"
      style={{ borderColor: colors.border, backgroundColor: colors.surface }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons name={icon} size={21} color={iconColor} />
      </View>
      <View className="mt-5">
        <Text
          className="font-figtree-bold text-[24px]"
          style={{ color: colors.text }}
        >
          {value}
        </Text>
        <Text
          className="mt-1 font-figtree text-[13px]"
          style={{ color: colors.textMuted }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
