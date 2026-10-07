import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import {
  isTimetableDateKey,
  TimetableDateField,
} from "@/components/dashboard/timetable-date-field";
import { TimetableTimeField } from "@/components/dashboard/timetable-time-field";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSafeBack } from "@/lib/navigation/use-safe-back";
import {
  fetchRecurringTrainingSchedules,
  updateRecurringTrainingSchedule,
} from "@/lib/api/training-sessions";
import { useToast } from "@/components/common/toast";
import {
  durationBetweenTimes,
  endTimeForDuration,
  endsNextDay,
  formatTimetableDuration,
} from "@/lib/school/timetable-time";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, RecurringTrainingSchedule } from "@/types";

const days = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  number = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  number?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View className="gap-2">
      <Text
        className="text-[11px] uppercase tracking-[1px]"
        style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        keyboardType={number ? "number-pad" : "default"}
        className="h-14 rounded-2xl border px-4 text-[14px]"
        style={{
          color: colors.text,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          fontFamily: fontFamily.figtreeMedium,
        }}
      />
    </View>
  );
}

export default function EditTimetableScreen() {
  const { timetableId } = useLocalSearchParams<{ timetableId?: string }>();
  const goBack = useSafeBack("/school/operations/schedule/timetables");
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const [item, setItem] = useState<RecurringTrainingSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  const [notes, setNotes] = useState("");
  const instructors = useSchoolOperationsStore(
    (state) => state.instructors,
  ).filter((row) => row.status === "active");
  const vehicles = useSchoolOperationsStore((state) => state.vehicles).filter(
    (row) => row.isActive,
  );
  const packages = useSchoolOperationsStore((state) => state.packages).filter(
    (row) => row.isActive,
  );
  const [instructorId, setInstructorId] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [packageIds, setPackageIds] = useState<string[]>([]);
  const [picker, setPicker] = useState<
    "instructor" | "vehicle" | "package" | null
  >(null);
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    if (!timetableId) return;
    setError(null);
    try {
      const found =
        (await fetchRecurringTrainingSchedules()).find(
          (row) => row.id === timetableId,
        ) ?? null;
      setItem(found);
      if (found) {
        setTitle(found.title);
        setWeekdays(found.weekdays);
        setStartTime(found.startTime);
        setEndTime(endTimeForDuration(found.startTime, found.durationMinutes));
        setCapacity(String(found.capacity));
        setStartsOn(found.startsOn);
        setEndsOn(found.endsOn ?? "");
        setNotes(found.notes ?? "");
        setInstructorId(found.instructorId);
        setVehicleId(found.vehicleId ?? null);
        setPackageIds(found.eligiblePackageIds);
      }
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not load this timetable.",
      );
    } finally {
      setLoading(false);
    }
  }, [timetableId]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  const durationMinutes = durationBetweenTimes(startTime, endTime);
  const validDuration =
    durationMinutes !== null && durationMinutes >= 15 && durationMinutes <= 480;
  const canSave = useMemo(
    () =>
      title.trim().length >= 2 &&
      weekdays.length > 0 &&
      !!instructorId &&
      packageIds.length > 0 &&
      validDuration &&
      Number(capacity) > 0 &&
      isTimetableDateKey(startsOn) &&
      (!endsOn || (isTimetableDateKey(endsOn) && endsOn >= startsOn)),
    [
      title,
      weekdays.length,
      instructorId,
      packageIds.length,
      validDuration,
      capacity,
      startsOn,
      endsOn,
    ],
  );
  const save = async () => {
    if (!item || !canSave || saving || durationMinutes === null) return;
    setSaving(true);
    setError(null);
    try {
      await updateRecurringTrainingSchedule(item.id, {
        title: title.trim(),
        weekdays,
        startTime,
        durationMinutes,
        capacity: Number(capacity),
        startsOn,
        endsOn: endsOn.trim() || null,
        notes: notes.trim() || null,
        instructorId,
        vehicleId,
        eligiblePackageIds: packageIds,
      });
      showToast("Timetable updated.");
      goBack();
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not update this timetable.",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Edit timetable" />
        <View className="mt-10 items-center">
          <ActivityIndicator color={colors.primary} />
        </View>
      </DashboardScreen>
    );
  if (!item)
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Edit timetable" />
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-remove-outline"
            title="Timetable not found"
            description={error ?? "This timetable is no longer available."}
          />
        </View>
      </DashboardScreen>
    );
  const selectedInstructor = instructors.find((row) => row.id === instructorId);
  const selectedVehicle = vehicles.find((row) => row.id === vehicleId);
  const pickRow = (
    label: string,
    value: string,
    type: "instructor" | "vehicle" | "package",
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={() => {
        setQuery("");
        setPicker(type);
      }}
      className="mt-3 flex-row items-center rounded-2xl border px-4"
      style={{
        minHeight: 58,
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <Text
        className="flex-1 text-[14px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <Text
        numberOfLines={1}
        className="max-w-[55%] text-[12px]"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        {value}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.textSubtle}
      />
    </Pressable>
  );
  return (
    <DashboardScreen>
      <DashboardPageHeader title="Edit timetable" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Only future slots without learners will be replaced.
      </Text>
      <View className="mt-7 gap-5">
        <Field
          label="Name"
          value={title}
          onChangeText={setTitle}
          placeholder="Timetable name"
        />
        <View>
          <Text
            className="mb-3 text-[11px] uppercase tracking-[1px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Days
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {days.map((day) => {
              const selected = weekdays.includes(day.value);
              return (
                <Pressable
                  key={day.value}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={day.label}
                  onPress={() =>
                    setWeekdays((current) =>
                      selected
                        ? current.filter((value) => value !== day.value)
                        : [...current, day.value].sort(),
                    )
                  }
                  className="h-11 items-center justify-center rounded-full border px-4"
                  style={{
                    backgroundColor: selected
                      ? colors.verifiedSoft
                      : colors.surface,
                    borderColor: selected ? colors.verified : colors.border,
                  }}
                >
                  <Text
                    className="text-[12px]"
                    style={{
                      color: selected ? colors.verified : colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View className="flex-row gap-3">
          <TimetableTimeField
            label="Start time"
            value={startTime}
            onChange={setStartTime}
          />
          <TimetableTimeField
            label="End time"
            value={endTime}
            onChange={setEndTime}
          />
        </View>
        <Text
          className="text-[12px]"
          style={{
            color: validDuration ? colors.textMuted : colors.error,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          {validDuration
            ? `Lesson duration: ${formatTimetableDuration(durationMinutes)}${endsNextDay(startTime, endTime) ? " · Ends next day" : ""}`
            : "End time must be 15 minutes to 8 hours after start time."}
        </Text>
        <Field
          label="Capacity needed"
          value={capacity}
          onChangeText={setCapacity}
          placeholder="4"
          number
        />
        <TimetableDateField
          label="Starts on"
          value={startsOn}
          onChange={(date) => {
            setStartsOn(date);
            if (endsOn && endsOn < date) setEndsOn("");
          }}
        />
        <TimetableDateField
          label="Ends on"
          value={endsOn}
          minDate={startsOn}
          onChange={setEndsOn}
          optional
        />
        <View>
          <SectionHeader title="Team" />
          {pickRow(
            "Instructor",
            selectedInstructor?.name ?? "Choose instructor",
            "instructor",
          )}
          {pickRow(
            "Training car",
            selectedVehicle
              ? `${selectedVehicle.name} · ${selectedVehicle.plateNumber}`
              : "No car",
            "vehicle",
          )}
        </View>
        <View>
          <SectionHeader title="Packages" />
          {pickRow(
            "Available packages",
            packageIds.length
              ? `${packageIds.length} selected`
              : "Choose packages",
            "package",
          )}
        </View>
        <View>
          <SectionHeader title="Notes" />
          <View
            className="mt-3 rounded-3xl border p-4"
            style={{
              minHeight: 110,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <TextInput
              accessibilityLabel="Timetable notes"
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Optional note"
              placeholderTextColor={colors.textSubtle}
              className="flex-1 text-[14px]"
              style={{
                color: colors.text,
                fontFamily: fontFamily.figtreeMedium,
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>
      </View>
      {error ? (
        <Text
          className="mt-5 text-[13px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {error}
        </Text>
      ) : null}
      <Text
        className="mt-6 text-[12px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Changes to this timetable apply to future unbooked lessons only. Edit an
        already-booked lesson individually to change its details.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save timetable"
        accessibilityState={{ disabled: !canSave || saving }}
        disabled={!canSave || saving}
        onPress={() => void save()}
        className="mt-5 h-14 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: canSave ? colors.primary : colors.surfaceStrong,
        }}
      >
        {saving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text
            className="text-[15px]"
            style={{
              color: canSave ? colors.onPrimary : colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Save timetable
          </Text>
        )}
      </Pressable>
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(4,19,32,0.55)" }}
        >
          <View
            className="rounded-t-[32px] p-5"
            style={{
              minHeight: "55%",
              maxHeight: "82%",
              backgroundColor: colors.background,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[20px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Choose{" "}
                {picker === "instructor"
                  ? "instructor"
                  : picker === "vehicle"
                    ? "training car"
                    : "packages"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close picker"
                onPress={() => setPicker(null)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color={colors.text}
                />
              </Pressable>
            </View>
            <TextInput
              accessibilityLabel="Search picker options"
              value={query}
              onChangeText={setQuery}
              placeholder="Search"
              placeholderTextColor={colors.textSubtle}
              className="mt-5 h-12 rounded-2xl px-4 text-[14px]"
              style={{
                color: colors.text,
                backgroundColor: colors.surfaceStrong,
                fontFamily: fontFamily.figtreeMedium,
              }}
            />
            <ScrollView className="mt-4 flex-1">
              {picker === "instructor"
                ? instructors
                    .filter((row) =>
                      row.name.toLowerCase().includes(query.toLowerCase()),
                    )
                    .map((row) => (
                      <Pressable
                        key={row.id}
                        accessibilityRole="radio"
                        accessibilityState={{
                          selected: row.id === instructorId,
                        }}
                        accessibilityLabel={row.name}
                        onPress={() => {
                          setInstructorId(row.id);
                          setPicker(null);
                        }}
                        className="border-b py-4"
                        style={{ borderBottomColor: colors.border }}
                      >
                        <Text
                          className="text-[14px]"
                          style={{
                            color: colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {row.name}
                        </Text>
                      </Pressable>
                    ))
                : picker === "vehicle"
                  ? vehicles
                      .filter((row) =>
                        `${row.name} ${row.plateNumber}`
                          .toLowerCase()
                          .includes(query.toLowerCase()),
                      )
                      .map((row) => (
                        <Pressable
                          key={row.id}
                          accessibilityRole="radio"
                          accessibilityState={{
                            selected: row.id === vehicleId,
                          }}
                          accessibilityLabel={`${row.name}, ${row.plateNumber}`}
                          onPress={() => {
                            setVehicleId(row.id);
                            setPicker(null);
                          }}
                          className="border-b py-4"
                          style={{ borderBottomColor: colors.border }}
                        >
                          <Text
                            className="text-[14px]"
                            style={{
                              color: colors.text,
                              fontFamily: fontFamily.figtreeBold,
                            }}
                          >
                            {row.name} · {row.plateNumber}
                          </Text>
                        </Pressable>
                      ))
                  : packages
                      .filter((row) =>
                        row.name.toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((row) => {
                        const selected = packageIds.includes(row.id);
                        return (
                          <Pressable
                            key={row.id}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: selected }}
                            accessibilityLabel={row.name}
                            onPress={() =>
                              setPackageIds((current) =>
                                selected
                                  ? current.filter((id) => id !== row.id)
                                  : [...current, row.id],
                              )
                            }
                            className="flex-row items-center justify-between border-b py-4"
                            style={{ borderBottomColor: colors.border }}
                          >
                            <Text
                              className="text-[14px]"
                              style={{
                                color: colors.text,
                                fontFamily: fontFamily.figtreeBold,
                              }}
                            >
                              {row.name}
                            </Text>
                            <MaterialCommunityIcons
                              name={
                                selected ? "check-circle" : "circle-outline"
                              }
                              size={21}
                              color={
                                selected ? colors.success : colors.textSubtle
                              }
                            />
                          </Pressable>
                        );
                      })}
            </ScrollView>
            {picker === "package" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Apply selected packages"
                onPress={() => setPicker(null)}
                className="mt-4 h-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.onPrimary,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Apply
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </DashboardScreen>
  );
}
