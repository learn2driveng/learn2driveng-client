import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { schoolRescheduleSlots } from "@/sample_data";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolBookingRescheduleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useSchoolOperationsStore((state) =>
    state.bookings.find((item) => item.id === bookingId),
  );
  const rescheduleBooking = useSchoolOperationsStore(
    (state) => state.rescheduleBooking,
  );
  const [slotId, setSlotId] = useState<string | null>(null);
  const selectedSlot = schoolRescheduleSlots.find((slot) => slot.id === slotId);

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Reschedule" />
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
      <DashboardPageHeader title="Reschedule lesson" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Choose a new available time for {booking.learnerName}. The existing
        instructor and vehicle remain selected but require confirmation again.
      </Text>

      <View className="mt-7 gap-3">
        {schoolRescheduleSlots.map((slot) => {
          const selected = slot.id === slotId;
          return (
            <Pressable
              key={slot.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setSlotId(slot.id)}
              className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
              style={{
                backgroundColor: selected
                  ? colors.verifiedSoft
                  : colors.surface,
                borderColor: selected ? colors.verified : colors.border,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={22}
                color={selected ? colors.verified : colors.textMuted}
              />
              <Text
                className="flex-1 text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {slot.label}
              </Text>
              <MaterialCommunityIcons
                name={selected ? "radiobox-marked" : "radiobox-blank"}
                size={22}
                color={selected ? colors.verified : colors.textSubtle}
              />
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !selectedSlot }}
        disabled={!selectedSlot}
        onPress={() => {
          if (!selectedSlot) return;
          rescheduleBooking(booking.id, selectedSlot.scheduledAt);
          router.back();
        }}
        className="mt-8 h-14 items-center justify-center rounded-full active:opacity-80"
        style={{
          backgroundColor: selectedSlot ? colors.primary : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: selectedSlot ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Confirm new time
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}
