import MapView, { Marker, Polyline } from "react-native-maps";
import { StyleSheet, View } from "react-native";

import type { GuardianLiveLocationMapProps } from "./guardian-live-location-map.types";

function toCoordinate(location: { latitude: number; longitude: number }) {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
  };
}

function regionForPoints(
  points: Array<{ latitude: number; longitude: number }>,
) {
  if (!points.length) {
    return {
      latitude: 6.5244,
      longitude: 3.3792,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.4, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.4, 0.01),
  };
}

export function GuardianLiveLocationMap({
  vehicle,
  vehicleLabel = "Training vehicle",
  path = [],
}: GuardianLiveLocationMapProps) {
  const points = [...path, ...(vehicle ? [vehicle] : [])];

  return (
    <View
      accessible
      accessibilityLabel="Live lesson map showing the training vehicle"
      className="h-80 overflow-hidden rounded-[28px]"
    >
      <MapView
        style={styles.map}
        region={regionForPoints(points)}
        rotateEnabled={false}
        showsCompass={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
      >
        {path.length > 1 ? (
          <Polyline
            coordinates={path.map(toCoordinate)}
            strokeColor="#FFB800"
            strokeWidth={4}
          />
        ) : null}
        {vehicle ? (
          <Marker
            coordinate={toCoordinate(vehicle)}
            title={vehicleLabel}
            pinColor="#FFB800"
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
  },
});
