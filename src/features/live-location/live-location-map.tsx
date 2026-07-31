import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { LiveLocationMapProps } from "./live-location-map.types";

export function LiveLocationMap({
  coordinates,
  learnerName,
}: LiveLocationMapProps) {
  const { colors } = useAppTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${learnerName}'s latest location. Latitude ${coordinates.latitude.toFixed(5)}, longitude ${coordinates.longitude.toFixed(5)}.`}
      className="h-72 items-center justify-center rounded-[28px] border px-6"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View
        className="h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.successSoft }}
      >
        <MaterialCommunityIcons
          name="map-marker-radius"
          size={32}
          color={colors.success}
        />
      </View>
      <Text
        className="mt-4 font-figtree-bold text-[16px]"
        style={{ color: colors.text }}
      >
        Live location received
      </Text>
      <Text
        className="mt-2 text-center font-figtree text-[12px]"
        style={{ color: colors.textMuted }}
      >
        {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
      </Text>
      <Text
        className="mt-2 text-center font-figtree text-[11px]"
        style={{ color: colors.textSubtle }}
      >
        The full map is displayed on Android and iOS.
      </Text>
    </View>
  );
}
