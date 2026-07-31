import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { BookingCancellationModal } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getBookingById } from "@/sample_data";
import type { LearnerLessonCard } from "@/types";

export default function BookingDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = getBookingById(bookingId);
  const [status, setStatus] = useState<LearnerLessonCard["status"]>(
    booking?.status ?? "cancelled",
  );
  const [showCancellationModal, setShowCancellationModal] = useState(false);

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

  const statusColor =
    status === "scheduled"
      ? colors.verified
      : status === "completed"
        ? colors.success
        : colors.error;
  const statusBackground =
    status === "scheduled"
      ? colors.verifiedSoft
      : status === "completed"
        ? colors.successSoft
        : colors.surfaceStrong;
  const details = [
    ["Driving school", booking.school],
    ["Package", booking.packageName],
    ["Instructor", booking.instructor],
    ["Location", booking.location],
    ["Booking reference", booking.reference],
  ];

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
              {status}
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

      {status === "scheduled" ? (
        <View className="mt-7 gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: "/student/sessions/[bookingId]/reschedule",
                params: { bookingId: booking.id },
              })
            }
            className="h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="calendar-sync-outline"
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
              Reschedule lesson
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCancellationModal(true)}
            className="h-14 items-center justify-center rounded-2xl border active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-[15px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Cancel booking
            </Text>
          </Pressable>
        </View>
      ) : null}

      {status === "cancelled" ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-7 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={23}
              color={colors.success}
            />
          </View>
          <Text
            className="mt-4 text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Booking cancelled
          </Text>
          <Text
            className="mt-2 text-[12px] leading-5"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            The school will apply its cancellation policy. Any eligible session
            credit will return to {booking.packageName}.
          </Text>
        </View>
      ) : null}

      <BookingCancellationModal
        visible={showCancellationModal}
        date={booking.date}
        time={booking.time}
        packageName={booking.packageName}
        onDismiss={() => setShowCancellationModal(false)}
        onConfirm={() => {
          setStatus("cancelled");
          setShowCancellationModal(false);
        }}
      />
    </DashboardScreen>
  );
}
