import { useEffect, useRef } from "react";
import { Linking, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import { useUserLocation } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSettingsStore } from "@/store/settings.store";

export default function LocationSettingsScreen() {
  const { colors } = useAppTheme();
  const location = useUserLocation();
  const setLocationPromptDismissed = useSettingsStore(
    (state) => state.setLocationPromptDismissed,
  );
  const autoLocationAttempted = useRef(false);
  const { isChecking, isGranted, coordinates, requestLocation } = location;

  useEffect(() => {
    if (
      isChecking ||
      !isGranted ||
      coordinates ||
      autoLocationAttempted.current
    ) {
      return;
    }

    autoLocationAttempted.current = true;
    void requestLocation();
  }, [coordinates, isChecking, isGranted, requestLocation]);

  const locationValue = location.isChecking
    ? "Checking"
    : location.isLocating
      ? "Locating"
      : location.coordinates
        ? "Available"
        : location.isGranted
          ? "Retry"
          : "Not allowed";

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Location" />
      <Text
        className="mt-3 font-figtree text-[14px]"
        style={{ color: colors.textMuted }}
      >
        Control how Learn2Drive uses your location.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="map-marker-radius-outline"
          title="Location access"
          description="Use your location to find nearby schools and instructors."
          value={locationValue}
          onPress={() => {
            if (location.isGranted || location.canAskAgain) {
              autoLocationAttempted.current = true;
              void location.requestLocation().then((coordinates) => {
                if (coordinates) setLocationPromptDismissed(false);
              });
              return;
            }
            void Linking.openSettings();
          }}
        />
        {location.error ? (
          <Text
            className="px-4 pb-4 text-[11px] leading-4"
            style={{ color: colors.error }}
          >
            {location.error}
          </Text>
        ) : null}
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="shield-account-outline"
          title="Live session sharing"
          description="Never automatic—you create a private link during each active lesson."
          value="Ask every time"
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        DEFAULT AREA
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="map-marker-outline"
          title="Preferred location"
          description={
            location.coordinates
              ? `${location.placeName ?? "Resolving location name…"}\n${location.coordinates.latitude.toFixed(5)}, ${location.coordinates.longitude.toFixed(5)}`
              : "Fallback used when location access is unavailable"
          }
          value={location.coordinates ? "Current location" : "Lagos"}
        />
      </View>
    </DashboardScreen>
  );
}
