import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Linking, Modal, Pressable, Text, View } from "react-native";

import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
} from "@/components/dashboard";
import {
  getPreferredArea,
  preferredAreas,
  type PreferredAreaId,
} from "@/constants/preferred-areas";
import { useUserLocation } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSettingsStore } from "@/store/settings.store";

export default function LocationSettingsScreen() {
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const location = useUserLocation();
  const setLocationPromptDismissed = useSettingsStore(
    (state) => state.setLocationPromptDismissed,
  );
  const autoLocationAttempted = useRef(false);
  const [areaPickerVisible, setAreaPickerVisible] = useState(false);
  const discoveryLocationMode = useSettingsStore(
    (state) => state.discoveryLocationMode,
  );
  const preferredAreaId = useSettingsStore((state) => state.preferredAreaId);
  const setDiscoveryLocationMode = useSettingsStore(
    (state) => state.setDiscoveryLocationMode,
  );
  const setPreferredAreaId = useSettingsStore(
    (state) => state.setPreferredAreaId,
  );
  const preferredArea = getPreferredArea(preferredAreaId);
  const { isChecking, isGranted, coordinates, requestLocation } = location;

  useEffect(() => {
    if (
      isChecking ||
      !isGranted ||
      discoveryLocationMode !== "current" ||
      coordinates ||
      autoLocationAttempted.current
    ) {
      return;
    }

    autoLocationAttempted.current = true;
    void requestLocation();
  }, [
    coordinates,
    discoveryLocationMode,
    isChecking,
    isGranted,
    requestLocation,
  ]);

  const permissionValue = location.isChecking
    ? "Checking"
    : location.isGranted
      ? "Allowed"
      : "Not allowed";

  const refreshCurrentLocation = async () => {
    autoLocationAttempted.current = true;
    const nextCoordinates = await location.requestLocation();
    if (!nextCoordinates) return;

    setDiscoveryLocationMode("current");
    setLocationPromptDismissed(false);
    showToast("Current location updated.");
  };

  const choosePreferredArea = (areaId: PreferredAreaId) => {
    const area = getPreferredArea(areaId);
    location.clearLocation();
    setPreferredAreaId(areaId);
    setDiscoveryLocationMode("area");
    setLocationPromptDismissed(true);
    setAreaPickerVisible(false);
    showToast(`${area.label} is now your discovery area.`);
  };

  const clearCurrentLocation = () => {
    location.clearLocation();
    setDiscoveryLocationMode("area");
    setLocationPromptDismissed(true);
    showToast(`Using ${preferredArea.label} for school discovery.`);
  };

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
          title="Device permission"
          description="Allow foreground access while using nearby school discovery."
          value={permissionValue}
          onPress={() => {
            if (location.isGranted || !location.canAskAgain) {
              void Linking.openSettings();
              return;
            }
            void refreshCurrentLocation();
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
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        SCHOOL DISCOVERY
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="crosshairs-gps"
          title="Use current location"
          description={
            location.coordinates
              ? (location.placeName ?? "Current coordinates available")
              : "Refresh your position and sort schools by distance"
          }
          value={
            location.isLocating
              ? "Locating"
              : discoveryLocationMode === "current"
                ? "Selected"
                : undefined
          }
          onPress={() => void refreshCurrentLocation()}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="map-marker-outline"
          title="Preferred area"
          description="Used when you choose not to use your device location"
          value={`${preferredArea.label}${discoveryLocationMode === "area" ? " · Selected" : ""}`}
          onPress={() => setAreaPickerVisible(true)}
        />
        {discoveryLocationMode === "current" && location.coordinates ? (
          <>
            <View
              className="mx-4 h-px"
              style={{ backgroundColor: colors.border }}
            />
            <SettingsRow
              destructive
              icon="map-marker-remove-outline"
              title="Clear current location"
              description={`Stop using cached coordinates and switch to ${preferredArea.label}`}
              onPress={clearCurrentLocation}
            />
          </>
        ) : null}
      </View>

      <View
        className="mt-5 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={20}
          color={colors.textMuted}
        />
        <Text
          className="flex-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          Discovery location is separate from live lesson sharing. A lesson
          location is shared only when you create a private link during that
          lesson.
        </Text>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={areaPickerVisible}
        onRequestClose={() => setAreaPickerVisible(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close preferred area picker"
          onPress={() => setAreaPickerVisible(false)}
          className="flex-1 justify-end bg-black/60 px-4 pb-6"
        >
          <Pressable
            accessible={false}
            accessibilityViewIsModal
            onPress={(event) => event.stopPropagation()}
            className="overflow-hidden rounded-3xl border p-5"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[20px]"
              style={{ color: colors.text }}
            >
              Choose a preferred area
            </Text>
            <Text
              className="mt-2 font-figtree text-[13px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Explore will use this area whenever current location is not
              selected.
            </Text>
            <View
              className="mt-5 overflow-hidden rounded-2xl border"
              style={{ borderColor: colors.border }}
            >
              {preferredAreas.map((area, index) => {
                const selected = area.id === preferredAreaId;
                return (
                  <View key={area.id}>
                    {index ? (
                      <View
                        className="mx-4 h-px"
                        style={{ backgroundColor: colors.border }}
                      />
                    ) : null}
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => choosePreferredArea(area.id)}
                      className="h-14 flex-row items-center px-4 active:opacity-70"
                    >
                      <Text
                        className="flex-1 font-figtree-semibold text-[15px]"
                        style={{ color: colors.text }}
                      >
                        {area.label}
                      </Text>
                      <MaterialCommunityIcons
                        name={selected ? "radiobox-marked" : "radiobox-blank"}
                        size={22}
                        color={selected ? colors.primary : colors.textSubtle}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </DashboardScreen>
  );
}
