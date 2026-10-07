import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { TrainingSession } from "@/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SCHOOL_TIME_ZONE = "Africa/Lagos";
const schoolDateParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: SCHOOL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function schoolLessonDateKey(value: Date | string) {
  const parts = schoolDateParts.formatToParts(
    typeof value === "string" ? new Date(value) : value,
  );
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function formatSchoolLessonDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
}

export function formatSchoolLessonTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: SCHOOL_TIME_ZONE,
  }).format(new Date(value));
}

function monthLabel(monthKey: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T12:00:00.000Z`));
}

function moveMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthDays(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const leading = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: (string | null)[] = Array.from({ length: leading }, () => null);

  for (let day = 1; day <= count; day += 1) {
    days.push(`${monthKey}-${String(day).padStart(2, "0")}`);
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

type SchoolLessonCalendarProps = {
  todayKey: string;
  selectedDay: string;
  sessionsByDay: Map<string, TrainingSession[]>;
  onSelectDay: (dateKey: string) => void;
};

export function SchoolLessonCalendar({
  todayKey,
  selectedDay,
  sessionsByDay,
  onSelectDay,
}: SchoolLessonCalendarProps) {
  const { colors } = useAppTheme();
  const [visibleMonth, setVisibleMonth] = useState(selectedDay.slice(0, 7));
  const days = useMemo(() => monthDays(visibleMonth), [visibleMonth]);

  const navigateMonth = (offset: number) => {
    const nextMonth = moveMonth(visibleMonth, offset);
    setVisibleMonth(nextMonth);
    onSelectDay(
      nextMonth === todayKey.slice(0, 7) ? todayKey : `${nextMonth}-01`,
    );
  };

  const returnToToday = () => {
    setVisibleMonth(todayKey.slice(0, 7));
    onSelectDay(todayKey);
  };

  return (
    <View
      className="mt-4 rounded-[28px] border px-3 pb-4 pt-3"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => navigateMonth(-1)}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={colors.text}
          />
        </Pressable>
        <Text
          accessibilityRole="header"
          className="text-[17px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {monthLabel(visibleMonth)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => navigateMonth(1)}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.text}
          />
        </Pressable>
      </View>

      <View className="mt-4 flex-row">
        {WEEKDAYS.map((weekday) => (
          <Text
            key={weekday}
            className="text-center text-[11px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeSemibold,
              width: "14.2857%",
            }}
          >
            {weekday}
          </Text>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap">
        {days.map((dateKey, index) => {
          if (!dateKey) {
            return (
              <View
                key={`empty-${index}`}
                style={{ width: "14.2857%", height: 54 }}
              />
            );
          }

          const daySessions = sessionsByDay.get(dateKey) ?? [];
          const selected = dateKey === selectedDay;
          const today = dateKey === todayKey;
          const hasUpcoming = daySessions.some(
            (session) =>
              session.status === "in_progress" ||
              (session.status === "scheduled" &&
                new Date(session.scheduledEndTime).getTime() > Date.now()),
          );

          return (
            <View key={dateKey} className="p-0.5" style={{ width: "14.2857%" }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${formatSchoolLessonDate(dateKey)}, ${daySessions.length} lesson${daySessions.length === 1 ? "" : "s"}`}
                accessibilityState={{ selected }}
                onPress={() => onSelectDay(dateKey)}
                className="h-[50px] items-center justify-center rounded-2xl active:opacity-70"
                style={{
                  backgroundColor: selected ? colors.primary : "transparent",
                  borderColor: today ? colors.primary : "transparent",
                  borderWidth: today && !selected ? 1 : 0,
                }}
              >
                <Text
                  className="text-[14px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.text,
                    fontFamily:
                      today || selected
                        ? fontFamily.figtreeBold
                        : fontFamily.figtreeMedium,
                  }}
                >
                  {Number(dateKey.slice(-2))}
                </Text>
                {daySessions.length > 0 ? (
                  <View className="mt-0.5 flex-row items-center gap-1">
                    <View
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: selected
                          ? colors.onPrimary
                          : hasUpcoming
                            ? colors.primary
                            : colors.textSubtle,
                      }}
                    />
                    {daySessions.length > 1 ? (
                      <Text
                        className="text-[10px]"
                        style={{
                          color: selected ? colors.onPrimary : colors.textMuted,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {daySessions.length}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>

      <View
        className="mt-3 flex-row items-center justify-between border-t pt-3"
        style={{ borderColor: colors.border }}
      >
        <Text
          className="text-[11px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Times shown in West Africa Time
        </Text>
        {visibleMonth !== todayKey.slice(0, 7) || selectedDay !== todayKey ? (
          <Pressable
            accessibilityRole="button"
            onPress={returnToToday}
            className="rounded-full px-3 py-2 active:opacity-70"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <Text
              className="text-[11px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              Today
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
