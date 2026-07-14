import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Linking, Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type LocationPermissionGateProps = {
  isGranted: boolean;
  canAskAgain: boolean;
  isLocating: boolean;
  error: string | null;
  onAllow: () => void;
  onContinueWithoutLocation: () => void;
};

export function LocationPermissionGate({
  isGranted,
  canAskAgain,
  isLocating,
  error,
  onAllow,
  onContinueWithoutLocation,
}: LocationPermissionGateProps) {
  const { colors } = useAppTheme();
  const deniedPermanently = !isGranted && !canAskAgain;

  return (
    <View
      className="flex-1 px-6 pb-8 pt-12"
      style={{ backgroundColor: colors.background }}
    >
      <AppLogo height={48} />
      <View className="flex-1 justify-center">
        <View
          className="h-20 w-20 items-center justify-center rounded-[24px]"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="map-marker-radius-outline"
            size={39}
            color={colors.onPrimary}
          />
        </View>

        <Text
          className="mt-8 text-[10px] uppercase tracking-[2px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Nearby discovery
        </Text>
        <Text
          accessibilityRole="header"
          className="mt-2 max-w-[330px] text-[30px] leading-9 tracking-[-0.8px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Find trusted schools{" "}
          <Text style={{ color: colors.primary }}>near you</Text>
        </Text>
        <Text
          className="mt-4 max-w-[340px] text-[14px] leading-6"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Allow location access to sort FRSC-verified driving schools by
          distance. Your location is not shared with schools during discovery.
        </Text>

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {[
            ["shield-check-outline", "Used only for nearby results"],
            ["crosshairs-gps", "Precise distance and local availability"],
            ["lock-outline", "You can change access in Settings"],
          ].map(([icon, label]) => (
            <View key={label} className="flex-row items-center py-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <Text
                className="ml-3 flex-1 text-[12px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeSemibold,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isLocating }}
          disabled={isLocating}
          onPress={
            deniedPermanently ? () => void Linking.openSettings() : onAllow
          }
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[15px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {isLocating
              ? "Finding your location…"
              : deniedPermanently
                ? "Open device settings"
                : isGranted
                  ? "Use my current location"
                  : "Allow location access"}
          </Text>
          <MaterialCommunityIcons
            name={deniedPermanently ? "open-in-new" : "arrow-right"}
            size={19}
            color={colors.onPrimary}
          />
        </Pressable>
        {error ? (
          <Text
            className="px-3 text-center text-[11px] leading-4"
            style={{
              color: colors.error,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {error}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={onContinueWithoutLocation}
          className="h-12 items-center justify-center active:opacity-65"
        >
          <Text
            className="text-[13px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Use Lagos as my default
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
