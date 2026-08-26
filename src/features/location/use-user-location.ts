import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useLocationStore } from "@/store/location.store";

const QUICK_LOCATION_TIMEOUT_MS = 20_000;
const LOCATION_REFRESH_TIMEOUT_MS = 30_000;
const LAST_KNOWN_MAX_AGE_MS = 2 * 60 * 1000;
const LOCATION_TIMEOUT_ERROR = "Location request timed out.";
let activePositionRequest: Promise<Location.LocationObject> | null = null;
let activePlaceNameRequest: {
  key: string;
  promise: Promise<string | null>;
} | null = null;

async function requestFreshPosition(
  accuracy: Location.Accuracy,
  timeoutMs: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  try {
    const timedOut = new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error(LOCATION_TIMEOUT_ERROR)),
        timeoutMs,
      );
    });

    return await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy,
        mayShowUserSettingsDialog: true,
      }),
      timedOut,
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function getFreshPosition(accuracy: Location.Accuracy, timeoutMs: number) {
  if (activePositionRequest) return activePositionRequest;

  const request = requestFreshPosition(accuracy, timeoutMs).finally(() => {
    if (activePositionRequest === request) {
      activePositionRequest = null;
    }
  });

  activePositionRequest = request;
  return request;
}

function toCoordinates(location: Location.LocationObject) {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

function formatPlaceName(address: Location.LocationGeocodedAddress) {
  const parts = [
    address.district,
    address.city,
    address.region,
    address.country,
  ].filter((part): part is string => Boolean(part?.trim()));
  const uniqueParts = parts.filter(
    (part, index) =>
      parts.findIndex(
        (candidate) => candidate.toLowerCase() === part.toLowerCase(),
      ) === index,
  );

  return (
    uniqueParts.join(", ") || address.formattedAddress || address.name || null
  );
}

function getPlaceName(coordinates: { latitude: number; longitude: number }) {
  const key = `${coordinates.latitude.toFixed(4)},${coordinates.longitude.toFixed(4)}`;
  if (activePlaceNameRequest?.key === key) {
    return activePlaceNameRequest.promise;
  }

  const promise = Location.reverseGeocodeAsync(coordinates)
    .then(([address]) => (address ? formatPlaceName(address) : null))
    .finally(() => {
      if (activePlaceNameRequest?.key === key) {
        activePlaceNameRequest = null;
      }
    });

  activePlaceNameRequest = { key, promise };
  return promise;
}

export function useUserLocation() {
  const [permission, requestPermission, refreshPermission] =
    Location.useForegroundPermissions();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coordinates = useLocationStore((state) => state.coordinates);
  const placeName = useLocationStore((state) => state.placeName);
  const setCoordinates = useLocationStore((state) => state.setCoordinates);
  const setPlaceName = useLocationStore((state) => state.setPlaceName);
  const requestGeneration = useRef(0);

  const clearLocation = useCallback(() => {
    requestGeneration.current += 1;
    setCoordinates(null);
  }, [setCoordinates]);

  const resolvePlaceName = useCallback(
    (
      nextCoordinates: { latitude: number; longitude: number },
      generation: number,
    ) => {
      void getPlaceName(nextCoordinates)
        .then((nextPlaceName) => {
          if (!nextPlaceName || generation !== requestGeneration.current) {
            return;
          }

          const currentCoordinates = useLocationStore.getState().coordinates;
          if (
            currentCoordinates?.latitude !== nextCoordinates.latitude ||
            currentCoordinates.longitude !== nextCoordinates.longitude
          ) {
            return;
          }

          setPlaceName(nextPlaceName);
        })
        .catch(() => undefined);
    },
    [setPlaceName],
  );

  const requestLocationPermission = useCallback(async () => {
    setError(null);

    const response = permission?.granted
      ? permission
      : await requestPermission();

    if (!response.granted) {
      setError("Location access is required to find schools near you.");
      return false;
    }

    return true;
  }, [permission, requestPermission]);

  const requestLocation = useCallback(async () => {
    const generation = requestGeneration.current + 1;
    requestGeneration.current = generation;
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    setIsLocating(true);
    let providerStatus: Location.LocationProviderStatus | null = null;

    try {
      providerStatus = await Location.getProviderStatusAsync();

      if (!providerStatus.locationServicesEnabled) {
        setError(
          "Location services are turned off. Enable them on your device and try again.",
        );
        return null;
      }

      const lastKnownLocation = await Location.getLastKnownPositionAsync({
        maxAge: LAST_KNOWN_MAX_AGE_MS,
      });

      if (lastKnownLocation) {
        const nextCoordinates = toCoordinates(lastKnownLocation);
        if (generation !== requestGeneration.current) return null;

        setCoordinates(nextCoordinates);
        resolvePlaceName(nextCoordinates, generation);

        // Improve the initial result without keeping the user waiting.
        void getFreshPosition(
          Location.Accuracy.Balanced,
          LOCATION_REFRESH_TIMEOUT_MS,
        )
          .then((freshLocation) => {
            if (generation !== requestGeneration.current) return;
            const freshCoordinates = toCoordinates(freshLocation);
            setCoordinates(freshCoordinates);
            resolvePlaceName(freshCoordinates, generation);
          })
          .catch(() => undefined);

        return nextCoordinates;
      }

      const currentLocation = await getFreshPosition(
        Location.Accuracy.Balanced,
        QUICK_LOCATION_TIMEOUT_MS,
      );
      const nextCoordinates = toCoordinates(currentLocation);
      if (generation !== requestGeneration.current) return null;

      setCoordinates(nextCoordinates);
      resolvePlaceName(nextCoordinates, generation);
      return nextCoordinates;
    } catch (caughtError) {
      if (__DEV__) {
        console.warn("Location request failed", {
          error:
            caughtError instanceof Error
              ? caughtError.message
              : String(caughtError),
          permission: permission?.android ?? permission?.ios,
          providerStatus,
        });
      }

      setError(
        caughtError instanceof Error &&
          caughtError.message === LOCATION_TIMEOUT_ERROR
          ? providerStatus?.networkAvailable === false
            ? "Network location is unavailable. Turn on Wi-Fi or mobile data and device location accuracy, then try again."
            : permission?.android?.accuracy === "coarse"
              ? "Your device did not return an approximate location. You can use your preferred area or try again."
              : "Your device has not returned a location yet. You can use your preferred area or try again."
          : "We couldn't get your current location. Check that location services are enabled and try again.",
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [permission, requestLocationPermission, resolvePlaceName, setCoordinates]);

  const requestLocationRef = useRef(requestLocation);

  useEffect(() => {
    requestLocationRef.current = requestLocation;
  }, [requestLocation]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshPermission();
        if (permission?.granted) {
          void requestLocationRef.current();
        }
      }
    });

    return () => subscription.remove();
  }, [permission?.granted, refreshPermission]);

  return {
    permission,
    coordinates,
    placeName,
    isChecking: permission === null,
    isGranted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    isLocating,
    error,
    requestLocationPermission,
    requestLocation,
    clearLocation,
  };
}
