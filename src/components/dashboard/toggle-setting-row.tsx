import { Text, View, Switch } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type ToggleSettingRowProps = {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export function ToggleSettingRow({
  title,
  description,
  value,
  onValueChange,
}: ToggleSettingRowProps) {
  const { colors } = useAppTheme();

  return (
    <View className="min-h-18 flex-row items-center gap-4 px-4 py-4">
      <View className="flex-1">
        <Text
          className="font-figtree-semibold text-[15px]"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            className="mt-1 font-figtree text-[12px] leading-4"
            style={{ color: colors.textMuted }}
          >
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceStrong, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
