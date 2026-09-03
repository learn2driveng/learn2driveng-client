/// <reference types="google.maps" />

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { LiveLocationMapProps } from "./live-location-map.types";

let googleMapsPromise: Promise<
  [google.maps.MapsLibrary, google.maps.MarkerLibrary]
> | null = null;
let googleMapsApiKey: string | null = null;

function loadGoogleMaps(apiKey: string) {
  if (!googleMapsPromise) {
    googleMapsApiKey = apiKey;
    setOptions({
      key: apiKey,
      v: "weekly",
      language: "en",
      region: "NG",
    });
    googleMapsPromise = Promise.all([
      importLibrary("maps"),
      importLibrary("marker"),
    ]);
  } else if (googleMapsApiKey !== apiKey) {
    return Promise.reject(
      new Error("Google Maps was initialized with a different API key."),
    );
  }

  return googleMapsPromise;
}

function createMarkerContent(vehicleLabel: string) {
  const wrapper = document.createElement("div");
  wrapper.style.alignItems = "center";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  const label = document.createElement("span");
  label.textContent = vehicleLabel;
  label.style.background = "#0A192F";
  label.style.border = "2px solid #FFFFFF";
  label.style.borderRadius = "999px";
  label.style.boxShadow = "0 3px 12px rgba(10, 25, 47, 0.28)";
  label.style.color = "#FFFFFF";
  label.style.fontFamily = "Figtree, sans-serif";
  label.style.fontSize = "11px";
  label.style.fontWeight = "700";
  label.style.marginBottom = "5px";
  label.style.maxWidth = "220px";
  label.style.overflow = "hidden";
  label.style.padding = "6px 10px";
  label.style.textOverflow = "ellipsis";
  label.style.whiteSpace = "nowrap";
  wrapper.appendChild(label);

  const marker = document.createElement("div");
  marker.setAttribute("aria-hidden", "true");
  marker.style.alignItems = "center";
  marker.style.background = "#0A192F";
  marker.style.border = "4px solid #FFFFFF";
  marker.style.borderRadius = "999px";
  marker.style.boxShadow = "0 3px 12px rgba(10, 25, 47, 0.3)";
  marker.style.display = "flex";
  marker.style.height = "34px";
  marker.style.justifyContent = "center";
  marker.style.width = "34px";

  const centre = document.createElement("span");
  centre.textContent = "🚘";
  centre.style.fontSize = "17px";
  centre.style.lineHeight = "1";
  marker.appendChild(centre);
  wrapper.appendChild(marker);

  return wrapper;
}

export function LiveLocationMap({
  coordinates,
  vehicleLabel,
}: LiveLocationMapProps) {
  const { colors } = useAppTheme();
  const containerRef = useRef<View>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const apiKey = (
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_API_KEY ??
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
    ""
  ).trim();
  const accuracy = coordinates.accuracyInMeters ?? coordinates.accuracy ?? null;
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">(
    apiKey ? "loading" : "error",
  );
  const initialLocationRef = useRef({
    accuracy,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  });

  useEffect(() => {
    if (!apiKey) {
      return;
    }

    let cancelled = false;
    let marker: google.maps.marker.AdvancedMarkerElement | null = null;
    let accuracyCircle: google.maps.Circle | null = null;

    void loadGoogleMaps(apiKey)
      .then(([{ Map, Circle }, { AdvancedMarkerElement }]) => {
        if (cancelled || !containerRef.current) return;
        const centre = {
          lat: initialLocationRef.current.latitude,
          lng: initialLocationRef.current.longitude,
        };
        const map = new Map(containerRef.current as unknown as HTMLElement, {
          center: centre,
          zoom: 16,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          mapId:
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID",
          streetViewControl: false,
        });
        marker = new AdvancedMarkerElement({
          content: createMarkerContent(vehicleLabel),
          map,
          position: centre,
          title: `${vehicleLabel} — latest shared location`,
        });
        if (
          initialLocationRef.current.accuracy &&
          initialLocationRef.current.accuracy > 0
        ) {
          accuracyCircle = new Circle({
            center: centre,
            fillColor: "#059669",
            fillOpacity: 0.12,
            map,
            radius: initialLocationRef.current.accuracy,
            strokeColor: "#059669",
            strokeOpacity: 0.45,
            strokeWeight: 1,
          });
        }
        mapRef.current = map;
        markerRef.current = marker;
        accuracyCircleRef.current = accuracyCircle;
        setMapStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setMapStatus("error");
      });

    return () => {
      cancelled = true;
      if (marker) marker.map = null;
      accuracyCircle?.setMap(null);
      markerRef.current = null;
      accuracyCircleRef.current = null;
      mapRef.current = null;
    };
  }, [apiKey, vehicleLabel]);

  useEffect(() => {
    const centre = {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    };
    mapRef.current?.panTo(centre);
    if (markerRef.current) markerRef.current.position = centre;

    if (accuracy && accuracy > 0 && mapRef.current) {
      if (!accuracyCircleRef.current) {
        void importLibrary("maps").then(({ Circle }) => {
          if (!mapRef.current || accuracyCircleRef.current) return;
          accuracyCircleRef.current = new Circle({
            center: centre,
            fillColor: "#059669",
            fillOpacity: 0.12,
            map: mapRef.current,
            radius: accuracy,
            strokeColor: "#059669",
            strokeOpacity: 0.45,
            strokeWeight: 1,
          });
        });
      } else {
        accuracyCircleRef.current.setCenter(centre);
        accuracyCircleRef.current.setRadius(accuracy);
      }
    } else if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setMap(null);
      accuracyCircleRef.current = null;
    }
  }, [accuracy, coordinates.latitude, coordinates.longitude]);

  return (
    <View
      accessible
      accessibilityLabel={`${vehicleLabel}'s latest location. Latitude ${coordinates.latitude.toFixed(5)}, longitude ${coordinates.longitude.toFixed(5)}.`}
      className="h-72 overflow-hidden rounded-[28px] border"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View ref={containerRef} style={StyleSheet.absoluteFill} />
      {mapStatus !== "ready" ? (
        <View
          className="absolute inset-0 items-center justify-center px-6"
          style={{ backgroundColor: colors.surface }}
        >
          {mapStatus === "loading" ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <MaterialCommunityIcons
              name="map-marker-alert-outline"
              size={34}
              color={colors.error}
            />
          )}
          <Text
            className="mt-4 text-center font-figtree-bold text-[15px]"
            style={{ color: colors.text }}
          >
            {mapStatus === "loading"
              ? "Loading live map"
              : "Map could not be displayed"}
          </Text>
          {mapStatus === "error" ? (
            <Text
              className="mt-2 text-center font-figtree text-[11px] leading-4"
              style={{ color: colors.textMuted }}
            >
              The live coordinates are still connected. Check the Google Maps
              web key and its allowed website domains.
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
