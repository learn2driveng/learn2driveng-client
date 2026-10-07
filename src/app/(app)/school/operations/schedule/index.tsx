import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useSurfaceStyles } from "@/components/common/surface";
import {
  formatSchoolLessonDate,
  formatSchoolLessonTime,
  schoolLessonDateKey,
  SchoolLessonCalendar,
} from "@/components/dashboard/school-lesson-calendar";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchSchoolTrainingSessions } from "@/lib/api/training-sessions";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { TrainingSession } from "@/types";

export default function SchoolLessonScheduleScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [renderedAt, setRenderedAt] = useState(() => Date.now());
  const [todayKey, setTodayKey] = useState(() =>
    schoolLessonDateKey(new Date()),
  );
  const [selectedDay, setSelectedDay] = useState(() =>
    schoolLessonDateKey(new Date()),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setRenderedAt(Date.now());
    setTodayKey(schoolLessonDateKey(new Date()));
    try {
      setSessions(await fetchSchoolTrainingSessions());
    } catch {
      setError("We could not load your lesson schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(a.scheduledStartTime).getTime() -
          new Date(b.scheduledStartTime).getTime(),
      ),
    [sessions],
  );
  const sessionsByDay = useMemo(() => {
    const grouped = new Map<string, TrainingSession[]>();
    for (const session of sortedSessions) {
      const dateKey = schoolLessonDateKey(session.scheduledStartTime);
      grouped.set(dateKey, [...(grouped.get(dateKey) ?? []), session]);
    }
    return grouped;
  }, [sortedSessions]);
  const selectedSessions = sessionsByDay.get(selectedDay) ?? [];
  const upcoming = sessions.filter(
    (item) =>
      item.status === "scheduled" &&
      new Date(item.scheduledEndTime).getTime() > renderedAt,
  );

  return (
    <DashboardScreen onRefresh={load}>
      <DashboardPageHeader
        title="Lesson schedule"
        showBack={!pathname.startsWith("/school/bookings")}
      />
      <View
        className="mt-6 p-5"
        style={{ backgroundColor: colors.contrastSurface, borderRadius: 30 }}
      >
        <Text
          className="text-[11px] uppercase tracking-[1.3px]"
          style={{
            color: colors.contrastMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Training calendar
        </Text>
        <View className="mt-3 flex-row items-end justify-between gap-4">
          <View>
            <Text
              className="text-[30px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {upcoming.length}
            </Text>
            <Text
              className="mt-1 text-[12px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              upcoming lesson{upcoming.length === 1 ? "" : "s"}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/school/operations/schedule/new")}
            className="h-12 flex-row items-center gap-2 rounded-2xl px-4 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={colors.onPrimary}
            />
            <Text
              className="text-[13px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Timetable
            </Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Manage timetables"
        onPress={() => router.push("/school/operations/schedule/timetables")}
        className="mt-4 h-14 flex-row items-center justify-between rounded-2xl border px-4 active:opacity-80"
        style={{ backgroundColor: colors.surface, borderColor: colors.primary }}
      >
        <View className="flex-row items-center gap-3">
          <MaterialCommunityIcons
            name="calendar-edit"
            size={22}
            color={colors.primary}
          />
          <Text
            className="text-[14px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Manage timetables
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.primary}
        />
      </Pressable>
      <View className="mt-8">
        <SectionHeader title="Your lesson calendar" />
        {loading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View className="mt-4 gap-3">
            <Text
              className="text-[13px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void load()}
              className="self-start rounded-full px-4 py-2 active:opacity-70"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Try again
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <SchoolLessonCalendar
              todayKey={todayKey}
              selectedDay={selectedDay}
              sessionsByDay={sessionsByDay}
              onSelectDay={setSelectedDay}
            />
            <View className="mt-7 flex-row items-end justify-between gap-3">
              <View className="flex-1">
                <Text
                  className="text-[18px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {formatSchoolLessonDate(selectedDay)}
                </Text>
                <Text
                  className="mt-1 text-[12px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {selectedSessions.length} lesson
                  {selectedSessions.length === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
            {selectedSessions.length === 0 ? (
              <View className="mt-4">
                <ContentEmptyState
                  icon="calendar-blank-outline"
                  title={
                    sessions.length === 0
                      ? "No lessons scheduled"
                      : "No lessons on this day"
                  }
                  description={
                    sessions.length === 0
                      ? "Create a timetable to generate lesson slots."
                      : "Choose a marked date to view its lessons."
                  }
                />
              </View>
            ) : (
              <View className="mt-4 gap-3">
                {selectedSessions.map((session) => {
                  const instructor = instructors.find(
                    (item) => item.id === session.instructorId,
                  );
                  const isPastScheduled =
                    session.status === "scheduled" &&
                    new Date(session.scheduledEndTime).getTime() <= renderedAt;
                  const statusLabel = isPastScheduled
                    ? "Past"
                    : session.status.replace("_", " ");
                  const statusColor =
                    session.status === "completed"
                      ? colors.success
                      : session.status === "cancelled" ||
                          session.status === "missed"
                        ? colors.error
                        : isPastScheduled
                          ? colors.textMuted
                          : colors.verified;
                  return (
                    <Pressable
                      key={session.id}
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: "/school/operations/schedule/[sessionId]",
                          params: { sessionId: session.id },
                        })
                      }
                      className="rounded-3xl border p-4 active:opacity-80"
                      style={surfaces.card}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className="h-14 w-[70px] items-center justify-center rounded-2xl"
                          style={{ backgroundColor: colors.verifiedSoft }}
                        >
                          <Text
                            className="text-[12px]"
                            style={{
                              color: colors.verified,
                              fontFamily: fontFamily.figtreeBold,
                            }}
                          >
                            {formatSchoolLessonTime(session.scheduledStartTime)}
                          </Text>
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
                              {session.title}
                            </Text>
                            <MaterialCommunityIcons
                              name="chevron-right"
                              size={20}
                              color={colors.textSubtle}
                            />
                          </View>
                          <Text
                            className="mt-1 text-[12px]"
                            style={{
                              color: colors.textMuted,
                              fontFamily: fontFamily.figtreeMedium,
                            }}
                          >
                            {formatSchoolLessonTime(session.scheduledStartTime)}{" "}
                            – {formatSchoolLessonTime(session.scheduledEndTime)}
                          </Text>
                          <Text
                            className="mt-1 text-[11px]"
                            style={{
                              color: colors.textSubtle,
                              fontFamily: fontFamily.figtree,
                            }}
                          >
                            {instructor?.name ?? "Assigned instructor"} ·{" "}
                            {session.participantCount}/{session.capacity} booked
                          </Text>
                          <Text
                            className="mt-1 text-[11px] capitalize"
                            style={{
                              color: statusColor,
                              fontFamily: fontFamily.figtreeBold,
                            }}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </View>
    </DashboardScreen>
  );
}
