import * as Location from "expo-location";
import { useEffect } from "react";

import { toLocationPingPayload } from "@/features/location/location-utils";
import { recordLearnerSessionLocation } from "@/lib/api/training-sessions";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

function findActiveLearnerParticipant(
  joinedSessions: ReturnType<
    typeof useLearnerSessionsStore.getState
  >["joinedSessions"],
) {
  const active = joinedSessions.find(
    (item) =>
      typeof item.sessionId === "object" &&
      item.sessionId.status === "in_progress" &&
      (item.status === "scheduled" || item.status === "present"),
  );
  if (!active || typeof active.sessionId !== "object") return null;
  return {
    participantId: active.id,
    sessionId: active.sessionId.id,
    learnerId: active.learnerId,
  };
}

function publishLocation(participantId: string, location: Location.LocationObject) {
  return recordLearnerSessionLocation(
    participantId,
    toLocationPingPayload(location),
  );
}

export function LearnerLocationPublisher() {
  const joinedSessions = useLearnerSessionsStore((state) => state.joinedSessions);
  const requestLocationSharing = useTrainingSessionStore(
    (state) => state.requestLocationSharing,
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
  const stopLocationSharing = useTrainingSessionStore(
    (state) => state.stopLocationSharing,
  );

  const activeParticipant = findActiveLearnerParticipant(joinedSessions);
  const participantId = activeParticipant?.participantId ?? null;
  const sessionId = activeParticipant?.sessionId ?? null;
  const learnerId = activeParticipant?.learnerId ?? null;

  useEffect(() => {
    if (!participantId || !sessionId || !learnerId) return;

    requestLocationSharing(sessionId, learnerId);

    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;

    const startPublishing = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (!permission.granted) {
          failLocationSharing(sessionId, "permission_denied");
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (cancelled) return;
        if (!servicesEnabled) {
          failLocationSharing(sessionId, "location_unavailable");
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;

        startLocationSharing(sessionId, {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          accuracy: current.coords.accuracy ?? null,
          accuracyInMeters: current.coords.accuracy ?? null,
          heading:
            current.coords.heading != null && current.coords.heading >= 0
              ? current.coords.heading
              : null,
          speed:
            current.coords.speed != null && current.coords.speed >= 0
              ? current.coords.speed
              : null,
          recordedAt: new Date(current.timestamp).toISOString(),
        });
        await publishLocation(participantId, current).catch(() => undefined);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (location) => {
            updateSharedLocation(sessionId, {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy ?? null,
              accuracyInMeters: location.coords.accuracy ?? null,
              heading:
                location.coords.heading != null && location.coords.heading >= 0
                  ? location.coords.heading
                  : null,
              speed:
                location.coords.speed != null && location.coords.speed >= 0
                  ? location.coords.speed
                  : null,
              recordedAt: new Date(location.timestamp).toISOString(),
            });
            void publishLocation(participantId, location).catch(
              () => undefined,
            );
          },
          () => {
            failLocationSharing(sessionId, "location_unavailable");
          },
        );
        if (cancelled) subscription.remove();
      } catch {
        if (!cancelled) {
          failLocationSharing(sessionId, "location_unavailable");
        }
      }
    };

    void startPublishing();
    return () => {
      cancelled = true;
      subscription?.remove();
      stopLocationSharing(sessionId);
    };
  }, [
    participantId,
    sessionId,
    learnerId,
    failLocationSharing,
    requestLocationSharing,
    startLocationSharing,
    stopLocationSharing,
    updateSharedLocation,
  ]);

  return null;
}
