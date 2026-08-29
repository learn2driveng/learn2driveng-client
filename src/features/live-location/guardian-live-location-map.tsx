import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { GuardianLiveLocationMapProps } from "./guardian-live-location-map.types";

export function GuardianLiveLocationMap({ vehicle }: GuardianLiveLocationMapProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="h-80 items-center justify-center rounded-[28px] border px-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <MaterialCommunityIcons
        name="car-side"
        size={38}
        color={colors.primary}
      />
      <Text
        className="mt-4 font-figtree-bold text-[15px]"
        style={{ color: colors.text }}
      >
        {vehicle ? "Vehicle location received" : "Waiting for the training vehicle"}
      </Text>
      {vehicle ? (
        <Text
          className="mt-2 text-center font-figtree text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {vehicle.latitude.toFixed(5)}, {vehicle.longitude.toFixed(5)}
        </Text>
      ) : null}
      <Text
        className="mt-2 text-center font-figtree text-[11px]"
        style={{ color: colors.textSubtle }}
      >
        Open this link in a mobile browser for the live Google Map.
      </Text>
    </View>
  );
}
