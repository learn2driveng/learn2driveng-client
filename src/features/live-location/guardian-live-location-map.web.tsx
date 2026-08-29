import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { GuardianLiveLocationMapProps } from "./guardian-live-location-map.types";
import { getGoogleMapsApiKey, loadGoogleMaps } from "./google-maps-loader";

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

function toLatLng(location: { latitude: number; longitude: number }) {
  return { lat: location.latitude, lng: location.longitude };
}

function headingIcon(
  maps: typeof google.maps,
  color: string,
  heading?: number | null,
) {
  return {
    path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 5,
    rotation: heading ?? 0,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: "#FFFFFF",
    strokeWeight: 1,
  };
}

export function GuardianLiveLocationMap({
  vehicle,
  vehicleLabel = "Training vehicle",
  path = [],
}: GuardianLiveLocationMapProps) {
  const { colors } = useAppTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const vehicleMarkerRef = useRef<google.maps.Marker | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = getGoogleMapsApiKey();
    if (!apiKey) {
      setMapError("Google Maps API key is not configured.");
      return;
    }

    let cancelled = false;

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !containerRef.current) return;

        const map = new maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;
        polylineRef.current = new maps.Polyline({
          map,
          path: [],
          strokeColor: "#FFB800",
          strokeOpacity: 0.85,
          strokeWeight: 4,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("Could not load Google Maps.");
        }
      });

    return () => {
      cancelled = true;
      vehicleMarkerRef.current?.setMap(null);
      polylineRef.current?.setMap(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const mapsApi = window.google?.maps;
    if (!map || !mapsApi) return;

    const upsertMarker = (
      markerRef: MutableRefObject<google.maps.Marker | null>,
      location: GuardianLiveLocationMapProps["vehicle"],
      label: string,
    ) => {
      if (!location) {
        markerRef.current?.setMap(null);
        markerRef.current = null;
        return;
      }

      const position = toLatLng(location);
      const icon = headingIcon(mapsApi, "#FFB800", location.heading);

      if (!markerRef.current) {
        markerRef.current = new mapsApi.Marker({
          map,
          position,
          title: label,
          icon,
          zIndex: 2,
        });
        return;
      }

      markerRef.current.setPosition(position);
      markerRef.current.setIcon(icon);
    };

    upsertMarker(vehicleMarkerRef, vehicle, vehicleLabel);
    polylineRef.current?.setPath(path.map(toLatLng));

    const bounds = new mapsApi.LatLngBounds();
    let hasPoint = false;

    for (const point of path) {
      bounds.extend(toLatLng(point));
      hasPoint = true;
    }
    if (vehicle) {
      bounds.extend(toLatLng(vehicle));
      hasPoint = true;
    }

    if (hasPoint) {
      map.fitBounds(bounds, 56);
    }
  }, [path, vehicle, vehicleLabel]);

  if (mapError) {
    return (
      <View
        className="h-72 items-center justify-center rounded-[28px] border px-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="text-center font-figtree-bold text-[15px]"
          style={{ color: colors.text }}
        >
          Map unavailable
        </Text>
        <Text
          className="mt-2 text-center font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          {mapError}
        </Text>
      </View>
    );
  }

  return (
    <View
      className="h-80 overflow-hidden rounded-[28px] border"
      style={{ borderColor: colors.border }}
    >
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
        aria-label="Live lesson map showing the training vehicle"
      />
    </View>
  );
}
