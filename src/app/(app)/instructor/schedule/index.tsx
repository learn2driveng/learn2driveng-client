import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import {
  InstructorLessonCard,
  toInstructorLessonStatus,
} from "@/features/instructor";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import { useTrainingSessionStore } from "@/store/training-session.store";
import type { InstructorLessonStatus } from "@/types";

type ScheduleFilter = "all" | InstructorLessonStatus;

const filters: { label: string; value: ScheduleFilter }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "scheduled" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

export default function InstructorScheduleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const scheduleDays = useInstructorOperationsStore(
    (state) => state.scheduleDays,
  );
  const sessions = useTrainingSessionStore((state) => state.sessions);
  const [selectedDayId, setSelectedDayId] = useState(
    scheduleDays[0]?.id ?? "",
  );
  const [filter, setFilter] = useState<ScheduleFilter>("all");
  const selectedDay =
    scheduleDays.find((day) => day.id === selectedDayId) ?? scheduleDays[0];

  useEffect(() => {
    if (scheduleDays.length === 0) return;
    setSelectedDayId((current) =>
      scheduleDays.some((day) => day.id === current)
        ? current
        : (scheduleDays[0]?.id ?? ""),
    );
  }, [scheduleDays]);
  const lessonsWithStatus =
    selectedDay?.lessons.map((lesson) => ({
      lesson,
      status: toInstructorLessonStatus(
        sessions[lesson.sessionId]?.status,
        lesson.status,
      ),
    })) ?? [];
  const filteredLessons = lessonsWithStatus.filter(
    (item) => filter === "all" || item.status === filter,
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Schedule" showBack={false} />
      <Text
        className="mt-3 mb-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Review the lessons assigned to you by your driving school.
      </Text>

      <ScrollView
        horizontal
        className="mb-5"
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 py-6"
      >
        {scheduleDays.map((day) => {
          const selected = selectedDayId === day.id;

          return (
            <Pressable
              key={day.id}
              accessibilityRole="radio"
              accessibilityLabel={`${day.fullLabel}. ${day.lessons.length} assigned lessons.`}
              accessibilityState={{ selected }}
              onPress={() => {
                setSelectedDayId(day.id);
                setFilter("all");
              }}
              className="min-w-20 items-center rounded-2xl border px-4 py-3 active:opacity-75"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="font-figtree-bold text-[11px]"
                style={{
                  color: selected ? colors.onPrimary : colors.textMuted,
                }}
              >
                {day.dayLabel}
              </Text>
              <Text
                className="mt-1 font-figtree-bold text-[15px]"
                style={{ color: selected ? colors.onPrimary : colors.text }}
              >
                {day.dateLabel}
              </Text>
              <Text
                className="mt-1 font-figtree text-[10px]"
                style={{
                  color: selected ? colors.onPrimary : colors.textSubtle,
                }}
              >
                {day.lessons.length}{" "}
                {day.lessons.length === 1 ? "lesson" : "lessons"}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selectedDay ? (
        <View
          className="flex-row items-center justify-between rounded-3xl p-5"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <View>
            <Text
              className="font-figtree text-[12px]"
              style={{ color: colors.contrastMuted }}
            >
              {selectedDay.fullLabel}
            </Text>
            <Text
              className="mt-2 font-figtree-bold text-[25px]"
              style={{ color: colors.contrastText }}
            >
              {selectedDay.lessons.length} assigned
            </Text>
          </View>
          <View className="items-end">
            <Text
              className="font-figtree-bold text-[18px]"
              style={{ color: colors.primary }}
            >
              {selectedDay.scheduledDuration}
            </Text>
            <Text
              className="mt-1 font-figtree text-[10px]"
              style={{ color: colors.contrastMuted }}
            >
              Scheduled time
            </Text>
          </View>
        </View>
      ) : null}

      {selectedDay && selectedDay.lessons.length > 0 ? (
        <View className="mt-7 flex-row flex-wrap gap-2">
          {filters.map((item) => {
            const selected = item.value === filter;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setFilter(item.value)}
                className="rounded-full border px-4 py-2.5 active:opacity-70"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-figtree-bold text-[11px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.textMuted,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View className="mt-8">
        <SectionHeader title={selectedDay?.fullLabel ?? "Assigned lessons"} />

        {!selectedDay || selectedDay.lessons.length === 0 ? (
          <View className="mt-4">
            <ContentEmptyState
              icon="calendar-blank-outline"
              title="No lessons assigned"
              description="You have no lessons scheduled for this day."
            />
          </View>
        ) : null}

        {selectedDay && selectedDay.lessons.length > 0 ? (
          <View className="mt-4 gap-3">
            {filteredLessons.map(({ lesson, status }) => (
              <InstructorLessonCard
                key={lesson.id}
                lesson={lesson}
                status={status}
                onPress={() =>
                  router.push({
                    pathname: "/instructor/schedule/[lessonId]",
                    params: { lessonId: lesson.id },
                  })
                }
              />
            ))}
          </View>
        ) : null}

        {selectedDay &&
        selectedDay.lessons.length > 0 &&
        filteredLessons.length === 0 ? (
          <View className="mt-4">
            <ContentEmptyState
              icon="filter-remove-outline"
              title="No matching lessons"
              description="There are no lessons with this status on the selected day."
              actionLabel="Show all lessons"
              onActionPress={() => setFilter("all")}
            />
          </View>
        ) : null}
      </View>
    </DashboardScreen>
  );
}
