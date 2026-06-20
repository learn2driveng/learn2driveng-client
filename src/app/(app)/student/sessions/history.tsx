import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { BookingCard, learnerBookings } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { BookingStatus } from "@/types";

type HistoryFilter = "all" | BookingStatus;

const filters: { label: string; value: HistoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const bookings = learnerBookings.filter((booking) => filter === "all" || booking.status === filter);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Booking history" />
      <Text
        className="mt-4 text-[14px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Review upcoming lessons and your past booking activity.
      </Text>

      <View className="mt-6 flex-row flex-wrap gap-2">
        {filters.map((item) => {
          const selected = item.value === filter;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              className="rounded-full border px-4 py-2.5 active:opacity-70"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: selected ? colors.onPrimary : colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 gap-4">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={() =>
              router.push({
                pathname: "/student/sessions/[bookingId]",
                params: { bookingId: booking.id },
              })
            }
          />
        ))}
      </View>

      {bookings.length === 0 ? (
        <View
          className="mt-6 items-center rounded-3xl border px-6 py-12"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text
            className="text-[16px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            No bookings here
          </Text>
          <Text
            className="mt-2 text-center text-[13px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            Bookings matching this status will appear here.
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
