import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useToast } from "@/components/common/toast";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { BookingCancellationModal } from "@/features/session-booking";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { cancelLearnerTrainingSession } from "@/lib/api";
import { refreshLearnerBookings } from "@/lib/learner/hydrate-learner-operations";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import type { ApiError } from "@/types";

export default function BookingDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const [showCancellation, setShowCancellation] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useLearnerSessionsStore((state) =>
    state.lessonCards.find((item) => item.id === bookingId),
  );

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Booking details" />
        <View
          className="mt-10 items-center rounded-3xl border px-6 py-12"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-remove-outline"
            size={36}
            color={colors.textSubtle}
          />
          <Text
            className="mt-4 text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Booking not found
          </Text>
        </View>
      </DashboardScreen>
    );
  }

  const status = booking.status;
  const statusColor =
    status === "scheduled"
      ? colors.verified
      : status === "completed" || status === "in_progress"
        ? colors.success
        : colors.error;
  const statusBackground =
    status === "scheduled"
      ? colors.verifiedSoft
      : status === "completed" || status === "in_progress"
        ? colors.successSoft
        : colors.surfaceStrong;
  const details = [
    ["Driving school", booking.school],
    ["Package", booking.packageName],
    ["Instructor", booking.instructor],
    ["Location", booking.location],
    ["Booking reference", booking.reference ?? booking.id],
  ];

  const cancelLesson = async () => {
    if (cancelling) return;
    setCancelling(true);
    setActionError(null);
    try {
      await cancelLearnerTrainingSession(booking.id);
      await Promise.all([refreshLearnerBookings(), refreshLearnerSessions()]);
      setShowCancellation(false);
      showToast("Lesson cancelled. One lesson returned to your package.");
      router.replace("/student/sessions");
    } catch (caught) {
      setShowCancellation(false);
      setActionError(
        (caught as ApiError).message || "We could not cancel this lesson.",
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Booking details" />

      <View
        className="mt-7 rounded-3xl p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Driving lesson
            </Text>
            <Text
              className="mt-3 text-[24px] leading-7"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {booking.date}
            </Text>
            <Text
              className="mt-2 text-[14px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {booking.time}
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: statusBackground }}
          >
            <Text
              className="text-[9px] uppercase tracking-[0.8px]"
              style={{ color: statusColor, fontFamily: fontFamily.figtreeBold }}
            >
              {status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="mt-5 overflow-hidden rounded-3xl border px-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {details.map(([label, value], index) => (
          <View
            key={label}
            className="flex-row items-start justify-between gap-5 py-4"
            style={
              index
                ? { borderTopWidth: 1, borderTopColor: colors.border }
                : undefined
            }
          >
            <Text
              className="text-[12px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {label}
            </Text>
            <Text
              className="max-w-[62%] text-right text-[12px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>

      {status === "in_progress" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/student/sessions/[bookingId]/live-location",
              params: { bookingId: booking.id },
            })
          }
          className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="map-marker-radius"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="text-[15px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            View live location
          </Text>
        </Pressable>
      ) : null}

      {status === "scheduled" ? (
        <View className="mt-7">
          <Text
            className="text-[18px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Change this lesson
          </Text>
          <Text
            className="mt-2 text-[12px] leading-5"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            Choose another available school slot or cancel and return the lesson
            to your package.
          </Text>
          {actionError ? (
            <Text
              className="mt-4 text-[13px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {actionError}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/student/sessions/[bookingId]/reschedule",
                params: { bookingId: booking.id },
              })
            }
            className="mt-5 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="calendar-sync"
              size={20}
              color={colors.onPrimary}
            />
            <Text
              className="text-[14px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Reschedule lesson
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCancellation(true)}
            className="mt-3 h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-70"
            style={{
              borderColor: colors.error,
              backgroundColor: colors.surface,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={20}
              color={colors.error}
            />
            <Text
              className="text-[14px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Cancel lesson
            </Text>
          </Pressable>
        </View>
      ) : null}

      <BookingCancellationModal
        visible={showCancellation}
        date={booking.date}
        time={booking.time}
        packageName={booking.packageName}
        submitting={cancelling}
        onDismiss={() => {
          if (!cancelling) setShowCancellation(false);
        }}
        onConfirm={() => void cancelLesson()}
      />
    </DashboardScreen>
  );
}
