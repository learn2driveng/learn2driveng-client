import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

import { toLocationPingPayload } from "@/features/location/location-utils";
import {
  clearActiveLocationTaskTarget,
  getActiveLocationTaskTarget,
} from "@/features/location/session-location-task-state";
import {
  recordInstructorSessionLocation,
  recordLearnerSessionLocation,
} from "@/lib/api/training-sessions";

export const SESSION_BACKGROUND_LOCATION_TASK =
  "learn2drive-session-background-location";

TaskManager.defineTask(
  SESSION_BACKGROUND_LOCATION_TASK,
  async ({ data, error }) => {
    if (error) return;

    const locations = (data as { locations?: Location.LocationObject[] } | undefined)
      ?.locations;
    const latest = locations?.[locations.length - 1];
    const target = getActiveLocationTaskTarget();
    if (!latest || !target) return;

    const payload = toLocationPingPayload(latest);
    if (target.role === "learner") {
      await recordLearnerSessionLocation(target.participantId, payload).catch(
        () => undefined,
      );
      return;
    }

    await recordInstructorSessionLocation(target.sessionId, payload).catch(
      () => undefined,
    );
  },
);

export async function ensureBackgroundLocationPermissions() {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return false;

  const background = await Location.requestBackgroundPermissionsAsync();
  return background.granted;
}

export async function startSessionBackgroundLocationUpdates() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    SESSION_BACKGROUND_LOCATION_TASK,
  );
  if (hasStarted) return true;

  const granted = await ensureBackgroundLocationPermissions();
  if (!granted) return false;

  await Location.startLocationUpdatesAsync(SESSION_BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 15,
    timeInterval: 10_000,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Learn2Drive lesson in progress",
      notificationBody: "Sharing live lesson location while your session is active.",
    },
  });

  return true;
}

export async function stopSessionBackgroundLocationUpdates() {
  clearActiveLocationTaskTarget();
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    SESSION_BACKGROUND_LOCATION_TASK,
  );
  if (!hasStarted) return;
  await Location.stopLocationUpdatesAsync(SESSION_BACKGROUND_LOCATION_TASK);
}
