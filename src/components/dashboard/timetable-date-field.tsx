import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function schoolTodayDateKey() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isTimetableDateKey(value: string) {
  if (!dateKeyPattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function monthDates(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const leadingDays =
    (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates: (string | null)[] = Array.from(
    { length: leadingDays },
    () => null,
  );
  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(`${monthKey}-${String(day).padStart(2, "0")}`);
  }
  while (dates.length % 7 !== 0) dates.push(null);
  return dates;
}

function moveMonth(monthKey: string, offset: number) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function displayDate(value: string) {
  if (!isTimetableDateKey(value)) return "Select date";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

type TimetableDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  optional?: boolean;
};

export function TimetableDateField({
  label,
  value,
  onChange,
  minDate,
  optional = false,
}: TimetableDateFieldProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [monthKey, setMonthKey] = useState(() =>
    schoolTodayDateKey().slice(0, 7),
  );
  const dates = useMemo(() => monthDates(monthKey), [monthKey]);
  const today = schoolTodayDateKey();
  const previousMonth = moveMonth(monthKey, -1);
  const previousDisabled = !!minDate && previousMonth < minDate.slice(0, 7);
  const monthLabel = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T12:00:00Z`));

  const open = () => {
    const initialDate =
      isTimetableDateKey(value) && (!minDate || value >= minDate)
        ? value
        : minDate && isTimetableDateKey(minDate)
          ? minDate
          : today;
    setMonthKey(initialDate.slice(0, 7));
    setVisible(true);
  };

  return (
    <>
      <View className="flex-1 gap-2">
        <Text
          className="text-[11px] uppercase tracking-[1px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {label}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? displayDate(value) : optional ? "No end date" : "Select date"}`}
          onPress={open}
          className="h-14 flex-row items-center gap-3 rounded-2xl border px-4 active:opacity-80"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={19}
            color={colors.textSubtle}
          />
          <Text
            className="flex-1 text-[14px]"
            style={{
              color: value ? colors.text : colors.textSubtle,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {value
              ? displayDate(value)
              : optional
                ? "No end date"
                : "Select date"}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.textSubtle}
          />
        </Pressable>
      </View>
      <Modal
        animationType="fade"
        onRequestClose={() => setVisible(false)}
        statusBarTranslucent
        transparent
        visible={visible}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close calendar"
            onPress={() => setVisible(false)}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(4, 19, 32, 0.58)" },
            ]}
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-[32px] px-5 pt-3"
            style={{
              backgroundColor: colors.background,
              alignSelf: "center",
              width: Math.min(width, 520),
              maxHeight: height * 0.88,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View
              className="h-1 w-12 self-center rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <View className="mt-4 flex-row items-center justify-between">
              <Text
                accessibilityRole="header"
                className="text-[22px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Choose {label.toLowerCase()}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close calendar"
                onPress={() => setVisible(false)}
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color={colors.text}
                />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 4 }}>
              <View className="mt-6 flex-row items-center justify-between">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  accessibilityState={{ disabled: previousDisabled }}
                  disabled={previousDisabled}
                  onPress={() => setMonthKey(previousMonth)}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={24}
                    color={previousDisabled ? colors.textFaint : colors.text}
                  />
                </Pressable>
                <Text
                  className="text-[17px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {monthLabel}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  onPress={() => setMonthKey(moveMonth(monthKey, 1))}
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.text}
                  />
                </Pressable>
              </View>
              <View className="mt-5 flex-row">
                {weekdays.map((day) => (
                  <Text
                    key={day}
                    className="text-center text-[11px]"
                    style={{
                      width: "14.2857%",
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>
              <View className="mt-2 flex-row flex-wrap">
                {dates.map((dateKey, index) => {
                  if (!dateKey)
                    return (
                      <View
                        key={`empty-${index}`}
                        style={{ width: "14.2857%", height: 46 }}
                      />
                    );
                  const disabled = !!minDate && dateKey < minDate;
                  const selected = dateKey === value;
                  const isToday = dateKey === today;
                  return (
                    <Pressable
                      key={dateKey}
                      accessibilityRole="button"
                      accessibilityLabel={displayDate(dateKey)}
                      accessibilityState={{ disabled, selected }}
                      disabled={disabled}
                      onPress={() => {
                        onChange(dateKey);
                        setVisible(false);
                      }}
                      className="h-[46px] items-center justify-center"
                      style={{ width: "14.2857%" }}
                    >
                      <View
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: selected
                            ? colors.primary
                            : "transparent",
                          borderWidth: isToday && !selected ? 1 : 0,
                          borderColor: colors.primary,
                        }}
                      >
                        <Text
                          className="text-[14px]"
                          style={{
                            color: selected
                              ? colors.onPrimary
                              : disabled
                                ? colors.textFaint
                                : colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {Number(dateKey.slice(-2))}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              {optional ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Clear end date"
                  onPress={() => {
                    onChange("");
                    setVisible(false);
                  }}
                  className="mt-4 h-12 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    className="text-[14px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    No end date
                  </Text>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
