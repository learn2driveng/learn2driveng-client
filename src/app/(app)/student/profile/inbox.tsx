import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchNotifications,
  markAllNotificationsRead,
} from "@/lib/api/notifications";
import { openNotification } from "@/lib/notifications/open-notification";
import { useLiveLocationStore } from "@/store/live-location.store";
import type { ApiError } from "@/types";
import type { AppNotification } from "@/types/notification";

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function NotificationInboxScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchNotifications();
      setItems(result.items);
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not load your notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const setPendingShareUrl = useLiveLocationStore(
    (state) => state.setPendingShareUrl,
  );

  const handleOpenNotification = async (item: AppNotification) => {
    if (!item.readAt) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, readAt: new Date().toISOString() }
            : entry,
        ),
      );
    }

    await openNotification(item, {
      router,
      setPendingShareUrl,
    });
  };

  const markAllRead = async () => {
    setItems((current) =>
      current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })),
    );
    await markAllNotificationsRead().catch(() => void load());
  };

  const hasUnread = items.some((item) => !item.readAt);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Notifications" />

      {isLoading ? (
        <View className="items-center py-20">
          <ActivityIndicator color={colors.primary} />
          <Text className="mt-3 font-figtree text-[14px]" style={{ color: colors.textMuted }}>
            Loading updates…
          </Text>
        </View>
      ) : error ? (
        <View className="mt-8">
          <DashboardEmptyState
            icon="cloud-alert-outline"
            title="Notifications unavailable"
            description={error}
            actionLabel="Try again"
            onActionPress={() => void load()}
          />
        </View>
      ) : items.length === 0 ? (
        <View className="mt-8">
          <DashboardEmptyState
            icon="bell-check-outline"
            title="You’re all caught up"
            description="Lesson changes and instructor feedback will appear here."
            actionLabel="Notification preferences"
            onActionPress={() => router.push("/student/profile/notifications")}
          />
        </View>
      ) : (
        <>
          {hasUnread ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void markAllRead()}
              className="mb-4 mt-3 self-end rounded-full border px-5 py-3 active:opacity-70"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
            >
              <Text className="font-figtree-semibold text-[13px]" style={{ color: colors.text }}>
                Mark all as read
              </Text>
            </Pressable>
          ) : (
            <View className="h-4" />
          )}

          <View className="gap-3">
            {items.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => void handleOpenNotification(item)}
                className="flex-row gap-3 rounded-3xl border p-4 active:opacity-75"
                style={{
                  borderColor: item.readAt ? colors.border : colors.primary,
                  backgroundColor: colors.surface,
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.readAt ? colors.surfaceStrong : colors.primary }}
                >
                  <MaterialCommunityIcons
                    name={
                      item.type === "lesson_completed"
                        ? "clipboard-check-outline"
                        : item.type === "lesson_started"
                          ? "map-marker-radius"
                          : "calendar-clock-outline"
                    }
                    size={21}
                    color={item.readAt ? colors.textMuted : colors.onPrimary}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <View className="flex-row items-start gap-2">
                    <Text className="flex-1 font-figtree-bold text-[15px]" style={{ color: colors.text }}>
                      {item.title}
                    </Text>
                    {!item.readAt ? (
                      <View className="mt-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />
                    ) : null}
                  </View>
                  <Text className="mt-1 font-figtree text-[13px] leading-5" style={{ color: colors.textMuted }}>
                    {item.message}
                  </Text>
                  <Text className="mt-2 font-figtree-medium text-[11px]" style={{ color: colors.textSubtle }}>
                    {formatNotificationTime(item.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </DashboardScreen>
  );
}
