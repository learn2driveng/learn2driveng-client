import { useRouter } from "expo-router";
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
  const location = useUserLocation();
  const setLocationPromptDismissed = useSettingsStore(
    (state) => state.setLocationPromptDismissed,
  );

  if (location.isChecking) {
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
        isGranted={location.isGranted}
        canAskAgain={location.canAskAgain}
        isLocating={location.isLocating}
        error={location.error}
        onAllow={() => {
          void location.requestLocation().then((coordinates) => {
            if (!coordinates) return;
            setLocationPromptDismissed(false);
            router.replace("/welcome");
          });
        }}
        onContinueWithoutLocation={() => {
          location.clearLocation();
          setLocationPromptDismissed(true);
          router.replace("/welcome");
        }}
      />
    </View>
  );
}
