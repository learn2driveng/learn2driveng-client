import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getBookingById } from "@/sample_data";
import { rescheduleAvailability } from "@/sample_data/session-availability";

const initialDate =
  rescheduleAvailability.find((date) => date.times.length > 0) ??
  rescheduleAvailability[0];

export default function RescheduleBookingScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = getBookingById(bookingId);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(
    initialDate?.id ?? null,
  );
  const selectedDate = rescheduleAvailability.find(
    (date) => date.id === selectedDateId,
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(
    initialDate?.times[0] ?? null,
  );
  const [complete, setComplete] = useState(false);
  const hasDates = rescheduleAvailability.length > 0;
  const hasTimes = Boolean(selectedDate?.times.length);
  const canReschedule = Boolean(selectedDate && selectedTime && hasTimes);

  const selectDate = (dateId: string) => {
    const date = rescheduleAvailability.find((item) => item.id === dateId);
    setSelectedDateId(dateId);
    setSelectedTime(date?.times[0] ?? null);
  };

  if (!booking) return null;

  if (complete) {
    return (
      <DashboardScreen>
        <View className="items-center pt-12">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.successSoft }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons
                name="calendar-check"
                size={32}
                color={colors.contrastText}
              />
            </View>
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            className="mt-7 text-center text-[28px] leading-9"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Lesson rescheduled
          </Text>
          <Text
            className="mt-3 text-center text-[14px] leading-6"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            Your lesson is now booked for {selectedDate?.label} at{" "}
            {selectedTime}.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace({
              pathname: "/student/sessions/[bookingId]",
              params: { bookingId: booking.id },
            })
          }
          className="mt-10 h-14 items-center justify-center rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Back to booking details
          </Text>
        </Pressable>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Reschedule" />
      <Text
        className="mt-4 text-[14px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Choose a new available date and time for this lesson.
      </Text>

      <View
        className="mt-6 flex-row items-center gap-3 rounded-2xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <MaterialCommunityIcons
          name="calendar-clock"
          size={22}
          color={colors.primary}
        />
        <View className="flex-1">
          <Text
            className="text-[10px] uppercase tracking-[0.8px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Current booking
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{
              color: colors.text,
              fontFamily: fontFamily.figtreeSemibold,
            }}
          >
            {booking.date} · {booking.time}
          </Text>
        </View>
      </View>

      {!hasDates ? (
        <View className="mt-8">
          <DashboardEmptyState
            icon="calendar-remove-outline"
            title="No dates available"
            description="There are no alternative lesson dates available for this booking right now."
            actionLabel="Back to booking"
            onActionPress={() => router.back()}
          />
        </View>
      ) : (
        <>
          <Text
            className="mb-3 mt-8 text-[11px] uppercase tracking-[1.1px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            New date
          </Text>
          <View className="flex-row gap-3">
            {rescheduleAvailability.map((date) => {
              const selected = selectedDateId === date.id;
              const availabilityLabel = date.times.length
                ? `${date.times.length} times available`
                : "No times available";

              return (
                <Pressable
                  key={date.id}
                  accessibilityRole="radio"
                  accessibilityLabel={`${date.label}. ${availabilityLabel}`}
                  accessibilityState={{ selected }}
                  onPress={() => selectDate(date.id)}
                  className="h-14 flex-1 items-center justify-center rounded-2xl border-2 active:opacity-70"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: date.times.length
                        ? colors.text
                        : colors.textSubtle,
                      fontFamily: fontFamily.figtreeSemibold,
                    }}
                  >
                    {date.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text
            className="mb-3 mt-8 text-[11px] uppercase tracking-[1.1px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            New time
          </Text>
          {hasTimes ? (
            <View className="flex-row flex-wrap gap-3">
              {selectedDate?.times.map((time) => {
                const selected = selectedTime === time;

                return (
                  <Pressable
                    key={time}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedTime(time)}
                    className="h-12 w-[47%] items-center justify-center rounded-2xl border-2 active:opacity-70"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeSemibold,
                      }}
                    >
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View
              accessibilityLiveRegion="polite"
              className="flex-row items-start gap-3 rounded-2xl border p-4"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <MaterialCommunityIcons
                name="clock-alert-outline"
                size={22}
                color={colors.textSubtle}
              />
              <View className="flex-1">
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  No times available
                </Text>
                <Text
                  className="mt-1 text-[13px] leading-5"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtree,
                  }}
                >
                  Choose another date to see its available lesson times.
                </Text>
              </View>
            </View>
          )}
        </>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canReschedule }}
        disabled={!canReschedule}
        onPress={() => setComplete(true)}
        className="mt-9 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor: canReschedule
            ? colors.primary
            : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: canReschedule ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Confirm new schedule
        </Text>
        <MaterialCommunityIcons
          name="check"
          size={20}
          color={canReschedule ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
