import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useLocationStore } from "@/store/location.store";

const QUICK_LOCATION_TIMEOUT_MS = 20_000;
const LOCATION_REFRESH_TIMEOUT_MS = 30_000;
const LAST_KNOWN_MAX_AGE_MS = 2 * 60 * 1000;
const MAX_DISCOVERY_ACCURACY_METERS = 500;
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

function isAccurateEnoughForDiscovery(location: Location.LocationObject) {
  return (
    location.coords.accuracy === null ||
    location.coords.accuracy <= MAX_DISCOVERY_ACCURACY_METERS
  );
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
  const [isRefreshingPermission, setIsRefreshingPermission] = useState(false);
  const [permissionCheckFailed, setPermissionCheckFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coordinates = useLocationStore((state) => state.coordinates);
  const placeName = useLocationStore((state) => state.placeName);
  const setCoordinates = useLocationStore((state) => state.setCoordinates);
  const setPlaceName = useLocationStore((state) => state.setPlaceName);
  const requestGeneration = useRef(0);
  const permissionGranted = permission?.granted;
  const androidAccuracy = permission?.android?.accuracy;
  const iosAccuracy = permission?.ios?.accuracy;
  const isPrecise =
    !isRefreshingPermission &&
    !permissionCheckFailed &&
    (permissionGranted ?? false) &&
    androidAccuracy !== "coarse" &&
    androidAccuracy !== "none" &&
    iosAccuracy !== "reduced";

  const clearLocation = useCallback(() => {
    requestGeneration.current += 1;
    setCoordinates(null);
  }, [setCoordinates]);

  useEffect(() => {
    if (
      permissionGranted === false ||
      androidAccuracy === "coarse" ||
      androidAccuracy === "none" ||
      iosAccuracy === "reduced"
    ) {
      // A one-time grant or precise access may expire while coordinates remain.
      clearLocation();
    }
  }, [clearLocation, permissionGranted, androidAccuracy, iosAccuracy]);

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

  const requestLocationPermission = useCallback(
    async (requirePrecise = false) => {
      setError(null);

      try {
        // Always let the OS decide whether an "Ask every time" grant needs a
        // fresh dialog. A cached granted response must not skip this request.
        const response = await requestPermission();
        setPermissionCheckFailed(false);

        if (!response.granted) {
          clearLocation();
          setError(
            response.canAskAgain
              ? "Location access was not granted. You can try again."
              : "Location access is blocked. Enable it in device settings to find nearby schools.",
          );
          return false;
        }

        if (
          requirePrecise &&
          (response.android?.accuracy === "coarse" ||
            response.android?.accuracy === "none" ||
            response.ios?.accuracy === "reduced")
        ) {
          clearLocation();
          setError(
            "Precise location is off. Enable Precise Location for Learn2Drive in device settings to find nearby schools.",
          );
          return false;
        }

        return true;
      } catch {
        setError("Couldn't check location access. Please try again.");
        return false;
      }
    },
    [clearLocation, requestPermission],
  );

  const requestLocation = useCallback(
    async (options?: { requirePrecise?: boolean }) => {
      if (options?.requirePrecise) {
        // Never keep showing nearby results from an older fix after a failed refresh.
        clearLocation();
      }
      const generation = requestGeneration.current + 1;
      requestGeneration.current = generation;
      const hasPermission = await requestLocationPermission(
        options?.requirePrecise,
      );
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
          requiredAccuracy: options?.requirePrecise
            ? MAX_DISCOVERY_ACCURACY_METERS
            : undefined,
        });

        if (lastKnownLocation) {
          const nextCoordinates = toCoordinates(lastKnownLocation);
          if (generation !== requestGeneration.current) return null;

          setCoordinates(nextCoordinates);
          resolvePlaceName(nextCoordinates, generation);

          // Improve the initial result without keeping the user waiting.
          void getFreshPosition(
            options?.requirePrecise
              ? Location.Accuracy.High
              : Location.Accuracy.Balanced,
            LOCATION_REFRESH_TIMEOUT_MS,
          )
            .then((freshLocation) => {
              if (generation !== requestGeneration.current) return;
              if (
                options?.requirePrecise &&
                !isAccurateEnoughForDiscovery(freshLocation)
              )
                return;
              const freshCoordinates = toCoordinates(freshLocation);
              setCoordinates(freshCoordinates);
              resolvePlaceName(freshCoordinates, generation);
            })
            .catch(() => undefined);

          return nextCoordinates;
        }

        const currentLocation = await getFreshPosition(
          options?.requirePrecise
            ? Location.Accuracy.High
            : Location.Accuracy.Balanced,
          QUICK_LOCATION_TIMEOUT_MS,
        );
        if (
          options?.requirePrecise &&
          !isAccurateEnoughForDiscovery(currentLocation)
        ) {
          setError(
            "Your current position is not precise enough yet. Check device location accuracy and try again.",
          );
          return null;
        }
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
                ? "Your device did not return a precise location. Enable Precise Location in device settings and try again."
                : "Your device has not returned a location yet. Check device location accuracy and try again."
            : "We couldn't get your current location. Check that location services are enabled and try again.",
        );
        return null;
      } finally {
        setIsLocating(false);
      }
    },
    [
      clearLocation,
      permission,
      requestLocationPermission,
      resolvePlaceName,
      setCoordinates,
    ],
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setIsRefreshingPermission(true);
        void refreshPermission()
          .then(() => setPermissionCheckFailed(false))
          .catch(() => {
            clearLocation();
            setPermissionCheckFailed(true);
            setError("Couldn't check location access. Please try again.");
          })
          .finally(() => setIsRefreshingPermission(false));
      }
    });

    return () => subscription.remove();
  }, [clearLocation, refreshPermission]);

  return {
    permission,
    coordinates,
    placeName,
    isChecking: permission === null || isRefreshingPermission,
    isGranted:
      !isRefreshingPermission &&
      !permissionCheckFailed &&
      (permission?.granted ?? false),
    isPrecise,
    canAskAgain: permission?.canAskAgain ?? true,
    isLocating,
    error,
    requestLocationPermission,
    requestLocation,
    clearLocation,
  };
}
