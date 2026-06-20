import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { getBookingById } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";

const dateOptions = ["Thu 27", "Fri 28", "Sat 29"] as const;
const timeOptions = ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] as const;

export default function RescheduleBookingScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = getBookingById(bookingId);
  const [selectedDate, setSelectedDate] = useState<(typeof dateOptions)[number]>("Thu 27");
  const [selectedTime, setSelectedTime] = useState<(typeof timeOptions)[number]>("11:30 AM");
  const [complete, setComplete] = useState(false);

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
              <MaterialCommunityIcons name="calendar-check" size={32} color={colors.contrastText} />
            </View>
          </View>
          <Text
            className="mt-7 text-center text-[28px] leading-9"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Lesson rescheduled
          </Text>
          <Text
            className="mt-3 text-center text-[14px] leading-6"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
          >
            Your lesson is now booked for {selectedDate} at {selectedTime}.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace({ pathname: "/student/sessions/[bookingId]", params: { bookingId: booking.id } })}
          className="mt-10 h-14 items-center justify-center rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>
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
        <MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary} />
        <View className="flex-1">
          <Text
            className="text-[10px] uppercase tracking-[0.8px]"
            style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
          >
            Current booking
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}
          >
            {booking.date} · {booking.time}
          </Text>
        </View>
      </View>

      <Text
        className="mb-3 mt-8 text-[11px] uppercase tracking-[1.1px]"
        style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
      >
        New date
      </Text>
      <View className="flex-row gap-3">
        {dateOptions.map((date) => {
          const selected = selectedDate === date;
          return (
            <Pressable
              key={date}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setSelectedDate(date)}
              className="h-14 flex-1 items-center justify-center rounded-2xl border-2 active:opacity-70"
              style={{
                backgroundColor: colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}>{date}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        className="mb-3 mt-8 text-[11px] uppercase tracking-[1.1px]"
        style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
      >
        New time
      </Text>
      <View className="flex-row flex-wrap gap-3">
        {timeOptions.map((time) => {
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
              <Text style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}>{time}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => setComplete(true)}
        className="mt-9 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <Text
          className="text-[15px]"
          style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
        >
          Confirm new schedule
        </Text>
        <MaterialCommunityIcons name="check" size={20} color={colors.onPrimary} />
      </Pressable>
    </DashboardScreen>
  );
}
