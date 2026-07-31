import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

import type { AuthDateOfBirthFieldProps } from "./auth-date-of-birth-field.types";

const MINIMUM_YEAR = 1900;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

type PickerStep = "year" | "month" | "day";

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function dateParts(date: Date): DateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function formatDate({ year, month, day }: DateParts) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const parsed = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  const date = new Date(parsed.year, parsed.month - 1, parsed.day, 12);

  return formatDate(dateParts(date)) === value ? parsed : null;
}

function defaultDateOfBirth() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return dateParts(date);
}

function displayDate(value: string) {
  const parsed = parseDate(value);
  if (!parsed) return "Select date";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(parsed.year, parsed.month - 1, parsed.day, 12));
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function isAfter(left: DateParts, right: DateParts) {
  return formatDate(left) > formatDate(right);
}

function normalizeDate(candidate: DateParts, maximum: DateParts): DateParts {
  const normalized = {
    year: Math.max(MINIMUM_YEAR, Math.min(candidate.year, maximum.year)),
    month: Math.max(1, Math.min(candidate.month, 12)),
    day: candidate.day,
  };
  normalized.day = Math.max(
    1,
    Math.min(normalized.day, daysInMonth(normalized.year, normalized.month)),
  );

  return isAfter(normalized, maximum) ? maximum : normalized;
}

export function AuthDateOfBirthField({
  value,
  onChange,
  label = "DATE OF BIRTH",
}: AuthDateOfBirthFieldProps) {
  const { colors } = useAppTheme();
  const maximumDate = dateParts(new Date());
  const selectedDate = parseDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<PickerStep>("year");
  const [draftDate, setDraftDate] = useState<DateParts>(
    selectedDate ?? defaultDateOfBirth(),
  );
  const years = useMemo(
    () =>
      Array.from(
        { length: maximumDate.year - MINIMUM_YEAR + 1 },
        (_, index) => maximumDate.year - index,
      ),
    [maximumDate.year],
  );
  const days = useMemo(
    () =>
      Array.from(
        { length: daysInMonth(draftDate.year, draftDate.month) },
        (_, index) => index + 1,
      ),
    [draftDate.month, draftDate.year],
  );

  const openPicker = () => {
    setDraftDate(selectedDate ?? defaultDateOfBirth());
    setStep("year");
    setIsOpen(true);
  };

  const selectYear = (year: number) => {
    setDraftDate((current) =>
      normalizeDate({ ...current, year }, maximumDate),
    );
    setStep("month");
  };

  const selectMonth = (month: number) => {
    setDraftDate((current) =>
      normalizeDate({ ...current, month }, maximumDate),
    );
    setStep("day");
  };

  const selectDay = (day: number) => {
    setDraftDate((current) =>
      normalizeDate({ ...current, day }, maximumDate),
    );
  };

  const confirmDate = () => {
    onChange(formatDate(draftDate));
    setIsOpen(false);
  };

  const isMonthDisabled = (month: number) =>
    draftDate.year === maximumDate.year && month > maximumDate.month;

  const isDayDisabled = (day: number) =>
    draftDate.year === maximumDate.year &&
    draftDate.month === maximumDate.month &&
    day > maximumDate.day;

  const selectorStyle = (selected: boolean) => ({
    backgroundColor: selected ? colors.primary : colors.surfaceStrong,
    borderColor: selected ? colors.primary : colors.border,
  });

  const selectorTextStyle = (selected: boolean) => ({
    color: selected ? colors.onPrimary : colors.text,
    fontFamily: selected ? fontFamily.figtreeBold : fontFamily.figtree,
  });

  return (
    <View>
      <Text
        className="mb-3 ml-1 font-figtree-bold text-[12px] tracking-[1.7px]"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${displayDate(value)}`}
        onPress={openPicker}
        className="h-16 flex-row items-center border px-5 active:opacity-70"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: borderRadius.button,
        }}
      >
        <MaterialCommunityIcons
          name="calendar"
          size={22}
          color={colors.textSubtle}
        />
        <Text
          className="ml-4 flex-1 text-[17px]"
          style={{
            color: selectedDate ? colors.text : colors.textFaint,
            fontFamily: fontFamily.regular,
          }}
        >
          {displayDate(value)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={colors.textSubtle}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close date picker"
            onPress={() => setIsOpen(false)}
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          />
          <View
            className="mx-4 mb-6 px-4 pb-5 pt-4"
            style={{ backgroundColor: colors.surface, borderRadius: 8 }}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text
                className="text-[17px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Select date of birth
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={12}
                onPress={() => setIsOpen(false)}
                className="h-10 w-10 items-center justify-center"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <View className="mb-4 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: step === "year" }}
                onPress={() => setStep("year")}
                className="h-14 flex-1 items-center justify-center border"
                style={{ ...selectorStyle(step === "year"), borderRadius: 6 }}
              >
                <Text
                  className="text-[11px]"
                  style={{
                    color:
                      step === "year" ? colors.onPrimary : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  YEAR
                </Text>
                <Text
                  className="mt-0.5 text-[16px]"
                  style={selectorTextStyle(step === "year")}
                >
                  {draftDate.year}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: step === "month" }}
                onPress={() => setStep("month")}
                className="h-14 flex-1 items-center justify-center border"
                style={{ ...selectorStyle(step === "month"), borderRadius: 6 }}
              >
                <Text
                  className="text-[11px]"
                  style={{
                    color:
                      step === "month" ? colors.onPrimary : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  MONTH
                </Text>
                <Text
                  className="mt-0.5 text-[16px]"
                  style={selectorTextStyle(step === "month")}
                >
                  {MONTHS[draftDate.month - 1].slice(0, 3)}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: step === "day" }}
                onPress={() => setStep("day")}
                className="h-14 flex-1 items-center justify-center border"
                style={{ ...selectorStyle(step === "day"), borderRadius: 6 }}
              >
                <Text
                  className="text-[11px]"
                  style={{
                    color: step === "day" ? colors.onPrimary : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  DAY
                </Text>
                <Text
                  className="mt-0.5 text-[16px]"
                  style={selectorTextStyle(step === "day")}
                >
                  {draftDate.day}
                </Text>
              </Pressable>
            </View>

            <View style={{ height: 286 }}>
              {step === "year" ? (
                <FlatList
                  data={years}
                  keyExtractor={(year) => String(year)}
                  numColumns={4}
                  initialScrollIndex={Math.max(
                    0,
                    years.indexOf(draftDate.year) - 8,
                  )}
                  getItemLayout={(_, index) => ({
                    length: 52,
                    offset: 52 * Math.floor(index / 4),
                    index,
                  })}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: year }) => {
                    const selected = year === draftDate.year;
                    return (
                      <View className="w-1/4 p-1">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          onPress={() => selectYear(year)}
                          className="h-11 items-center justify-center border"
                          style={{
                            ...selectorStyle(selected),
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            className="text-[15px]"
                            style={selectorTextStyle(selected)}
                          >
                            {year}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  }}
                />
              ) : null}

              {step === "month" ? (
                <View className="flex-row flex-wrap">
                  {MONTHS.map((monthName, index) => {
                    const month = index + 1;
                    const selected = month === draftDate.month;
                    const disabled = isMonthDisabled(month);
                    return (
                      <View key={monthName} className="w-1/3 p-1">
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled }}
                          disabled={disabled}
                          onPress={() => selectMonth(month)}
                          className="h-14 items-center justify-center border"
                          style={{
                            ...selectorStyle(selected),
                            borderRadius: 6,
                            opacity: disabled ? 0.35 : 1,
                          }}
                        >
                          <Text
                            className="text-[14px]"
                            style={selectorTextStyle(selected)}
                          >
                            {monthName.slice(0, 3)}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {step === "day" ? (
                <View className="flex-row flex-wrap">
                  {days.map((day) => {
                    const selected = day === draftDate.day;
                    const disabled = isDayDisabled(day);
                    return (
                      <View key={day} style={{ width: "14.2857%", padding: 3 }}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityState={{ selected, disabled }}
                          disabled={disabled}
                          onPress={() => selectDay(day)}
                          className="h-10 items-center justify-center border"
                          style={{
                            ...selectorStyle(selected),
                            borderRadius: 6,
                            opacity: disabled ? 0.35 : 1,
                          }}
                        >
                          <Text
                            className="text-[14px]"
                            style={selectorTextStyle(selected)}
                          >
                            {day}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOpen(false)}
                className="h-12 flex-1 items-center justify-center border"
                style={{ borderColor: colors.border, borderRadius: 6 }}
              >
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={confirmDate}
                className="h-12 flex-1 items-center justify-center"
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                }}
              >
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.onPrimary,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Confirm date
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
