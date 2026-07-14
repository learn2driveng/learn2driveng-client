import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSurfaceStyles } from "@/components/common/surface";
import { useSettingsStore, type ThemePreference } from "@/store/settings.store";

const options: Array<{
  value: ThemePreference;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}> = [
  { value: "system", label: "System", icon: "cellphone-cog" },
  { value: "light", label: "Light", icon: "white-balance-sunny" },
  { value: "dark", label: "Dark", icon: "weather-night" },
];

export function ThemeSelector() {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <View
      accessibilityRole="radiogroup"
      className="flex-row gap-2 rounded-3xl border p-2"
      style={surfaces.card}
    >
      {options.map((option) => {
        const selected = option.value === theme;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => setTheme(option.value)}
            className="h-16 flex-1 items-center justify-center gap-1.5 rounded-2xl active:opacity-80"
            style={{
              backgroundColor: selected ? colors.primary : colors.surface,
              ...(selected ? surfaces.floating : {}),
            }}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={20}
              color={selected ? colors.onPrimary : colors.textMuted}
            />
            <Text
              className="text-[11px]"
              style={{
                color: selected ? colors.onPrimary : colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
