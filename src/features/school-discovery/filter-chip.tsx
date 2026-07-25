import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type FilterChipProps = {
  label?: string;
  icon: IconName;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
};

export function FilterChip({
  label,
  icon,
  selected = false,
  disabled = false,
  onPress,
  accessibilityLabel,
}: FilterChipProps) {
  const { colors } = useAppTheme();
  const isToggle = label !== undefined;

  return (
    <Pressable
      accessibilityRole={isToggle ? "togglebutton" : "button"}
      accessibilityState={
        isToggle ? { checked: selected, disabled } : { disabled }
      }
      accessibilityLabel={accessibilityLabel ?? label}
      hitSlop={4}
      disabled={disabled}
      onPress={onPress}
      className="h-9 flex-row items-center gap-2 rounded-full border px-4 active:opacity-70"
      style={{
        backgroundColor: selected ? colors.primary : colors.surface,
        borderColor: selected ? colors.primary : colors.border,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={14}
        color={selected ? colors.onPrimary : colors.textMuted}
      />
      {label ? (
        <Text
          className="text-[11px]"
          style={{
            color: selected ? colors.onPrimary : colors.textMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
