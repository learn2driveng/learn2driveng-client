import type { AppNotification } from "@/types/notification";

export function notificationFromPushData(
  data: Record<string, unknown> | undefined,
): AppNotification | null {
  if (!data) return null;

  const notificationId =
    typeof data.notificationId === "string" ? data.notificationId : null;
  if (!notificationId) return null;

  const type = typeof data.type === "string" ? data.type : "unknown";

  return {
    id: notificationId,
    type,
    title: typeof data.title === "string" ? data.title : "",
    message: typeof data.body === "string" ? data.body : "",
    data: {
      participantId:
        typeof data.participantId === "string" ? data.participantId : undefined,
      sessionId:
        typeof data.sessionId === "string" ? data.sessionId : undefined,
      shareUrl: typeof data.shareUrl === "string" ? data.shareUrl : undefined,
      url: typeof data.url === "string" ? data.url : undefined,
      instructorName:
        typeof data.instructorName === "string"
          ? data.instructorName
          : undefined,
      learnerCount:
        typeof data.learnerCount === "number" ? data.learnerCount : undefined,
    },
    createdAt: new Date().toISOString(),
  };
}
