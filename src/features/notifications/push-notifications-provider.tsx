import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import {
  registerPushToken,
  unregisterPushToken,
} from "@/lib/api/notifications";
import { notificationFromPushData } from "@/lib/notifications/map-push-data";
import { openNotification } from "@/lib/notifications/open-notification";
import {
  clearStoredPushToken,
  readStoredPushToken,
  saveStoredPushToken,
} from "@/lib/notifications/push-token-storage";
import { useAuthStore } from "@/store/auth.store";
import { useLiveLocationStore } from "@/store/live-location.store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("updates-v2", {
    name: "Lesson updates",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FFB800",
  });
}

async function resolveExpoPushToken() {
  if (Platform.OS === "web" || !Device.isDevice) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  if (!projectId) return null;

  const permission = await Notifications.getPermissionsAsync();
  const finalPermission =
    permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
      ? permission
      : await Notifications.requestPermissionsAsync();

  if (!finalPermission.granted) return null;

  const tokenResult = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenResult.data;
}

async function registerCurrentDeviceToken() {
  await ensureAndroidChannel();
  const token = await resolveExpoPushToken();
  if (!token) return null;

  const platform = Platform.OS === "ios" ? "ios" : "android";
  await registerPushToken({
    token,
    platform,
    deviceName: Device.modelName ?? undefined,
  });
  await saveStoredPushToken(token);
  return token;
}

export function PushNotificationsProvider() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPendingShareUrl = useLiveLocationStore(
    (state) => state.setPendingShareUrl,
  );
  const handledColdStart = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || Platform.OS === "web") return;

    void registerCurrentDeviceToken().catch(() => undefined);

    const tokenSubscription = Notifications.addPushTokenListener((event) => {
      void (async () => {
        const platform = Platform.OS === "ios" ? "ios" : "android";
        await registerPushToken({
          token: event.data,
          platform,
          deviceName: Device.modelName ?? undefined,
        }).catch(() => undefined);
        await saveStoredPushToken(event.data);
      })();
    });

    return () => {
      tokenSubscription.remove();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || Platform.OS === "web") return;

    const navigateFromResponse = (
      response: Notifications.NotificationResponse | null,
    ) => {
      if (!response) return;

      const item = notificationFromPushData(
        response.notification.request.content.data as Record<string, unknown>,
      );
      if (!item) return;

      void openNotification(item, {
        router,
        setPendingShareUrl,
      });
    };

    if (!handledColdStart.current) {
      handledColdStart.current = true;
      void Notifications.getLastNotificationResponseAsync().then(
        navigateFromResponse,
      );
    }

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigateFromResponse(response);
      });

    return () => {
      responseSubscription.remove();
    };
  }, [isAuthenticated, router, setPendingShareUrl]);

  return null;
}

export async function unregisterPushNotificationsOnLogout() {
  if (Platform.OS === "web") return;

  const token = await readStoredPushToken();
  if (token) {
    await unregisterPushToken(token).catch(() => undefined);
  }
  await clearStoredPushToken();
}
