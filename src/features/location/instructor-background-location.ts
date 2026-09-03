import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { getApiBaseUrl } from "@/lib/api/config";
import {
  readSessionTokens,
  writeSessionTokens,
} from "@/lib/auth/session-storage";
import type { ApiSuccessResponse, AuthTokens } from "@/types";

export const INSTRUCTOR_LOCATION_TASK =
  "learn2drive-instructor-background-location";
const ACTIVE_SESSION_KEY = "learn2drive.location.activeInstructorSession";

async function refreshTokens(refreshToken: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  if (!response.ok) throw new Error("The background session has expired.");
  const body = (await response.json()) as ApiSuccessResponse<AuthTokens>;
  await writeSessionTokens(body.data);
  return body.data;
}

async function publishBackgroundLocation(
  sessionId: string,
  location: Location.LocationObject,
) {
  let tokens = await readSessionTokens();
  if (!tokens) return;

  const send = (accessToken: string) =>
    fetch(
      `${getApiBaseUrl()}/training-sessions/${encodeURIComponent(sessionId)}/location-pings`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracyInMeters: location.coords.accuracy ?? undefined,
          recordedAt: new Date(location.timestamp).toISOString(),
        }),
      },
    );

  let response = await send(tokens.accessToken);
  if (response.status === 401) {
    if (!tokens.refreshToken) return;
    tokens = await refreshTokens(tokens.refreshToken);
    response = await send(tokens.accessToken);
  }
  if (!response.ok) {
    throw new Error(`Location upload failed with status ${response.status}.`);
  }
}

if (!TaskManager.isTaskDefined(INSTRUCTOR_LOCATION_TASK)) {
  TaskManager.defineTask<{ locations: Location.LocationObject[] }>(
    INSTRUCTOR_LOCATION_TASK,
    async ({ data, error }) => {
      if (error || !data?.locations?.length) return;
      const sessionId = await SecureStore.getItemAsync(ACTIVE_SESSION_KEY);
      if (!sessionId) return;
      for (const location of data.locations) {
        await publishBackgroundLocation(sessionId, location).catch(
          () => undefined,
        );
      }
    },
  );
}

export async function startInstructorBackgroundLocation(sessionId: string) {
  if (Platform.OS === "web") return false;
  const available = await Location.isBackgroundLocationAvailableAsync();
  if (!available) return false;

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (!foreground.granted) return false;
  const background = await Location.requestBackgroundPermissionsAsync();
  if (!background.granted) return false;

  await SecureStore.setItemAsync(ACTIVE_SESSION_KEY, sessionId, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  if (await Location.hasStartedLocationUpdatesAsync(INSTRUCTOR_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(INSTRUCTOR_LOCATION_TASK);
  }
  await Location.startLocationUpdatesAsync(INSTRUCTOR_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    activityType: Location.ActivityType.AutomotiveNavigation,
    distanceInterval: 10,
    timeInterval: 5000,
    deferredUpdatesDistance: 25,
    deferredUpdatesInterval: 15_000,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Active driving lesson",
      notificationBody:
        "Learn2Drive is sharing the instructor location for this lesson.",
      killServiceOnDestroy: false,
    },
  });
  return true;
}

export async function stopInstructorBackgroundLocation() {
  if (Platform.OS !== "web") {
    const started = await Location.hasStartedLocationUpdatesAsync(
      INSTRUCTOR_LOCATION_TASK,
    );
    if (started) {
      await Location.stopLocationUpdatesAsync(INSTRUCTOR_LOCATION_TASK);
    }
    await SecureStore.deleteItemAsync(ACTIVE_SESSION_KEY);
  }
}
