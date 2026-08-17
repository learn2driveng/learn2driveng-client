import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SettingsRow,
  ToggleSettingRow,
} from "@/components/dashboard";
import {
  getPushPermissionState,
  syncPushRegistration,
  type PushPermissionState,
} from "@/features/notifications/push-notifications";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api/notifications";
import type {
  NotificationPreferenceKey,
  NotificationPreferences,
} from "@/types/notification";

type NotificationPreferencesScreenProps = {
  audience: "learner" | "instructor";
};

const learnerRows: {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "sessionReminders",
    title: "Sessions and bookings",
    description: "Booking confirmations, reminders, reschedules and cancellations.",
  },
  {
    key: "packageUpdates",
    title: "Package updates",
    description: "Session balance, package expiry and renewal information.",
  },
  {
    key: "promotions",
    title: "Offers and announcements",
    description: "Optional product news, promotions and school announcements.",
  },
];

const instructorRows: typeof learnerRows = [
  {
    key: "lessonReminders",
    title: "Lesson reminders",
    description: "A reminder before each scheduled lesson.",
  },
  {
    key: "scheduleChanges",
    title: "Schedule changes",
    description: "New assignments, reschedules and cancellations.",
  },
  {
    key: "reportReminders",
    title: "Report reminders",
    description: "Prompts when a completed lesson still needs a report.",
  },
];

function permissionLabel(permission: PushPermissionState | null) {
  if (!permission) return "Checking";
  if (permission.status === "allowed") return "Allowed";
  if (permission.status === "unavailable") return "Unavailable";
  return "Not allowed";
}

export function NotificationPreferencesScreen({
  audience,
}: NotificationPreferencesScreenProps) {
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    null,
  );
  const [permission, setPermission] = useState<PushPermissionState | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [nextPreferences, nextPermission] = await Promise.all([
        fetchNotificationPreferences(),
        getPushPermissionState(),
      ]);
      setPreferences(nextPreferences);
      setPermission(nextPermission);
    } catch {
      setError("We could not load your notification preferences.");
      setPermission(await getPushPermissionState());
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  const enableNotifications = async () => {
    if (permission?.status === "unavailable") {
      showToast(
        "Push notifications require an updated development build on a physical device.",
      );
      return;
    }

    if (permission?.status === "allowed" || permission?.canAskAgain === false) {
      await Linking.openSettings();
      return;
    }

    setIsEnabling(true);
    try {
      const token = await syncPushRegistration(true);
      const nextPermission = await getPushPermissionState();
      setPermission(nextPermission);
      showToast(
        token
          ? "Push notifications are enabled."
          : nextPermission.status === "unavailable"
            ? "Push notifications require an updated development build on a physical device."
            : "Notification permission was not enabled.",
      );
    } catch {
      showToast("We could not enable push notifications. Please try again.");
    } finally {
      setIsEnabling(false);
    }
  };

  const changePreference = async (
    key: NotificationPreferenceKey,
    value: boolean,
  ) => {
    if (!preferences) return;
    const previous = preferences;
    setPreferences({ ...preferences, [key]: value });
    try {
      const saved = await updateNotificationPreferences({ [key]: value });
      setPreferences(saved);
    } catch {
      setPreferences(previous);
      showToast("That notification preference could not be saved.");
    }
  };

  const rows = audience === "learner" ? learnerRows : instructorRows;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Notifications" />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Control device permission and the updates sent to your account.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="bell-ring-outline"
          title="Push notifications"
          description="Receive timely updates on this device."
          value={isEnabling ? "Enabling" : permissionLabel(permission)}
          onPress={() => void enableNotifications()}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        WHAT YOU RECEIVE
      </Text>

      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        {!preferences ? (
          <View className="items-center py-10">
            <ActivityIndicator color={colors.primary} />
            <Text
              className="mt-3 font-figtree text-[12px]"
              style={{ color: colors.textMuted }}
            >
              Loading preferences…
            </Text>
          </View>
        ) : (
          rows.map((row, index) => (
            <View key={row.key}>
              {index ? (
                <View
                  className="mx-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />
              ) : null}
              <ToggleSettingRow
                title={row.title}
                description={row.description}
                value={preferences[row.key]}
                onValueChange={(value) =>
                  void changePreference(row.key, value)
                }
              />
            </View>
          ))
        )}
      </View>

      {error ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void load()}
          className="mt-4 flex-row items-center gap-2 self-start px-1 py-2 active:opacity-70"
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={18}
            color={colors.error}
          />
          <Text
            className="font-figtree-semibold text-[12px]"
            style={{ color: colors.error }}
          >
            {error} Tap to retry.
          </Text>
        </Pressable>
      ) : null}

      <Text
        className="mt-5 font-figtree text-[11px] leading-4"
        style={{ color: colors.textSubtle }}
      >
        Turning off a category stops its push alerts. The notification inbox
        remains available for important account history.
      </Text>
    </DashboardScreen>
  );
}
