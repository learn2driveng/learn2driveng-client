import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useToast } from "@/components/common/toast";
import {
  defaultWeeklyAvailability,
  formatTimeOffDate,
  instructorAvailabilityShifts,
  upcomingTimeOffOptions,
} from "@/features/instructor/availability-options";
import { TimeOffCalendarSheet } from "@/features/instructor/time-off-calendar-sheet";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchInstructorAvailability, updateInstructorAvailability } from "@/lib/api/instructor-availability";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

type PickerOption = {
  id: string;
  label: string;
  description: string;
};

export default function InstructorAvailabilityScreen() {
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const profile = useInstructorOperationsStore((state) => state.profile);
  const setAvailableToday = useInstructorOperationsStore(
    (state) => state.setAvailableToday,
  );
  const [acceptingAssignments, setAcceptingAssignments] = useState(
    profile.availableToday ?? true,
  );
  const [days, setDays] = useState(() =>
    defaultWeeklyAvailability.map((day) => ({ ...day })),
  );
  const [selectedShiftDayId, setSelectedShiftDayId] = useState<string | null>(
    null,
  );
  const [timeOffPickerVisible, setTimeOffPickerVisible] = useState(false);
  const [timeOffDateIds, setTimeOffDateIds] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const timeOffOptions = useMemo(() => upcomingTimeOffOptions(), []);
  const selectedShiftDay = days.find((day) => day.id === selectedShiftDayId);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const settings = await fetchInstructorAvailability();
      setAcceptingAssignments(settings.acceptingAssignments);
      setDays(defaultWeeklyAvailability.map((defaultDay) => ({
        ...defaultDay,
        ...(settings.weeklyHours.find((day) => day.id === defaultDay.id) ?? {}),
      })));
      const todayId = upcomingTimeOffOptions(1)[0]?.id;
      setTimeOffDateIds(
        settings.timeOffDates.filter((dateId) => !todayId || dateId >= todayId),
      );
      setAvailableToday(settings.acceptingAssignments);
      setSaved(false);
    } catch {
      setLoadError("We could not load your saved availability.");
    } finally {
      setLoading(false);
    }
  }, [setAvailableToday]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const settings = await updateInstructorAvailability({
        acceptingAssignments,
        weeklyHours: days.map(({ id, enabled, shiftId }) => ({ id, enabled, shiftId })),
        timeOffDates: timeOffDateIds,
      });
      setAvailableToday(settings.acceptingAssignments);
      setSaved(true);
      showToast("Availability saved.");
    } catch {
      showToast("Availability could not be saved. Please try again.", "error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const markDirty = () => setSaved(false);
  const updateDay = (dayId: string, update: Partial<(typeof days)[number]>) => {
    setDays((current) =>
      current.map((day) => (day.id === dayId ? { ...day, ...update } : day)),
    );
    markDirty();
  };

  if (loading || loadError) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Availability" showBack={false} />
        {loading ? (
          <ActivityIndicator className="mt-10" color={colors.primary} />
        ) : (
          <Pressable accessibilityRole="button" onPress={() => void load()} className="mt-8 rounded-2xl p-5" style={{ backgroundColor: colors.surface }}>
            <Text style={{ color: colors.error }}>{loadError} Tap to retry.</Text>
          </Pressable>
        )}
      </DashboardScreen>
    );
  }

  return (
    <>
      <DashboardScreen>
        <DashboardPageHeader title="Availability" showBack={false} />
        <Text
          className="mt-3 font-figtree text-[14px] leading-5"
          style={{ color: colors.textMuted }}
        >
          Tell your school when you can accept assigned lessons.
        </Text>

        <View
          className="mt-7 flex-row items-center rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: acceptingAssignments
                ? colors.successSoft
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name={
                acceptingAssignments
                  ? "calendar-check-outline"
                  : "calendar-remove-outline"
              }
              size={24}
              color={acceptingAssignments ? colors.success : colors.textSubtle}
            />
          </View>
          <View className="ml-4 flex-1">
            <Text
              className="font-figtree-bold text-[15px]"
              style={{ color: colors.text }}
            >
              Accepting assignments
            </Text>
            <Text
              className="mt-1 font-figtree text-[11px] leading-4"
              style={{ color: colors.textMuted }}
            >
              {acceptingAssignments
                ? "Your school can assign lessons within your available hours."
                : "New lesson assignments are paused."}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Accepting lesson assignments"
            accessibilityRole="switch"
            onValueChange={(value) => {
              setAcceptingAssignments(value);
              markDirty();
            }}
            thumbColor={colors.surface}
            trackColor={{
              false: colors.surfaceStrong,
              true: colors.success,
            }}
            value={acceptingAssignments}
          />
        </View>

        <View className="mt-9">
          <SectionHeader title="Weekly hours" />
          <Text
            className="mt-2 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            Choose the days and teaching shift you usually work.
          </Text>
          <View
            className="mt-4 overflow-hidden rounded-3xl border px-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {days.map((day, index) => {
              const shift =
                instructorAvailabilityShifts.find(
                  (item) => item.id === day.shiftId,
                ) ?? instructorAvailabilityShifts[0];

              return (
                <View
                  key={day.id}
                  className="py-4"
                  style={
                    index
                      ? {
                          borderTopWidth: 1,
                          borderTopColor: colors.border,
                        }
                      : undefined
                  }
                >
                  <View className="flex-row items-center">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.surfaceStrong }}
                    >
                      <Text
                        className="font-figtree-bold text-[11px]"
                        style={{ color: colors.text }}
                      >
                        {day.shortLabel}
                      </Text>
                    </View>
                    <View className="ml-3 flex-1">
                      <Text
                        className="font-figtree-bold text-[14px]"
                        style={{ color: colors.text }}
                      >
                        {day.label}
                      </Text>
                      <Text
                        className="mt-1 font-figtree text-[11px]"
                        style={{ color: colors.textMuted }}
                      >
                        {day.enabled ? "Available" : "Not available"}
                      </Text>
                    </View>
                    <Switch
                      accessibilityLabel={`${day.label} availability`}
                      accessibilityRole="switch"
                      onValueChange={(enabled) =>
                        updateDay(day.id, { enabled })
                      }
                      thumbColor={colors.surface}
                      trackColor={{
                        false: colors.surfaceStrong,
                        true: colors.primary,
                      }}
                      value={day.enabled}
                    />
                  </View>

                  {day.enabled && shift ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${day.label} working hours, ${shift.label}`}
                      accessibilityHint="Opens shift options"
                      onPress={() => setSelectedShiftDayId(day.id)}
                      className="mt-3 flex-row items-center rounded-2xl border px-4 py-3 active:opacity-75"
                      style={{
                        backgroundColor: colors.surfaceMuted,
                        borderColor: colors.border,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={19}
                        color={colors.primary}
                      />
                      <View className="ml-3 flex-1">
                        <Text
                          className="font-figtree-bold text-[13px]"
                          style={{ color: colors.text }}
                        >
                          {shift.label}
                        </Text>
                        <Text
                          className="mt-0.5 font-figtree text-[10px]"
                          style={{ color: colors.textMuted }}
                        >
                          {shift.description}
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={21}
                        color={colors.textSubtle}
                      />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-9">
          <SectionHeader
            title="Time off"
            actionLabel="Add date"
            onActionPress={() => setTimeOffPickerVisible(true)}
          />
          <Text
            className="mt-2 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            Block dates when you cannot accept lessons.
          </Text>

          {timeOffDateIds.length === 0 ? (
            <View
              className="mt-4 flex-row items-center rounded-3xl border p-5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="calendar-check-outline"
                  size={22}
                  color={colors.success}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="font-figtree-bold text-[14px]"
                  style={{ color: colors.text }}
                >
                  No time off added
                </Text>
                <Text
                  className="mt-1 font-figtree text-[11px]"
                  style={{ color: colors.textMuted }}
                >
                  Your weekly hours apply to all upcoming dates.
                </Text>
              </View>
            </View>
          ) : (
            <View className="mt-4 gap-2">
              {[...timeOffDateIds].sort().map((dateId) => {
                const dateLabel = formatTimeOffDate(dateId);
                return (
                  <View
                    key={dateId}
                    className="flex-row items-center rounded-2xl border p-4"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-remove-outline"
                      size={22}
                      color={colors.error}
                    />
                    <View className="ml-3 flex-1">
                      <Text
                        className="font-figtree-bold text-[13px]"
                        style={{ color: colors.text }}
                      >
                        {dateLabel}
                      </Text>
                      <Text
                        className="mt-1 font-figtree text-[10px]"
                        style={{ color: colors.textMuted }}
                      >
                        Unavailable · Full day
                      </Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remove time off on ${dateLabel}`}
                      hitSlop={8}
                      onPress={() => {
                        setTimeOffDateIds((current) =>
                          current.filter((item) => item !== dateId),
                        );
                        markDirty();
                      }}
                      className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color={colors.textSubtle}
                      />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {saved ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-7 flex-row items-center gap-3 rounded-2xl p-4"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={21}
              color={colors.success}
            />
            <Text
              className="flex-1 font-figtree-bold text-[12px]"
              style={{ color: colors.success }}
            >
              Availability saved
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: saved || saving, busy: saving }}
          disabled={saved || saving}
          onPress={() => void save()}
          className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{
            backgroundColor: saved ? colors.surfaceStrong : colors.primary,
          }}
        >
          {saving ? <ActivityIndicator color={colors.onPrimary} /> : (
            <MaterialCommunityIcons
              name={saved ? "check" : "content-save-outline"}
              size={20}
              color={saved ? colors.textSubtle : colors.onPrimary}
            />
          )}
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: saved ? colors.textSubtle : colors.onPrimary }}
          >
            {saving ? "Saving…" : saved ? "Availability saved" : "Save availability"}
          </Text>
        </Pressable>
      </DashboardScreen>

      <OptionSheet
        visible={selectedShiftDayId !== null}
        title={`Choose ${selectedShiftDay?.label ?? ""} hours`}
        description="Select the teaching shift you want for this day."
        options={instructorAvailabilityShifts}
        selectedId={selectedShiftDay?.shiftId}
        onClose={() => setSelectedShiftDayId(null)}
        onSelect={(shiftId) => {
          if (selectedShiftDayId) {
            updateDay(selectedShiftDayId, { shiftId });
          }
          setSelectedShiftDayId(null);
        }}
      />

      {timeOffPickerVisible ? (
        <TimeOffCalendarSheet
          visible
          options={timeOffOptions}
          selectedDateIds={timeOffDateIds}
          onClose={() => setTimeOffPickerVisible(false)}
          onSelect={(dateId) => {
            setTimeOffDateIds((current) => current.includes(dateId) ? current : [...current, dateId]);
            markDirty();
            setTimeOffPickerVisible(false);
          }}
        />
      ) : null}
    </>
  );
}

type OptionSheetProps = {
  visible: boolean;
  title: string;
  description: string;
  options: readonly PickerOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function OptionSheet({
  visible,
  title,
  description,
  options,
  selectedId,
  onSelect,
  onClose,
}: OptionSheetProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

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
          accessibilityLabel="Close options"
          onPress={onClose}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(4, 19, 32, 0.58)" },
          ]}
        />
        <View
          accessibilityViewIsModal
          className="rounded-t-[32px] px-6 pt-3"
          style={{
            backgroundColor: colors.background,
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
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close options"
              onPress={onClose}
              className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="close"
                size={21}
                color={colors.text}
              />
            </Pressable>
          </View>
          <Text
            className="mt-1 font-figtree text-[13px]"
            style={{ color: colors.textMuted }}
          >
            {description}
          </Text>
          <View className="mt-5 gap-2">
            {options.length > 0 ? (
              options.map((option) => {
                const selected = option.id === selectedId;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => onSelect(option.id)}
                    className="flex-row items-center rounded-2xl border p-4 active:opacity-75"
                    style={{
                      backgroundColor: selected
                        ? colors.surfaceStrong
                        : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <View className="flex-1">
                      <Text
                        className="font-figtree-bold text-[14px]"
                        style={{ color: colors.text }}
                      >
                        {option.label}
                      </Text>
                      <Text
                        className="mt-1 font-figtree text-[11px]"
                        style={{ color: colors.textMuted }}
                      >
                        {option.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={selected ? "check-circle" : "circle-outline"}
                      size={22}
                      color={selected ? colors.primary : colors.textSubtle}
                    />
                  </Pressable>
                );
              })
            ) : (
              <Text
                className="py-8 text-center font-figtree text-[13px]"
                style={{ color: colors.textMuted }}
              >
                All available dates have already been added.
              </Text>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
