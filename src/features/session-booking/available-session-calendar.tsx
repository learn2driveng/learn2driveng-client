import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

export type AvailableCalendarDate = {
  id: string;
  label: string;
  sessionCount: number;
};

type AvailableSessionCalendarProps = {
  dates: AvailableCalendarDate[];
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateFromId(dateId: string) {
  return new Date(`${dateId}T12:00:00`);
}

function monthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function dateId(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function AvailableSessionCalendar({
  dates,
  selectedDateId,
  onSelectDate,
}: AvailableSessionCalendarProps) {
  const { colors } = useAppTheme();
  const selectedDate = dateFromId(selectedDateId);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );
  const availability = useMemo(
    () => new Map(dates.map((date) => [date.id, date])),
    [dates],
  );
  const availableMonths = [
    ...new Set(dates.map((date) => monthIndex(dateFromId(date.id)))),
  ].sort((a, b) => a - b);
  const currentMonthIndex = monthIndex(visibleMonth);
  const previousMonth = [...availableMonths]
    .reverse()
    .find((item) => item < currentMonthIndex);
  const nextMonth = availableMonths.find((item) => item > currentMonthIndex);
  const canGoBack = previousMonth !== undefined;
  const canGoForward = nextMonth !== undefined;
  const firstDayOffset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from(
    { length: Math.ceil((firstDayOffset + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - firstDayOffset + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    },
  );
  const monthLabel = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);

  const moveMonth = (targetMonth: number | undefined) => {
    if (targetMonth === undefined) return;
    setVisibleMonth(
      new Date(Math.floor(targetMonth / 12), targetMonth % 12, 1),
    );
  };

  return (
    <View
      className="rounded-3xl border p-4"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-center justify-between">
        <CalendarArrow
          direction="left"
          disabled={!canGoBack}
          onPress={() => moveMonth(previousMonth)}
        />
        <Text
          accessibilityRole="header"
          className="text-[17px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {monthLabel}
        </Text>
        <CalendarArrow
          direction="right"
          disabled={!canGoForward}
          onPress={() => moveMonth(nextMonth)}
        />
      </View>

      <View className="mt-5 flex-row">
        {weekdayLabels.map((label) => (
          <Text
            key={label}
            className="flex-1 text-center text-[10px] uppercase"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {label}
          </Text>
        ))}
      </View>

      <View className="mt-2 flex-row flex-wrap">
        {cells.map((day, index) => {
          if (day === null) {
            return (
              <View key={`empty-${index}`} style={{ width: "14.2857%" }} />
            );
          }

          const id = dateId(
            visibleMonth.getFullYear(),
            visibleMonth.getMonth(),
            day,
          );
          const availableDate = availability.get(id);
          const enabled = Boolean(availableDate);
          const selected = selectedDateId === id;

          return (
            <View
              key={id}
              className="items-center py-1"
              style={{ width: "14.2857%" }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  availableDate
                    ? `${availableDate.label}, ${availableDate.sessionCount} available ${availableDate.sessionCount === 1 ? "session" : "sessions"}`
                    : `${day}, unavailable`
                }
                accessibilityState={{ disabled: !enabled, selected }}
                disabled={!enabled}
                onPress={() => onSelectDate(id)}
                className="h-10 w-10 items-center justify-center rounded-full active:opacity-75"
                style={{
                  backgroundColor: selected
                    ? colors.primary
                    : enabled
                      ? colors.surfaceStrong
                      : "transparent",
                }}
              >
                <Text
                  className="text-[13px]"
                  style={{
                    color: selected
                      ? colors.onPrimary
                      : enabled
                        ? colors.text
                        : colors.textSubtle,
                    fontFamily: enabled
                      ? fontFamily.figtreeBold
                      : fontFamily.figtree,
                    opacity: enabled ? 1 : 0.45,
                  }}
                >
                  {day}
                </Text>
                {enabled && !selected ? (
                  <View
                    className="absolute bottom-1 h-1 w-1 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>

      <View className="mt-3 flex-row items-center justify-center gap-2">
        <View
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
        <Text
          className="text-[11px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Dates with available sessions
        </Text>
      </View>
    </View>
  );
}

function CalendarArrow({
  direction,
  disabled,
  onPress,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${direction === "left" ? "Previous" : "Next"} month`}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
      style={{
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <MaterialCommunityIcons
        name={`chevron-${direction}`}
        size={22}
        color={colors.text}
      />
    </Pressable>
  );
}
