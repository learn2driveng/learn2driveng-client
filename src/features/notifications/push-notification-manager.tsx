import { useRouter } from "expo-router";
import { useEffect } from "react";

import {
  getNotificationsModule,
  syncPushRegistration,
} from "@/features/notifications/push-notifications";
import { destinationForRole } from "@/features/auth";
import { markNotificationRead } from "@/lib/api/notifications";
import { useAuthStore } from "@/store/auth.store";
import { refreshNotificationUnreadCount } from "@/store/notification.store";

function isSafeNotificationPath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes(":")
  );
}

export function PushNotificationManager() {
  const router = useRouter();
  const authStatus = useAuthStore((state) => state.status);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void syncPushRegistration(false).catch(() => undefined);
  }, [authStatus]);

  useEffect(() => {
    let active = true;
    let removeListeners: (() => void) | undefined;

    void getNotificationsModule()
      .then((notifications) => {
        if (!active || !notifications) return;

        notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        const openNotification = (notification: {
          request: { content: { data?: Record<string, unknown> } };
        }) => {
          const data = notification.request.content.data;
          const url = data?.url;
          const notificationId = data?.notificationId;
          const role = useAuthStore.getState().role;

          if (useAuthStore.getState().isAuthenticated && role) {
            if (typeof notificationId === "string") {
              void markNotificationRead(notificationId)
                .then(() => refreshNotificationUnreadCount())
                .catch(() => undefined);
            }
            if (isSafeNotificationPath(url)) {
              router.push(destinationForRole(role, url));
            }
          } else if (isSafeNotificationPath(url)) {
            router.push({ pathname: "/login", params: { returnTo: url } });
          }
        };

        const lastResponse = notifications.getLastNotificationResponse();
        if (lastResponse?.notification) {
          openNotification(lastResponse.notification);
          notifications.clearLastNotificationResponse();
        }

        const responseSubscription =
          notifications.addNotificationResponseReceivedListener((response) =>
            openNotification(response.notification),
          );
        const receivedSubscription =
          notifications.addNotificationReceivedListener(() => {
            if (useAuthStore.getState().isAuthenticated) {
              void refreshNotificationUnreadCount().catch(() => undefined);
            }
          });
        removeListeners = () => {
          responseSubscription.remove();
          receivedSubscription.remove();
        };
      })
      .catch(() => undefined);

    return () => {
      active = false;
      removeListeners?.();
    };
  }, [router]);

  return null;
}
