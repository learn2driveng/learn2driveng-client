import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";
import type {
  AppNotification,
  NotificationPreferences,
} from "@/types/notification";

type NotificationListResponse = ApiSuccessResponse<AppNotification[]> & {
  unreadCount: number;
};

export async function fetchNotifications() {
  const { data } = await api.get<NotificationListResponse>("/notifications/me");
  return { items: data.data, unreadCount: data.unreadCount };
}

export async function markNotificationRead(notificationId: string) {
  const { data } = await api.patch<ApiSuccessResponse<AppNotification>>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
  );
  return data.data;
}

export async function markAllNotificationsRead() {
  await api.post("/notifications/read-all", {});
}

export async function fetchNotificationPreferences() {
  const { data } = await api.get<ApiSuccessResponse<NotificationPreferences>>(
    "/notifications/preferences",
  );
  return data.data;
}

export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>,
) {
  const { data } = await api.put<ApiSuccessResponse<NotificationPreferences>>(
    "/notifications/preferences",
    updates,
  );
  return data.data;
}

export async function registerPushToken(input: {
  token: string;
  platform: "android" | "ios";
  deviceName?: string;
}) {
  await api.post("/notifications/push-tokens", input);
}

export async function unregisterPushToken(token: string) {
  await api.delete("/notifications/push-tokens", { data: { token } });
}
