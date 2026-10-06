import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { useToast } from "@/components/common/toast";
import { TimetableDateField } from "@/components/dashboard/timetable-date-field";
import { TimetableTimeField } from "@/components/dashboard/timetable-time-field";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchSchoolTrainingSession,
  updateSchoolTrainingSession,
} from "@/lib/api/training-sessions";
import type { UpdateSchoolTrainingSessionInput } from "@/lib/api/training-sessions";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, TrainingSession } from "@/types";

function localFields(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}-${part("month")}-${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
}

function watDate(date: string, time: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    return null;
  }
  const parsed = new Date(`${date}T${time}:00+01:00`);
  if (
    Number.isNaN(parsed.getTime()) ||
    localFields(parsed.toISOString()).date !== date
  )
    return null;
  return parsed;
}

export default function EditSchoolLessonScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const instructors = useSchoolOperationsStore(
    (state) => state.instructors,
  ).filter((item) => item.status === "active");
  const vehicles = useSchoolOperationsStore((state) => state.vehicles).filter(
    (item) => item.isActive,
  );
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSchoolTrainingSession(sessionId);
      setSession(result);
      setTitle(result.title);
      setCapacity(String(result.capacity));
      setNotes(result.notes ?? "");
      const start = localFields(result.scheduledStartTime);
      const end = localFields(result.scheduledEndTime);
      setStartDate(start.date);
      setStartTime(start.time);
      setEndDate(end.date);
      setEndTime(end.time);
      setInstructorId(result.instructorId);
      setVehicleId(result.vehicleId ?? "");
    } catch (cause) {
      setError((cause as ApiError).message || "Could not load this lesson.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const save = async () => {
    if (!session || saving) return;
    const start = watDate(startDate, startTime);
    const end = watDate(endDate, endTime);
    if (title.trim().length < 2) {
      setError("Enter a lesson name with at least two characters.");
      return;
    }
    const capacityNumber = Number(capacity);
    if (
      !Number.isInteger(capacityNumber) ||
      capacityNumber < Math.max(1, session.participantCount)
    ) {
      setError(
        `Capacity must be at least ${Math.max(1, session.participantCount)}.`,
      );
      return;
    }
    if (!start || !end || end <= start) {
      setError("Enter a valid start and later end time in Lagos time.");
      return;
    }
    const timeChanged =
      start.getTime() !== new Date(session.scheduledStartTime).getTime() ||
      end.getTime() !== new Date(session.scheduledEndTime).getTime();
    if (timeChanged && start <= new Date()) {
      setError("Choose a future start time when rescheduling a lesson.");
      return;
    }
    if (!instructorId || (session.sessionType !== "theory" && !vehicleId)) {
      setError("Choose an instructor and, for a practical lesson, a vehicle.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const changes: UpdateSchoolTrainingSessionInput = {};
      if (title.trim() !== session.title) changes.title = title.trim();
      if (timeChanged) {
        changes.scheduledStartTime = start.toISOString();
        changes.scheduledEndTime = end.toISOString();
      }
      if (instructorId !== session.instructorId)
        changes.instructorId = instructorId;
      if (vehicleId && vehicleId !== session.vehicleId)
        changes.vehicleId = vehicleId;
      if (capacityNumber !== session.capacity)
        changes.capacity = capacityNumber;
      if (notes.trim() !== (session.notes ?? "")) changes.notes = notes.trim();
      if (Object.keys(changes).length) {
        await updateSchoolTrainingSession(session.id, changes);
      }
      showToast("Lesson updated.");
      router.replace({
        pathname: "/school/operations/schedule/[sessionId]",
        params: { sessionId: session.id },
      });
    } catch (cause) {
      setError((cause as ApiError).message || "Could not update this lesson.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    change: (value: string) => void,
    options: { numeric?: boolean; multiline?: boolean } = {},
  ) => (
    <View className="flex-1">
      <Text
        className="mb-2 text-[12px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={change}
        autoCapitalize={options.numeric ? "none" : "sentences"}
        keyboardType={options.numeric ? "number-pad" : "default"}
        multiline={options.multiline}
        className="rounded-2xl border px-3 py-3 text-[13px]"
        style={{
          minHeight: options.multiline ? 96 : 48,
          textAlignVertical: options.multiline ? "top" : "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
        }}
      />
    </View>
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Edit lesson" />
      {loading ? (
        <ActivityIndicator className="mt-8" color={colors.primary} />
      ) : !session ? (
        <Text className="mt-6" style={{ color: colors.error }}>
          {error ?? "Lesson not found."}
        </Text>
      ) : (
        <>
          <View className="mt-6">{field("Lesson name", title, setTitle)}</View>
          <Text
            className="mt-2 text-[12px]"
            style={{ color: colors.textMuted }}
          >
            Times are shown in Lagos time (WAT).
          </Text>
          <View className="mt-6 flex-row gap-3">
            <TimetableDateField
              label="Start date"
              value={startDate}
              onChange={setStartDate}
            />
            <TimetableTimeField
              label="Start time"
              value={startTime}
              onChange={setStartTime}
            />
          </View>
          <View className="mt-4 flex-row gap-3">
            <TimetableDateField
              label="End date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
            />
            <TimetableTimeField
              label="End time"
              value={endTime}
              onChange={setEndTime}
            />
          </View>
          <View className="mt-5">
            {field("Capacity", capacity, setCapacity, { numeric: true })}
          </View>
          <Text
            className="mt-7 text-[14px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Instructor
          </Text>
          {instructors.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: instructorId === item.id }}
              onPress={() => setInstructorId(item.id)}
              className="mt-2 rounded-2xl border p-4"
              style={{
                borderColor:
                  instructorId === item.id ? colors.primary : colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.text }}>{item.name}</Text>
            </Pressable>
          ))}
          {session.sessionType !== "theory" ? (
            <>
              <Text
                className="mt-7 text-[14px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Vehicle
              </Text>
              {vehicles.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: vehicleId === item.id }}
                  onPress={() => setVehicleId(item.id)}
                  className="mt-2 rounded-2xl border p-4"
                  style={{
                    borderColor:
                      vehicleId === item.id ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ color: colors.text }}>
                    {item.make} {item.model} · {item.plateNumber}
                  </Text>
                </Pressable>
              ))}
            </>
          ) : null}
          <View className="mt-6">
            {field("Notes", notes, setNotes, { multiline: true })}
          </View>
          {error ? (
            <Text className="mt-4 text-[12px]" style={{ color: colors.error }}>
              {error}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: saving || session.status !== "scheduled",
            }}
            disabled={saving || session.status !== "scheduled"}
            onPress={() => void save()}
            className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            {saving ? <ActivityIndicator color={colors.onPrimary} /> : null}
            <Text
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {saving ? "Saving…" : "Save lesson changes"}
            </Text>
          </Pressable>
        </>
      )}
    </DashboardScreen>
  );
}
