import { useRouter, type Href } from "expo-router";

import { markNotificationRead } from "@/lib/api/notifications";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import type { AppNotification } from "@/types/notification";

import {
  readNotificationShareUrl,
  resolveNotificationRoute,
} from "./route-notification";

type OpenNotificationOptions = {
  router: ReturnType<typeof useRouter>;
  setPendingShareUrl: (shareUrl: string) => void;
  markRead?: boolean;
};

export async function openNotification(
  item: AppNotification,
  { router, setPendingShareUrl, markRead = true }: OpenNotificationOptions,
) {
  if (markRead && !item.readAt && item.id) {
    await markNotificationRead(item.id).catch(() => undefined);
  }

  if (item.type === "lesson_started") {
    await refreshLearnerSessions().catch(() => undefined);
    const shareUrl = readNotificationShareUrl(item);
    if (shareUrl) {
      setPendingShareUrl(shareUrl);
    }
  }

  const route = resolveNotificationRoute(item);
  if (route) {
    router.push({
      pathname: route.pathname,
      params: route.params,
    } as Href);
  }
}
