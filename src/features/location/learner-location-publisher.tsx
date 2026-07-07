import * as Location from "expo-location";
import { useEffect } from "react";

import { useTrainingSessionStore } from "@/store/training-session.store";

function toSessionCoordinates(location: Location.LocationObject) {
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
}

export function LearnerLocationPublisher() {
  const requestingSessionId = useTrainingSessionStore((state) => {
    const share = Object.values(state.locationShares).find(
      (item) => item.status === "requesting_permission",
    );
    return share?.sessionId ?? null;
  });
  const sharingSessionId = useTrainingSessionStore(
    (state) => state.devicePublishingSessionId,
  );
  const startLocationSharing = useTrainingSessionStore(
    (state) => state.startLocationSharing,
  );
  const updateSharedLocation = useTrainingSessionStore(
    (state) => state.updateSharedLocation,
  );
  const failLocationSharing = useTrainingSessionStore(
    (state) => state.failLocationSharing,
  );

  useEffect(() => {
    if (!requestingSessionId) return;

    let cancelled = false;

    const requestAndStart = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (!permission.granted) {
          failLocationSharing(requestingSessionId, "permission_denied");
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (cancelled) return;
        if (!servicesEnabled) {
          failLocationSharing(requestingSessionId, "location_unavailable");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;
        startLocationSharing(
          requestingSessionId,
          toSessionCoordinates(currentLocation),
        );
      } catch {
        if (!cancelled) {
          failLocationSharing(requestingSessionId, "location_unavailable");
        }
      }
    };

    void requestAndStart();
    return () => {
      cancelled = true;
    };
  }, [failLocationSharing, requestingSessionId, startLocationSharing]);

  useEffect(() => {
    if (!sharingSessionId) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    const subscribe = async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (location) => {
            updateSharedLocation(
              sharingSessionId,
              toSessionCoordinates(location),
            );
          },
          () => {
            failLocationSharing(sharingSessionId, "location_unavailable");
          },
        );

        if (cancelled) subscription.remove();
      } catch {
        if (!cancelled) {
          failLocationSharing(sharingSessionId, "location_unavailable");
        }
      }
    };

    void subscribe();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [failLocationSharing, sharingSessionId, updateSharedLocation]);

  return null;
}
