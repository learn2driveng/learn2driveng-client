import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

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

export function TimetableTimeField({
  label,
  value,
  onChange,
}: TimetableTimeFieldProps) {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const hourScroll = useRef<ScrollView>(null);
  const minuteScroll = useRef<ScrollView>(null);
  const displayedTime = formatTimetableTime(minutesToTime(hour * 60 + minute));

  const scrollToSelectedTime = useCallback(() => {
    hourScroll.current?.scrollTo({
      y: Math.max(0, (hour % 12 || 12) - 3) * 44,
      animated: false,
    });
    minuteScroll.current?.scrollTo({
      y: Math.max(0, minute - 2) * 44,
      animated: false,
    });
  }, [hour, minute]);

  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(scrollToSelectedTime);
    return () => cancelAnimationFrame(frame);
  }, [visible, scrollToSelectedTime]);

  const open = () => {
    const selected = timeToMinutes(value) ?? 9 * 60;
    setHour(Math.floor(selected / 60));
    setMinute(selected % 60);
    setVisible(true);
  };

  const choiceColumn = (kind: "hour" | "minute") => {
    const count = kind === "hour" ? 12 : 60;
    const selected = kind === "hour" ? (hour % 12 || 12) - 1 : minute;
    return (
      <View className="flex-1">
        <Text
          className="mb-2 text-center text-[11px] uppercase tracking-[1px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {kind === "hour" ? "Hour" : "Minute"}
        </Text>
        <ScrollView
          key={`${kind}-${visible}-${value}`}
          ref={kind === "hour" ? hourScroll : minuteScroll}
          style={{ height: 220 }}
          showsVerticalScrollIndicator
        >
          {Array.from({ length: count }, (_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${kind === "hour" ? "Hour" : "Minute"} ${kind === "hour" ? index + 1 : String(index).padStart(2, "0")}`}
              accessibilityState={{ selected: selected === index }}
              onPress={() =>
                kind === "hour"
                  ? setHour((hour >= 12 ? 12 : 0) + ((index + 1) % 12))
                  : setMinute(index)
              }
              className="mb-1 h-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  selected === index ? colors.primary : colors.surfaceMuted,
              }}
            >
              <Text
                className="text-[15px]"
                style={{
                  color: selected === index ? colors.onPrimary : colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {kind === "hour" ? index + 1 : String(index).padStart(2, "0")}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
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
          accessibilityLabel={`${label}: ${value ? formatTimetableTime(value) : "Select time"}`}
          onPress={open}
          className="h-14 flex-row items-center gap-2 rounded-2xl border px-3 active:opacity-80"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
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
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        onShow={scrollToSelectedTime}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "#00000080" }}
        >
          <Pressable
            accessibilityLabel="Close time picker"
            onPress={() => setVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View
            className="rounded-t-[30px] px-5 pb-8 pt-5"
            style={{
              backgroundColor: colors.surface,
              alignSelf: "center",
              width: "100%",
              maxWidth: 480,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[18px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Choose {label.toLowerCase()}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close time picker"
                onPress={() => setVisible(false)}
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceMuted }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={colors.text}
                />
              </Pressable>
            </View>
            <Text
              className="mb-5 mt-1 text-[12px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {displayedTime}
            </Text>
            <View className="flex-row gap-3">
              {choiceColumn("hour")}
              {choiceColumn("minute")}
              <View style={{ width: 68 }}>
                <Text
                  className="mb-2 text-center text-[11px] uppercase tracking-[1px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Period
                </Text>
                {(["AM", "PM"] as const).map((period) => {
                  const selected = (hour < 12 ? "AM" : "PM") === period;
                  return (
                    <Pressable
                      key={period}
                      accessibilityRole="button"
                      accessibilityLabel={period}
                      accessibilityState={{ selected }}
                      onPress={() =>
                        setHour((hour % 12) + (period === "PM" ? 12 : 0))
                      }
                      className="mb-1 h-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surfaceMuted,
                      }}
                    >
                      <Text
                        className="text-[13px]"
                        style={{
                          color: selected ? colors.onPrimary : colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {period}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Use ${displayedTime} for ${label.toLowerCase()}`}
              onPress={() => {
                onChange(minutesToTime(hour * 60 + minute));
                setVisible(false);
              }}
              className="mt-6 h-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[14px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Use {displayedTime}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
