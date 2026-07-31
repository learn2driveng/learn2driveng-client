import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { LocationPermissionGate, useUserLocation } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSettingsStore } from "@/store/settings.store";

export default function PublicLocationConsentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const {
    coordinates,
    isChecking,
    isGranted,
    canAskAgain,
    isLocating,
    error,
    requestLocation,
    clearLocation,
  } = useUserLocation();
  const navigationHandled = useRef(false);
  const locationAttempted = useRef(false);
  const setLocationPromptDismissed = useSettingsStore(
    (state) => state.setLocationPromptDismissed,
  );

  const continueWithCurrentLocation = useCallback(async () => {
    if (navigationHandled.current) return;

    locationAttempted.current = true;
    const currentCoordinates = coordinates ?? (await requestLocation());

    if (!currentCoordinates || navigationHandled.current) return;

    navigationHandled.current = true;
    setLocationPromptDismissed(false);
    router.replace("/welcome");
  }, [coordinates, requestLocation, router, setLocationPromptDismissed]);

  useEffect(() => {
    if (
      isChecking ||
      !isGranted ||
      navigationHandled.current ||
      locationAttempted.current
    ) {
      return;
    }

    void continueWithCurrentLocation();
  }, [continueWithCurrentLocation, isChecking, isGranted]);

  if (isChecking) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      >
        <Text
          className="text-[13px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Checking location access…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <LocationPermissionGate
        isGranted={isGranted}
        canAskAgain={canAskAgain}
        isLocating={isLocating}
        error={error}
        onAllow={() => {
          void continueWithCurrentLocation();
        }}
        onContinueWithoutLocation={() => {
          navigationHandled.current = true;
          clearLocation();
          setLocationPromptDismissed(true);
          router.replace("/welcome");
        }}
      />
    </View>
  );
}
