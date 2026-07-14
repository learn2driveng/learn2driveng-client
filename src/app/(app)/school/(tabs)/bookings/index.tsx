import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { SchoolBookingAssignmentStatus } from "@/types";

const statusLabels: Record<SchoolBookingAssignmentStatus, string> = {
  unassigned: "Needs assignment",
  assigned: "Assigned",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

function formatSchedule(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

type BookingFilter = "needs_action" | "upcoming" | "all";

export default function SchoolBookingAssignmentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const bookings = useSchoolOperationsStore((state) => state.bookings);
  const [filter, setFilter] = useState<BookingFilter>("needs_action");
  const orderedBookings = [...bookings].sort((left, right) => {
    if (left.status === "cancelled" && right.status !== "cancelled") return 1;
    if (right.status === "cancelled" && left.status !== "cancelled") return -1;
    if (left.status === "unassigned" && right.status !== "unassigned")
      return -1;
    if (right.status === "unassigned" && left.status !== "unassigned") return 1;
    return (
      new Date(left.scheduledAt).getTime() -
      new Date(right.scheduledAt).getTime()
    );
  });
  const unassignedCount = bookings.filter(
    (booking) => booking.status === "unassigned",
  ).length;
  const displayedBookings = orderedBookings.filter((booking) => {
    if (filter === "needs_action") return booking.status === "unassigned";
    if (filter === "upcoming") return booking.status !== "cancelled";
    return true;
  });
  const filterOptions: Array<{ value: BookingFilter; label: string }> = [
    { value: "needs_action", label: `Needs action (${unassignedCount})` },
    {
      value: "upcoming",
      label: `Upcoming (${bookings.filter((item) => item.status !== "cancelled").length})`,
    },
    { value: "all", label: `All (${bookings.length})` },
  ];

  return (
    <DashboardScreen>
      <AppLogo height={52} className="mb-6" />
      <DashboardPageHeader title="Bookings" showBack={false} />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Match each lesson with an eligible instructor and active vehicle before
        confirming it for delivery.
      </Text>

      <View className="mt-7 flex-row gap-3">
        <View className="flex-1 rounded-3xl border p-4" style={surfaces.card}>
          <Text
            className="text-[24px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {bookings.length}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            upcoming lessons
          </Text>
        </View>
        <View
          className="flex-1 rounded-3xl border p-4"
          style={{
            backgroundColor: unassignedCount
              ? colors.verifiedSoft
              : colors.successSoft,
            borderColor: unassignedCount ? colors.verified : colors.success,
            ...surfaces.floating,
          }}
        >
          <Text
            className="text-[24px]"
            style={{
              color: unassignedCount ? colors.verified : colors.success,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {unassignedCount}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            need assignment
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Booking queue" />
        <View accessibilityRole="radiogroup" className="mt-4 flex-row gap-2">
          {filterOptions.map((option) => {
            const selected = filter === option.value;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => setFilter(option.value)}
                className="h-10 flex-1 items-center justify-center rounded-full border px-2 active:opacity-80"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  ...(selected ? surfaces.floating : {}),
                }}
              >
                <Text
                  numberOfLines={1}
                  className="text-[10px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader
          title={
            filter === "needs_action"
              ? "Needs assignment"
              : filter === "upcoming"
                ? "Upcoming lessons"
                : "All bookings"
          }
        />
        <View className="mt-4 gap-3">
          {displayedBookings.map((booking) => {
            const isConfirmed = booking.status === "confirmed";
            const needsAssignment = booking.status === "unassigned";
            const isCancelled = booking.status === "cancelled";

            return (
              <Pressable
                key={booking.id}
                accessibilityRole="button"
                accessibilityLabel={`Open assignment for ${booking.learnerName}`}
                onPress={() =>
                  router.push({
                    pathname: "/school/bookings/[bookingId]",
                    params: { bookingId: booking.id },
                  })
                }
                className="rounded-3xl border p-4 active:opacity-80"
                style={surfaces.card}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {booking.learnerInitials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {booking.learnerName}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      Lesson {booking.lessonNumber} of {booking.totalLessons} ·{" "}
                      {booking.transmission}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-2.5 py-1.5"
                    style={{
                      backgroundColor: isConfirmed
                        ? colors.successSoft
                        : isCancelled
                          ? colors.surfaceStrong
                          : needsAssignment
                            ? colors.verifiedSoft
                            : colors.surfaceStrong,
                    }}
                  >
                    <Text
                      className="text-[10px]"
                      style={{
                        color: isConfirmed
                          ? colors.success
                          : isCancelled
                            ? colors.error
                            : needsAssignment
                              ? colors.verified
                              : colors.textMuted,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {statusLabels[booking.status]}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text
                    className="text-[12px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {formatSchedule(booking.scheduledAt)}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center gap-2">
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text
                    className="flex-1 text-[12px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {booking.location}
                  </Text>
                </View>
              </Pressable>
            );
          })}
          {!displayedBookings.length ? (
            <ContentEmptyState
              icon="calendar-check-outline"
              title="Nothing needs attention"
              description="Assigned and confirmed lessons remain available under Upcoming or All."
            />
          ) : null}
        </View>
      </View>
    </DashboardScreen>
  );
}
