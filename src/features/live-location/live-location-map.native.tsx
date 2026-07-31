import { MaterialCommunityIcons } from "@expo/vector-icons";
import MapView, { Circle, Marker } from "react-native-maps";
import { StyleSheet, View } from "react-native";

import type { LiveLocationMapProps } from "./live-location-map.types";

export function LiveLocationMap({
  coordinates,
  learnerName,
}: LiveLocationMapProps) {
  const coordinate = {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };

  return (
    <View
      accessible
      accessibilityLabel={`${learnerName}'s latest shared location`}
      className="h-72 overflow-hidden rounded-[28px]"
    >
      <MapView
        accessibilityLabel={`Map showing ${learnerName}'s latest location`}
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
        {coordinates.accuracy ? (
          <Circle
            center={coordinate}
            radius={coordinates.accuracy}
            fillColor="rgba(5, 150, 105, 0.12)"
            strokeColor="rgba(5, 150, 105, 0.45)"
          />
        ) : null}
        <Marker
          anchor={{ x: 0.5, y: 0.92 }}
          coordinate={coordinate}
          title={learnerName}
          description="Latest shared location"
        >
          <View style={styles.markerWrap}>
            <MaterialCommunityIcons
              name="map-marker"
              size={58}
              color="#059669"
            />
            <View style={styles.markerCentre}>
              <MaterialCommunityIcons
                name="account"
                size={17}
                color="#FFFFFF"
              />
            </View>
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
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  markerCentre: {
    alignItems: "center",
    backgroundColor: "#0A192F",
    borderColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    top: 10,
    width: 28,
  },
});
