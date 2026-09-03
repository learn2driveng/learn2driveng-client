import { Alert, Linking, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
  ToggleSettingRow,
} from "@/components/dashboard";
import {
  requestInstructorLocationPermissions,
  useUserLocation,
} from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLocationStore } from "@/store/location.store";
import { useSettingsStore } from "@/store/settings.store";

export default function InstructorLocationSettingsScreen() {
  const { colors } = useAppTheme();
  const location = useUserLocation();
  const useDuringLessons = useSettingsStore(
    (state) => state.instructorLocationSharingEnabled,
  );
  const setUseDuringLessons = useSettingsStore(
    (state) => state.setInstructorLocationSharingEnabled,
  );
  const publishingStatus = useLocationStore(
    (state) => state.instructorPublishingStatus,
  );
  const publishingError = useLocationStore(
    (state) => state.instructorPublishingError,
  );
  const setPublishingStatus = useLocationStore(
    (state) => state.setInstructorPublishingStatus,
  );

  const changeLessonSharing = (enabled: boolean) => {
    if (!enabled) {
      setUseDuringLessons(false);
      return;
    }

    Alert.alert(
      "Enable live lesson tracking",
      "During an active lesson, Learn2Drive shares the training vehicle’s location with booked learners and anyone using a private link. Background access keeps tracking active when you leave the app.",
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            void requestInstructorLocationPermissions().then((permission) => {
              if (!permission.servicesEnabled) {
                setPublishingStatus(
                  "error",
                  "Turn on device location services before enabling lesson sharing.",
                );
                return;
              }
              if (!permission.foregroundGranted) {
                setPublishingStatus(
                  "error",
                  "Allow location access before enabling lesson sharing.",
                );
                return;
              }
              setUseDuringLessons(true);
              setPublishingStatus("idle");
            });
          },
        },
      ],
    );
  };
  const locationValue = location.isChecking
    ? "Checking"
    : location.isGranted
      ? "Allowed"
      : "Not allowed";

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Location" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Control how location is used while you teach.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="map-marker-radius-outline"
          title="Location access"
          description="Used for lesson check-in and active session records."
          value={locationValue}
          onPress={() => {
            if (location.isGranted || location.canAskAgain) {
              void location.requestLocation();
              return;
            }
            void Linking.openSettings();
          }}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <ToggleSettingRow
          title="Use during active lessons"
          description="Keep sharing while an active lesson is open, including when the app is backgrounded."
          value={useDuringLessons}
          onValueChange={(enabled) => void changeLessonSharing(enabled)}
        />
      </View>

      <View
        className="mt-5 rounded-2xl px-4 py-4"
        style={{
          backgroundColor: colors.surfaceStrong,
        }}
      >
        <Text
          className="font-figtree-bold text-[12px]"
          style={{
            color: publishingStatus === "error" ? colors.error : colors.text,
          }}
        >
          {publishingStatus === "background"
            ? "Background sharing active"
            : publishingStatus === "foreground"
              ? "Foreground sharing active"
              : publishingStatus === "requesting"
                ? "Starting location sharing…"
                : publishingStatus === "error"
                  ? "Location sharing needs attention"
                  : "Location sharing is inactive"}
        </Text>
        {publishingError ? (
          <Text
            className="mt-1 font-figtree text-[11px] leading-4"
            style={{ color: colors.error }}
          >
            {publishingError}
          </Text>
        ) : null}
      </View>

      <View
        className="mt-5 flex-row gap-3 rounded-2xl px-4 py-4"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <Text
          className="flex-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          Private live-location links belong to the learner. This setting only
          controls the instructor-side session record.
        </Text>
      </View>
    </DashboardScreen>
  );
}
