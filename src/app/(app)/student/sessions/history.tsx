import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { BookingCard } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import type { LearnerLessonCard } from "@/types";

type HistoryFilter = "all" | LearnerLessonCard["status"];

const filters: { label: string; value: HistoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "scheduled" },
  { label: "Live", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Missed", value: "missed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function BookingHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const lessonCards = useLearnerSessionsStore((state) => state.lessonCards);
  const bookings = lessonCards.filter(
    (booking) => filter === "all" || booking.status === filter,
  );
  const header = (
    <>
      <DashboardPageHeader title="Booking history" />
      <Text
        className="mt-4 text-[14px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Review upcoming lessons and your past booking activity.
      </Text>
    </>
  );

  if (lessonCards.length === 0) {
    return (
      <DashboardScreen>
        {header}
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-blank-outline"
            title="No booking history yet"
            description="Your upcoming and completed lessons will appear here after you book a session."
            actionLabel="Book a session"
            onActionPress={() => router.replace("/student/sessions")}
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      {header}

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
        <View className="mt-6">
          <ContentEmptyState
            icon="filter-remove-outline"
            title="No matching bookings"
            description="There are no bookings with this status."
            actionLabel="Show all bookings"
            onActionPress={() => setFilter("all")}
          />
        </View>
      ) : null}
    </DashboardScreen>
  );
}
