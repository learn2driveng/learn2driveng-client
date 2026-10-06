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

import { useAppTheme } from "@/hooks/use-app-theme";

type DateOption = { id: string; label: string };

type TimeOffCalendarSheetProps = {
  visible: boolean;
  options: readonly DateOption[];
  selectedDateIds: readonly string[];
  onSelect: (dateId: string) => void;
  onClose: () => void;
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthDates(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const leadingDays = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dates: (string | null)[] = Array.from({ length: leadingDays }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    dates.push(`${monthKey}-${String(day).padStart(2, "0")}`);
  }
  while (dates.length % 7 !== 0) dates.push(null);
  return dates;
}

export function TimeOffCalendarSheet({
  visible,
  options,
  selectedDateIds,
  onSelect,
  onClose,
}: TimeOffCalendarSheetProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [monthIndex, setMonthIndex] = useState(0);
  const monthKeys = useMemo(
    () => [...new Set(options.map((option) => option.id.slice(0, 7)))],
    [options],
  );
  const optionById = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );
  const selected = useMemo(() => new Set(selectedDateIds), [selectedDateIds]);
  const monthKey = monthKeys[monthIndex] ?? monthKeys[0];
  const dates = useMemo(
    () => (monthKey ? monthDates(monthKey) : []),
    [monthKey],
  );
  const monthLabel = monthKey
    ? new Intl.DateTimeFormat("en-NG", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${monthKey}-01T12:00:00.000Z`))
    : "No dates available";
  const maxDatesReached = selectedDateIds.length >= 90;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close calendar"
          onPress={onClose}
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
            maxHeight: height * 0.88,
            width: Math.min(width, 520),
            alignSelf: "center",
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          <View
            className="h-1 w-12 self-center rounded-full"
            style={{ backgroundColor: colors.border }}
          />
          <View className="mt-4 flex-row items-center gap-4">
            <Text
              accessibilityRole="header"
              className="flex-1 font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Add time off
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close calendar"
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons name="close" size={21} color={colors.text} />
            </Pressable>
          </View>
          <Text
            className="mt-1 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            Pick a date, then save your availability.
          </Text>

          <ScrollView className="mt-5" contentContainerStyle={{ paddingBottom: 4 }}>
            <View className="flex-row items-center justify-between">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                accessibilityState={{ disabled: monthIndex === 0 }}
                disabled={monthIndex === 0}
                onPress={() => setMonthIndex((index) => index - 1)}
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color={monthIndex === 0 ? colors.textFaint : colors.text}
                />
              </Pressable>
              <Text
                className="font-figtree-bold text-[17px]"
                style={{ color: colors.text }}
              >
                {monthLabel}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                accessibilityState={{ disabled: monthIndex >= monthKeys.length - 1 }}
                disabled={monthIndex >= monthKeys.length - 1}
                onPress={() => setMonthIndex((index) => index + 1)}
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={monthIndex >= monthKeys.length - 1 ? colors.textFaint : colors.text}
                />
              </Pressable>
            </View>

            <View className="mt-4 flex-row">
              {weekdays.map((day) => (
                <Text
                  key={day}
                  className="text-center font-figtree-semibold text-[11px]"
                  style={{ color: colors.textMuted, width: "14.2857%" }}
                >
                  {day}
                </Text>
              ))}
            </View>
            <View className="mt-2 flex-row flex-wrap">
              {dates.map((dateId, index) => {
                if (!dateId) {
                  return <View key={`empty-${index}`} style={{ width: "14.2857%", height: 46 }} />;
                }
                const option = optionById.get(dateId);
                const alreadyAdded = selected.has(dateId);
                const disabled = !option || alreadyAdded || maxDatesReached;

                return (
                  <Pressable
                    key={dateId}
                    accessibilityRole="button"
                    accessibilityLabel={`${option?.label ?? dateId}${alreadyAdded ? ", already added" : ""}`}
                    accessibilityState={{ disabled, selected: alreadyAdded }}
                    disabled={disabled}
                    onPress={() => onSelect(dateId)}
                    className="h-[46px] items-center justify-center active:opacity-70"
                    style={{ width: "14.2857%" }}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: alreadyAdded ? colors.primary : "transparent" }}
                    >
                      <Text
                        className="font-figtree-semibold text-[14px]"
                        style={{ color: alreadyAdded ? colors.onPrimary : disabled ? colors.textFaint : colors.text }}
                      >
                        {Number(dateId.slice(-2))}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {maxDatesReached ? (
              <Text
                className="mt-3 text-center font-figtree text-[12px]"
                style={{ color: colors.textMuted }}
              >
                You can save up to 90 time-off dates.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
