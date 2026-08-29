import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import { getGoogleMapsApiKey, loadGoogleMaps } from "./google-maps-loader";
import type { LiveLocationMapProps } from "./live-location-map.types";

export function LiveLocationMap({
  coordinates,
  learnerName,
}: LiveLocationMapProps) {
  const { colors } = useAppTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
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

        const position = {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        };

        const map = new maps.Map(containerRef.current, {
          center: position,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapRef.current = map;
        markerRef.current = new maps.Marker({
          map,
          position,
          title: learnerName,
        });
      })
      .catch(() => {
        if (!cancelled) setMapError("Could not load Google Maps.");
      });

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markerRef.current) return;

    const position = {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    };
    markerRef.current.setPosition(position);
    map.setCenter(position);
  }, [coordinates.latitude, coordinates.longitude]);

  if (mapError) {
    return (
      <View
        accessible
        accessibilityLabel={`${learnerName}'s latest location.`}
        className="h-72 items-center justify-center rounded-[28px] border px-6"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="font-figtree-bold text-[15px]"
          style={{ color: colors.text }}
        >
          Map unavailable
        </Text>
        <Text
          className="mt-2 text-center font-figtree text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {mapError}
        </Text>
      </View>
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={`${learnerName}'s latest shared location`}
      className="h-72 overflow-hidden rounded-[28px] border"
      style={{ borderColor: colors.border }}
    >
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </View>
  );
}
