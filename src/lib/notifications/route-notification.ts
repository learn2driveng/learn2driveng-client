import type { AppNotification } from "@/types/notification";

type NotificationRoute = {
  pathname: string;
  params?: Record<string, string>;
};

export function resolveNotificationRoute(
  item: AppNotification,
): NotificationRoute | null {
  const participantId = item.data?.participantId;

  if (item.type === "lesson_started" && participantId) {
    return {
      pathname: "/student/sessions/[bookingId]/live-location",
      params: { bookingId: participantId },
    };
  }

  if (item.type === "lesson_started_school" && item.data?.sessionId) {
    return { pathname: "/school/monitoring" };
  }

  if (participantId) {
    return {
      pathname: "/student/sessions/[bookingId]",
      params: { bookingId: participantId },
    };
  }

  return null;
}

export function readNotificationShareUrl(item: AppNotification) {
  const shareUrl = item.data?.shareUrl;
  return typeof shareUrl === "string" && shareUrl.length > 0 ? shareUrl : null;
}
