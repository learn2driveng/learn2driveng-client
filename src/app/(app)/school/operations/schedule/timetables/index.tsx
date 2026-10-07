import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  deleteRecurringTrainingSchedule,
  fetchRecurringTrainingSchedules,
  pauseRecurringTrainingSchedule,
  resumeRecurringTrainingSchedule,
} from "@/lib/api/training-sessions";
import {
  endTimeForDuration,
  formatTimetableDuration,
  formatTimetableTimeRange,
} from "@/lib/school/timetable-time";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, RecurringTrainingSchedule } from "@/types";

const weekdayLabels: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

export default function SchoolTimetablesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const [timetables, setTimetables] = useState<RecurringTrainingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausingId, setPausingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setTimetables(await fetchRecurringTrainingSchedules());
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(apiError.statusCode
        ? apiError.message
        : "Timetables could not be loaded. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const pause = (item: RecurringTrainingSchedule) =>
    Alert.alert(
      "Pause timetable",
      "Future slots will no longer be created. Existing learner bookings stay unchanged.",
      [
        { text: "Keep active", style: "cancel" },
        {
          text: "Pause",
          style: "destructive",
          onPress: async () => {
            setPausingId(item.id);
            try {
              const paused = await pauseRecurringTrainingSchedule(item.id);
              setTimetables((current) =>
                current.map((row) => (row.id === paused.id ? paused : row)),
              );
              showToast("Timetable paused.");
            } catch (caught) {
              setError(
                (caught as ApiError).message ||
                  "We could not pause this timetable.",
              );
            } finally {
              setPausingId(null);
            }
          },
        },
      ],
    );
  const resume = async (item: RecurringTrainingSchedule) => {
    setPausingId(item.id);
    try {
      const resumed = await resumeRecurringTrainingSchedule(item.id);
      setTimetables((current) =>
        current.map((row) => (row.id === resumed.id ? resumed : row)),
      );
      showToast("Timetable resumed.");
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not resume this timetable.",
      );
    } finally {
      setPausingId(null);
    }
  };
  const remove = (item: RecurringTrainingSchedule) =>
    Alert.alert(
      "Delete timetable?",
      "Future lessons without bookings will be removed. Booked and past lessons will remain on the calendar. This cannot be undone.",
      [
        { text: "Keep timetable", style: "cancel" },
        {
          text: "Delete timetable",
          style: "destructive",
          onPress: async () => {
            setDeletingId(item.id);
            setError(null);
            try {
              await deleteRecurringTrainingSchedule(item.id);
              setTimetables((current) =>
                current.filter((row) => row.id !== item.id),
              );
              showToast("Timetable deleted. Booked lessons were kept.");
            } catch (caught) {
              setError(
                (caught as ApiError).message ||
                  "We could not delete this timetable.",
              );
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );

  return (
    <DashboardScreen onRefresh={load}>
      <DashboardPageHeader title="Timetables" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create timetable"
        onPress={() => router.push("/school/operations/schedule/new")}
        className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-2xl"
        style={{ backgroundColor: colors.primary }}
      >
        <MaterialCommunityIcons
          name="plus"
          size={20}
          color={colors.onPrimary}
        />
        <Text
          className="text-[14px]"
          style={{
            color: colors.onPrimary,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Create timetable
        </Text>
      </Pressable>
      <View className="mt-8">
        <SectionHeader title="Your timetables" />
        {error ? (
          <View className="mt-4 rounded-2xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
            <Text
              className="text-[13px]"
              style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
            >
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retry loading timetables"
              onPress={() => void load()}
              className="mt-3 self-start rounded-full px-4 py-2 active:opacity-75"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>
                Try again
              </Text>
            </Pressable>
          </View>
        ) : null}
        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error && timetables.length === 0 ? null : timetables.length === 0 ? (
          <View className="mt-4">
            <ContentEmptyState
              icon="calendar-blank-outline"
              title="No timetables yet"
              description="Create a timetable to generate future lesson slots."
            />
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {timetables.map((item) => {
              const instructor = instructors.find(
                (row) => row.id === item.instructorId,
              );
              const vehicle = vehicles.find((row) => row.id === item.vehicleId);
              return (
                <View
                  key={item.id}
                  className="rounded-3xl border p-4"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-11 w-11 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: item.isActive
                          ? colors.verifiedSoft
                          : colors.surfaceStrong,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="calendar"
                        size={21}
                        color={
                          item.isActive ? colors.verified : colors.textMuted
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2">
                        <Text
                          className="flex-1 text-[15px]"
                          style={{
                            color: colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="text-[10px] uppercase"
                          style={{
                            color: item.isActive
                              ? colors.success
                              : colors.textMuted,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {item.isActive ? "Active" : "Paused"}
                        </Text>
                      </View>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {item.weekdays
                          .map((day) => weekdayLabels[day])
                          .join(" · ")}{" "}
                        ·{" "}
                        {formatTimetableTimeRange(
                          item.startTime,
                          endTimeForDuration(
                            item.startTime,
                            item.durationMinutes,
                          ),
                        )}{" "}
                        · {formatTimetableDuration(item.durationMinutes)}
                      </Text>
                      <Text
                        className="mt-1 text-[11px]"
                        style={{
                          color: colors.textSubtle,
                          fontFamily: fontFamily.figtree,
                        }}
                      >
                        {instructor?.name ?? "Instructor"}
                        {vehicle ? ` · ${vehicle.name}` : ""}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-4 flex-row gap-3">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${item.title}`}
                      accessibilityState={{ disabled: deletingId === item.id }}
                      disabled={deletingId === item.id}
                      onPress={() =>
                        router.push({
                          pathname:
                            "/school/operations/schedule/timetables/[timetableId]/edit",
                          params: { timetableId: item.id },
                        })
                      }
                      className="h-11 flex-1 items-center justify-center rounded-2xl border"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceMuted,
                      }}
                    >
                      <Text
                        className="text-[13px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        Edit
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.isActive ? "Pause" : "Resume"} ${item.title}`}
                      accessibilityState={{
                        disabled:
                          pausingId === item.id || deletingId === item.id,
                      }}
                      disabled={pausingId === item.id || deletingId === item.id}
                      onPress={() =>
                        item.isActive ? pause(item) : void resume(item)
                      }
                      className="h-11 flex-1 items-center justify-center rounded-2xl border"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.surfaceMuted,
                      }}
                    >
                      <Text
                        className="text-[13px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {pausingId === item.id
                          ? item.isActive
                            ? "Pausing…"
                            : "Resuming…"
                          : item.isActive
                            ? "Pause"
                            : "Resume"}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                    accessibilityState={{
                      disabled: deletingId === item.id || pausingId === item.id,
                    }}
                    disabled={deletingId === item.id || pausingId === item.id}
                    onPress={() => remove(item)}
                    className="mt-3 h-11 flex-row items-center justify-center gap-2 rounded-2xl border"
                    style={{
                      backgroundColor: colors.surfaceMuted,
                      borderColor: colors.error,
                    }}
                  >
                    {deletingId === item.id ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <MaterialCommunityIcons
                        name="delete-outline"
                        size={18}
                        color={colors.error}
                      />
                    )}
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.error,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {deletingId === item.id
                        ? "Deleting…"
                        : "Delete timetable"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </DashboardScreen>
  );
}
