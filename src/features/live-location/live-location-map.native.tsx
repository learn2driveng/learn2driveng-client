import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { LiveLocationMapProps } from "./live-location-map.types";

export function LiveLocationMap({
  coordinates,
  vehicleLabel,
}: LiveLocationMapProps) {
  const { colors } = useAppTheme();
  const coordinate = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
  const mapConfiguration = Constants.expoConfig?.extra?.maps as
    | {
        androidGoogleMapsConfigured?: boolean;
        iosGoogleMapsConfigured?: boolean;
      }
    | undefined;
  const googleMapsConfigured =
    Platform.OS === "android"
      ? mapConfiguration?.androidGoogleMapsConfigured
      : mapConfiguration?.iosGoogleMapsConfigured;

  if (!googleMapsConfigured) {
    return (
      <View
        accessible
        accessibilityLabel="Google Maps configuration is required"
        className="h-72 items-center justify-center rounded-[28px] border px-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <MaterialCommunityIcons
          name="map-marker-alert-outline"
          size={36}
          color={colors.error}
        />
        <Text
          className="mt-4 text-center font-figtree-bold text-[15px]"
          style={{ color: colors.text }}
        >
          Map configuration required
        </Text>
        <Text
          className="mt-2 text-center font-figtree text-[11px] leading-4"
          style={{ color: colors.textMuted }}
        >
          Add the restricted Google Maps key for this platform, then rebuild the
          app.
        </Text>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${vehicleLabel}'s latest shared location`}
      className="h-72 overflow-hidden rounded-[28px]"
    >
      <MapView
        accessibilityLabel={`Map showing ${vehicleLabel}'s latest location`}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          ...coordinate,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        rotateEnabled={false}
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {(coordinates.accuracyInMeters ?? coordinates.accuracy) ? (
          <Circle
            center={coordinate}
            radius={coordinates.accuracyInMeters ?? coordinates.accuracy ?? 0}
            fillColor="rgba(5, 150, 105, 0.12)"
            strokeColor="rgba(5, 150, 105, 0.45)"
          />
        ) : null}
        <Marker
          anchor={{ x: 0.5, y: 1 }}
          coordinate={coordinate}
          title={vehicleLabel}
          description="Latest shared location"
        >
          <View style={styles.markerWrap}>
            <View style={styles.markerLabel}>
              <Text numberOfLines={1} style={styles.markerLabelText}>
                {vehicleLabel}
              </Text>
            </View>
            <View style={styles.markerCentre}>
              <MaterialCommunityIcons
                name="car-side"
                size={20}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.markerTip} />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
  markerWrap: {
    alignItems: "center",
    height: 84,
    justifyContent: "flex-end",
    width: 230,
  },
  markerLabel: {
    backgroundColor: "#0A192F",
    borderColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    marginBottom: 5,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markerLabelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  markerCentre: {
    alignItems: "center",
    backgroundColor: "#059669",
    borderColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 3,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  markerTip: {
    borderLeftColor: "transparent",
    borderLeftWidth: 6,
    borderRightColor: "transparent",
    borderRightWidth: 6,
    borderTopColor: "#059669",
    borderTopWidth: 9,
    height: 0,
    marginTop: -2,
    width: 0,
  },
});
