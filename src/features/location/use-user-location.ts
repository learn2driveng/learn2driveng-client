import * as Location from "expo-location";
import { useCallback, useState } from "react";

import { useLocationStore } from "@/store/location.store";

export function useUserLocation() {
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coordinates = useLocationStore((state) => state.coordinates);
  const setCoordinates = useLocationStore((state) => state.setCoordinates);
  const clearLocation = useCallback(
    () => setCoordinates(null),
    [setCoordinates],
  );

  const requestLocation = useCallback(async () => {
    setError(null);

    const response = permission?.granted
      ? permission
      : await requestPermission();

    if (!response.granted) return null;

    setIsLocating(true);

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setCoordinates(nextCoordinates);
      return nextCoordinates;
    } catch {
      setError(
        "We couldn't get your current location. Check that location services are enabled and try again.",
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [permission, requestPermission, setCoordinates]);

  return {
    permission,
    coordinates,
    isChecking: permission === null,
    isGranted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    isLocating,
    error,
    requestLocation,
    clearLocation,
  };
}
