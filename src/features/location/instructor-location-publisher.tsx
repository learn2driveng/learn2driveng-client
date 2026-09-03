import * as Location from "expo-location";
import { useEffect } from "react";

import { recordInstructorSessionLocation } from "@/lib/api/training-sessions";
import { useLocationStore } from "@/store/location.store";
import { useSettingsStore } from "@/store/settings.store";
import { useTrainingSessionStore } from "@/store/training-session.store";
import {
  startInstructorBackgroundLocation,
  stopInstructorBackgroundLocation,
} from "./instructor-background-location";

function publishLocation(sessionId: string, location: Location.LocationObject) {
  return recordInstructorSessionLocation(sessionId, {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyInMeters: location.coords.accuracy ?? undefined,
    recordedAt: new Date(location.timestamp).toISOString(),
  });
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number) {
  return Promise.race<T | null>([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), milliseconds);
    }),
  ]);
}

export function InstructorLocationPublisher() {
  const activeSessionId = useTrainingSessionStore(
    (state) => state.activeSessionId,
  );
  const enabled = useSettingsStore(
    (state) => state.instructorLocationSharingEnabled,
  );
  const setPublishingStatus = useLocationStore(
    (state) => state.setInstructorPublishingStatus,
  );

  useEffect(() => {
    if (!activeSessionId || !enabled) {
      setPublishingStatus("idle");
      void stopInstructorBackgroundLocation().catch(() => undefined);
      return;
    }

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    const startPublishing = async () => {
      setPublishingStatus("requesting");
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted || cancelled) {
        if (!cancelled) {
          setPublishingStatus(
            "error",
            "Location permission is required during an active lesson.",
          );
        }
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync({
        maxAge: 120_000,
        requiredAccuracy: 250,
      });
      if (cancelled) return;
      if (lastKnown) {
        await publishLocation(activeSessionId, lastKnown).catch(
          () => undefined,
        );
      }

      const current = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        }),
        15_000,
      ).catch(() => null);
      if (cancelled) return;
      if (current) {
        await publishLocation(activeSessionId, current).catch(() => undefined);
      }

      const backgroundStarted = await startInstructorBackgroundLocation(
        activeSessionId,
      ).catch(() => false);
      if (cancelled) return;
      if (backgroundStarted) {
        setPublishingStatus("background");
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (location) => {
          void publishLocation(activeSessionId, location)
            .then(() => setPublishingStatus("foreground"))
            .catch((error) =>
              setPublishingStatus(
                "error",
                error instanceof Error
                  ? error.message
                  : "Location could not be uploaded.",
              ),
            );
        },
      );
      setPublishingStatus("foreground");
      if (cancelled) subscription.remove();
    };

    void startPublishing().catch((error) => {
      if (!cancelled) {
        setPublishingStatus(
          "error",
          error instanceof Error
            ? error.message
            : "Location sharing could not be started.",
        );
      }
    });
    return () => {
      cancelled = true;
      subscription?.remove();
      setPublishingStatus("idle");
      void stopInstructorBackgroundLocation().catch(() => undefined);
    };
  }, [activeSessionId, enabled, setPublishingStatus]);

  return null;
}
