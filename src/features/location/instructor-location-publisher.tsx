import * as Location from "expo-location";
import { useEffect } from "react";

import { toLocationPingPayload } from "@/features/location/location-utils";
import { recordInstructorSessionLocation } from "@/lib/api/training-sessions";
import { useTrainingSessionStore } from "@/store/training-session.store";

function publishLocation(sessionId: string, location: Location.LocationObject) {
  return recordInstructorSessionLocation(
    sessionId,
    toLocationPingPayload(location),
  );
}

export function InstructorLocationPublisher() {
  const activeSessionId = useTrainingSessionStore(
    (state) => state.activeSessionId,
  );

  useEffect(() => {
    if (!activeSessionId) return;

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    const startPublishing = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted || cancelled) return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (cancelled) return;
      await publishLocation(activeSessionId, current).catch(() => undefined);

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          void publishLocation(activeSessionId, location).catch(
            () => undefined,
          );
        },
      );
      if (cancelled) subscription.remove();
    };

    void startPublishing().catch(() => undefined);
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [activeSessionId]);

  return null;
}
