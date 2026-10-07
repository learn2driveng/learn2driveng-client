import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useToast } from "@/components/common/toast";
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  clearAllNotifications,
  clearNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { destinationForRole } from "@/features/auth";
import { syncNotificationBadge } from "@/features/notifications/push-notifications";
import { useAuthStore } from "@/store/auth.store";
import {
  refreshNotificationUnreadCount,
  useNotificationStore,
} from "@/store/notification.store";
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
  const { showToast } = useToast();
  const role = useAuthStore((state) => state.role);
  const isInstructor = role === "instructor";
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearingId, setClearingId] = useState<string | null>(null);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const decrementUnreadCount = useNotificationStore(
    (state) => state.decrementUnreadCount,
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const result = await fetchNotifications();
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not load your notifications.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setUnreadCount]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const openNotification = async (item: AppNotification) => {
    if (!item.readAt) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, readAt: new Date().toISOString() }
            : entry,
        ),
      );
      decrementUnreadCount();
      await markNotificationRead(item.id)
        .then(() => refreshNotificationUnreadCount())
        .catch(() => void load());
    }
    if (typeof item.data?.url === "string" && role) {
      router.push(destinationForRole(role, item.data.url));
    } else if (item.data?.participantId && !isInstructor) {
      router.push({
        pathname: "/student/sessions/[bookingId]",
        params: { bookingId: item.data.participantId },
      });
    }
  };

  const markAllRead = async () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
    await markAllNotificationsRead()
      .then(() => refreshNotificationUnreadCount())
      .catch(() => void load());
  };

  const hasUnread = items.some((item) => !item.readAt);

  const clearNotifications = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      await clearAllNotifications();
      setItems([]);
      setUnreadCount(0);
      await syncNotificationBadge(0).catch(() => undefined);
      setConfirmClear(false);
      showToast("Notifications cleared.");
    } catch {
      showToast("Could not clear notifications. Please try again.", "error");
    } finally {
      setClearing(false);
    }
  };

  const clearOne = async (item: AppNotification) => {
    if (clearing || clearingId) return;
    setClearingId(item.id);
    try {
      await clearNotification(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      const nextCount = Math.max(
        0,
        useNotificationStore.getState().unreadCount - (item.readAt ? 0 : 1),
      );
      setUnreadCount(nextCount);
      await syncNotificationBadge(nextCount).catch(() => undefined);
    } catch {
      showToast(
        "Could not clear this notification. Please try again.",
        "error",
      );
    } finally {
      setClearingId(null);
    }
  };

  return (
    <DashboardScreen onRefresh={load}>
      <DashboardPageHeader title="Notifications" />

      {isLoading ? (
        <View className="items-center py-20">
          <ActivityIndicator color={colors.primary} />
          <Text
            className="mt-3 font-figtree text-[14px]"
            style={{ color: colors.textMuted }}
          >
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
            description={
              isInstructor
                ? "Assignments, schedule changes and report reminders will appear here."
                : "Lesson changes and instructor feedback will appear here."
            }
            actionLabel="Notification preferences"
            onActionPress={() =>
              router.push(
                isInstructor
                  ? "/instructor/profile/notifications"
                  : "/student/profile/notifications",
              )
            }
          />
        </View>
      ) : (
        <>
          <View className="mb-4 mt-3 flex-row flex-wrap justify-end gap-2">
            {hasUnread ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => void markAllRead()}
                disabled={clearing || !!clearingId}
                className="rounded-full border px-5 py-3 active:opacity-70"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Text
                  className="font-figtree-semibold text-[13px]"
                  style={{ color: colors.text }}
                >
                  Mark all as read
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear all notifications"
              disabled={clearing || !!clearingId}
              onPress={() => setConfirmClear(true)}
              className="rounded-full border px-5 py-3 active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text
                className="font-figtree-semibold text-[13px]"
                style={{ color: colors.error }}
              >
                Clear all
              </Text>
            </Pressable>
          </View>

          <View className="gap-3">
            {items.map((item) => (
              <View
                key={item.id}
                className="flex-row rounded-3xl border"
                style={{
                  borderColor: item.readAt ? colors.border : colors.primary,
                  backgroundColor: colors.surface,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open notification: ${item.title}`}
                  onPress={() => void openNotification(item)}
                  className="min-w-0 flex-1 flex-row gap-3 p-4 active:opacity-75"
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: item.readAt
                        ? colors.surfaceStrong
                        : colors.primary,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        item.type === "lesson_completed"
                          ? "clipboard-check-outline"
                          : "calendar-clock-outline"
                      }
                      size={21}
                      color={item.readAt ? colors.textMuted : colors.onPrimary}
                    />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-start gap-2">
                      <Text
                        className="flex-1 font-figtree-bold text-[15px]"
                        style={{ color: colors.text }}
                      >
                        {item.title}
                      </Text>
                      {!item.readAt ? (
                        <View
                          className="mt-1.5 h-2 w-2 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      ) : null}
                    </View>
                    <Text
                      className="mt-1 font-figtree text-[13px] leading-5"
                      style={{ color: colors.textMuted }}
                    >
                      {item.message}
                    </Text>
                    <Text
                      className="mt-2 font-figtree-medium text-[11px]"
                      style={{ color: colors.textSubtle }}
                    >
                      {formatNotificationTime(item.createdAt)}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Clear notification: ${item.title}`}
                  accessibilityState={{
                    disabled: clearing || !!clearingId,
                    busy: clearingId === item.id,
                  }}
                  disabled={clearing || !!clearingId}
                  onPress={() => void clearOne(item)}
                  className="mr-3 mt-3 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  {clearingId === item.id ? (
                    <ActivityIndicator size="small" color={colors.textMuted} />
                  ) : (
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={19}
                      color={colors.error}
                    />
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!clearing) setConfirmClear(false);
        }}
        transparent
        visible={confirmClear}
      >
        <View
          className="flex-1 justify-center px-5"
          style={{ backgroundColor: "rgba(4, 19, 32, 0.58)" }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close confirmation"
            disabled={clearing}
            onPress={() => setConfirmClear(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            className="mx-auto w-full max-w-[420px] rounded-[28px] p-6"
            style={{ backgroundColor: colors.surface }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="bell-remove-outline"
                size={25}
                color={colors.error}
              />
            </View>
            <Text
              accessibilityRole="header"
              className="mt-5 font-figtree-bold text-[21px]"
              style={{ color: colors.text }}
            >
              Clear notifications?
            </Text>
            <Text
              className="mt-2 font-figtree text-[14px] leading-5"
              style={{ color: colors.textMuted }}
            >
              This removes the current updates from your inbox. New
              notifications will still arrive.
            </Text>
            <View className="mt-6 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                disabled={clearing}
                onPress={() => setConfirmClear(false)}
                className="h-12 flex-1 items-center justify-center rounded-2xl border"
                style={{ borderColor: colors.border }}
              >
                <Text
                  className="font-figtree-bold text-[14px]"
                  style={{ color: colors.text }}
                >
                  Keep
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm clear notifications"
                accessibilityState={{ disabled: clearing, busy: clearing }}
                disabled={clearing}
                onPress={() => void clearNotifications()}
                className="h-12 flex-1 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.error }}
              >
                {clearing ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text
                    className="font-figtree-bold text-[14px]"
                    style={{ color: colors.onPrimary }}
                  >
                    Clear all
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </DashboardScreen>
  );
}
