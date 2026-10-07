import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  formatTimetableTime,
  minutesToTime,
  timeToMinutes,
} from "@/lib/school/timetable-time";

type TimetableTimeFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type Period = "AM" | "PM";

export function TimetableTimeField({
  label,
  value,
  onChange,
}: TimetableTimeFieldProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [hourText, setHourText] = useState("9");
  const [minuteText, setMinuteText] = useState("00");
  const [period, setPeriod] = useState<Period>("AM");
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const validTime =
    /^\d{1,2}$/.test(hourText) &&
    /^\d{1,2}$/.test(minuteText) &&
    hour >= 1 &&
    hour <= 12 &&
    minute >= 0 &&
    minute <= 59;
  const selectedTime = validTime
    ? minutesToTime(((hour % 12) + (period === "PM" ? 12 : 0)) * 60 + minute)
    : null;
  const displayedTime = selectedTime
    ? formatTimetableTime(selectedTime)
    : "Enter a valid time";

  const close = () => {
    Keyboard.dismiss();
    setVisible(false);
  };

  const open = () => {
    const selected = timeToMinutes(value) ?? 9 * 60;
    const selectedHour = Math.floor(selected / 60);
    setHourText(String(selectedHour % 12 || 12));
    setMinuteText(String(selected % 60).padStart(2, "0"));
    setPeriod(selectedHour < 12 ? "AM" : "PM");
    setVisible(true);
  };

  return (
    <>
      <View className="flex-1 gap-2">
        <Text
          className="text-[11px] uppercase tracking-[1px]"
          style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
        >
          {label}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${value ? formatTimetableTime(value) : "Select time"}`}
          onPress={open}
          className="h-14 flex-row items-center gap-2 rounded-2xl border px-3 active:opacity-80"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={19}
            color={colors.textSubtle}
          />
          <Text
            className="flex-1 text-[14px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
          >
            {value ? formatTimetableTime(value) : "Select"}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={18}
            color={colors.textSubtle}
          />
        </Pressable>
      </View>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ backgroundColor: "#00000080" }}
        >
          <Pressable
            accessibilityLabel="Close time picker"
            onPress={close}
            style={StyleSheet.absoluteFill}
          />
          <View
            className="rounded-t-[30px] px-5 pt-5"
            style={{
              backgroundColor: colors.surface,
              alignSelf: "center",
              width: "100%",
              maxWidth: 480,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[18px]"
                style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
              >
                Choose {label.toLowerCase()}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close time picker"
                onPress={close}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceMuted }}
              >
                <MaterialCommunityIcons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>
            <Text
              className="mb-5 mt-1 text-[12px]"
              style={{
                color: validTime ? colors.textMuted : colors.error,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {displayedTime}
            </Text>
            <View className="flex-row gap-3">
              {([
                ["Hour", hourText, setHourText],
                ["Minute", minuteText, setMinuteText],
              ] as const).map(([part, text, setText]) => (
                <View key={part} className="flex-1">
                  <Text
                    className="mb-2 text-center text-[11px] uppercase tracking-[1px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {part}
                  </Text>
                  <TextInput
                    accessibilityLabel={`${label} ${part.toLowerCase()}`}
                    value={text}
                    onChangeText={(next) => setText(next.replace(/\D/g, "").slice(0, 2))}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                    placeholder={part === "Hour" ? "HH" : "MM"}
                    placeholderTextColor={colors.textSubtle}
                    className="h-16 rounded-2xl border text-center text-[26px]"
                    style={{
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.border,
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  />
                </View>
              ))}
              <View style={{ width: 86 }}>
                <Text
                  className="mb-2 text-center text-[11px] uppercase tracking-[1px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Period
                </Text>
                <View className="h-16 flex-row overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
                  {(["AM", "PM"] as const).map((option) => {
                    const selected = period === option;
                    return (
                      <Pressable
                        key={option}
                        accessibilityRole="button"
                        accessibilityLabel={option}
                        accessibilityState={{ selected }}
                        onPress={() => setPeriod(option)}
                        className="flex-1 items-center justify-center"
                        style={{ backgroundColor: selected ? colors.primary : colors.surfaceMuted }}
                      >
                        <Text
                          className="text-[12px]"
                          style={{
                            color: selected ? colors.onPrimary : colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
            <Text
              className="mt-3 text-[11px]"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
            >
              Enter an hour from 1–12 and minutes from 00–59.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Use ${displayedTime} for ${label.toLowerCase()}`}
              accessibilityState={{ disabled: !validTime }}
              disabled={!validTime}
              onPress={() => {
                if (!selectedTime) return;
                onChange(selectedTime);
                close();
              }}
              className="mt-6 h-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: validTime ? colors.primary : colors.surfaceMuted }}
            >
              <Text
                className="text-[14px]"
                style={{
                  color: validTime ? colors.onPrimary : colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Use {validTime ? displayedTime : "time"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
