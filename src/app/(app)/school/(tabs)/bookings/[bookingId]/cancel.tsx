import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

const reasons = [
  "Instructor unavailable",
  "Vehicle unavailable",
  "School closure",
  "Learner request",
];

export default function SchoolBookingCancelScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useSchoolOperationsStore((state) =>
    state.bookings.find((item) => item.id === bookingId),
  );
  const cancelBooking = useSchoolOperationsStore(
    (state) => state.cancelBooking,
  );
  const [reason, setReason] = useState<string | null>(null);

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Cancel lesson" />
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-remove"
            title="Booking not found"
            description="This lesson is no longer available."
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Cancel lesson" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Cancelling removes this lesson from instructor and vehicle operations.
        Select a reason for the learner record.
      </Text>
      <View className="mt-7 gap-3">
        {reasons.map((item) => {
          const selected = item === reason;
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setReason(item)}
              className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
              style={{
                backgroundColor: selected
                  ? colors.surfaceStrong
                  : colors.surface,
                borderColor: selected ? colors.error : colors.border,
              }}
            >
              <MaterialCommunityIcons
                name={selected ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={selected ? colors.error : colors.textSubtle}
              />
              <Text
                className="flex-1 text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !reason }}
        disabled={!reason}
        onPress={() => {
          if (!reason) return;
          cancelBooking(booking.id, reason);
          router.dismissTo({
            pathname: "/school/bookings/[bookingId]",
            params: { bookingId: booking.id },
          });
        }}
        className="mt-8 h-14 items-center justify-center rounded-full border active:opacity-80"
        style={{
          backgroundColor: colors.surface,
          borderColor: reason ? colors.error : colors.border,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: reason ? colors.error : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Cancel this lesson
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}
