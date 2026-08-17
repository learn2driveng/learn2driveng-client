import Constants from "expo-constants";
import * as Device from "expo-device";
import { requireOptionalNativeModule } from "expo-modules-core";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import {
  registerPushToken,
  unregisterPushToken,
} from "@/lib/api/notifications";

const PUSH_TOKEN_KEY = "learn2drive.notifications.expoPushToken";
const UPDATES_CHANNEL_ID = "updates-v2";

type NotificationsModule = typeof import("expo-notifications");

export type PushPermissionState = {
  status: "allowed" | "denied" | "undetermined" | "unavailable";
  canAskAgain: boolean;
};

async function loadNotifications(): Promise<NotificationsModule | null> {
  if (
    Platform.OS === "web" ||
    !requireOptionalNativeModule("ExpoPushTokenManager")
  ) {
    return null;
  }

  try {
    const notifications = await import("expo-notifications");
    if (
      typeof notifications.setNotificationHandler !== "function" ||
      typeof notifications.getPermissionsAsync !== "function" ||
      typeof notifications.getExpoPushTokenAsync !== "function"
    ) {
      return null;
    }
    return notifications;
  } catch {
    return null;
  }
}

function permissionAllowed(
  notifications: NotificationsModule,
  permission: Awaited<ReturnType<NotificationsModule["getPermissionsAsync"]>>,
) {
  if (permission.granted) return true;
  const iosStatus = permission.ios?.status;
  return (
    iosStatus === notifications.IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function ensureAndroidChannel(notifications: NotificationsModule) {
  if (Platform.OS !== "android") return;

  await notifications.setNotificationChannelAsync(UPDATES_CHANNEL_ID, {
    name: "Bookings and lesson updates",
    description: "Booking confirmations, reminders and schedule changes.",
    importance: notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#F4B323",
  });
}

export async function getPushPermissionState(): Promise<PushPermissionState> {
  const notifications = await loadNotifications();
  if (!notifications || !Device.isDevice) {
    return { status: "unavailable", canAskAgain: false };
  }

  await ensureAndroidChannel(notifications);
  const permission = await notifications.getPermissionsAsync();
  return {
    status: permissionAllowed(notifications, permission)
      ? "allowed"
      : permission.status === "undetermined"
        ? "undetermined"
        : "denied",
    canAskAgain: permission.canAskAgain,
  };
}

export async function syncPushRegistration(requestPermission: boolean) {
  const notifications = await loadNotifications();
  if (!notifications || !Device.isDevice) return null;

  await ensureAndroidChannel(notifications);
  let permission = await notifications.getPermissionsAsync();
  if (!permissionAllowed(notifications, permission) && requestPermission) {
    permission = await notifications.requestPermissionsAsync();
  }
  if (!permissionAllowed(notifications, permission)) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error("EAS project ID is not configured.");

  const token = (
    await notifications.getExpoPushTokenAsync({ projectId: String(projectId) })
  ).data;
  await registerPushToken({
    token,
    platform: Platform.OS as "android" | "ios",
    deviceName: Device.deviceName ?? undefined,
  });
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
  return token;
}

export async function unregisterCurrentPushDevice() {
  if (Platform.OS === "web") return;
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!token) return;

  try {
    await unregisterPushToken(token);
  } finally {
    await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  }
}

export async function getNotificationsModule() {
  return loadNotifications();
}

export const pushNotificationChannelId = UPDATES_CHANNEL_ID;
