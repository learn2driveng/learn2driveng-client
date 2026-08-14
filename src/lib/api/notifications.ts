import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";
import type { AppNotification } from "@/types/notification";

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
