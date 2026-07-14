import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardScreen,
  QuickAction,
  SectionHeader,
  StatCard,
} from "@/components/dashboard";
import {
  InstructorLessonCard,
  toInstructorLessonStatus,
} from "@/features/instructor";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  instructorProfile,
  instructorTodayLessons,
} from "@/sample_data/instructor";
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function InstructorDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const sessions = useTrainingSessionStore((state) => state.sessions);
  const getLessonStatus = (
    sessionId: string,
    fallback: "upcoming" | "in_progress" | "completed",
  ) => toInstructorLessonStatus(sessions[sessionId]?.status, fallback);
  const activeLesson = instructorTodayLessons.find(
    (lesson) =>
      getLessonStatus(lesson.sessionId, lesson.status) === "in_progress",
  );
  const nextLesson = instructorTodayLessons.find(
    (lesson) => getLessonStatus(lesson.sessionId, lesson.status) === "upcoming",
  );
  const featuredLesson = activeLesson ?? nextLesson;
  const featuredStatus = featuredLesson
    ? getLessonStatus(featuredLesson.sessionId, featuredLesson.status)
    : null;
  const availabilityColor = instructorProfile.availableToday
    ? colors.success
    : colors.textSubtle;
  const openLesson = (lessonId: string) =>
    router.push({
      pathname: "/instructor/schedule/[lessonId]",
      params: { lessonId },
    });

  return (
    <DashboardScreen>
      <AppLogo height={48} className="mb-6" />
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text
            className="font-figtree text-[14px]"
            style={{ color: colors.textMuted }}
          >
            Good morning
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 font-figtree-bold text-[28px]"
            style={{ color: colors.text }}
          >
            {instructorProfile.name}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            {instructorProfile.verified ? (
              <MaterialCommunityIcons
                name="check-decagram"
                size={16}
                color={colors.verified}
              />
            ) : null}
            <Text
              className="font-figtree-medium text-[12px]"
              style={{ color: colors.textMuted }}
            >
              {instructorProfile.schoolName}
            </Text>
          </View>
        </View>
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.primary }}
          >
            {instructorProfile.initials}
          </Text>
        </View>
      </View>

      <View
        className="mt-7 flex-row items-center justify-between rounded-2xl border px-4 py-3"
        style={surfaces.card}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: instructorProfile.availableToday
                ? colors.successSoft
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name={
                instructorProfile.availableToday
                  ? "calendar-check-outline"
                  : "calendar-remove-outline"
              }
              size={20}
              color={availabilityColor}
            />
          </View>
          <View>
            <Text
              className="font-figtree-bold text-[13px]"
              style={{ color: colors.text }}
            >
              {instructorProfile.availableToday
                ? "Available today"
                : "Assignments paused"}
            </Text>
            <Text
              className="mt-0.5 font-figtree text-[11px]"
              style={{ color: colors.textMuted }}
            >
              {instructorProfile.availableToday
                ? "Accepting assigned lessons"
                : "Update availability to accept lessons"}
            </Text>
          </View>
        </View>
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: availabilityColor }}
        />
      </View>

      {featuredLesson ? (
        <HeroSurface className="mt-8 overflow-hidden rounded-[28px] p-6">
          <View className="flex-row items-center justify-between">
            <Text
              className="font-figtree-bold text-[10px] uppercase tracking-[1.4px]"
              style={{ color: colors.primary }}
            >
              {featuredStatus === "in_progress"
                ? "Lesson in progress"
                : "Next lesson"}
            </Text>
            <View
              className="rounded-full border px-3 py-1.5"
              style={{ borderColor: colors.contrastBorder }}
            >
              <Text
                className="font-figtree-bold text-[11px]"
                style={{ color: colors.contrastText }}
              >
                {featuredLesson.duration}
              </Text>
            </View>
          </View>
          <Text
            className="mt-4 font-figtree-bold text-[38px] tracking-[-1px]"
            style={{ color: colors.contrastText }}
          >
            {featuredLesson.time}
          </Text>
          <Text
            className="mt-2 font-figtree-bold text-[19px]"
            style={{ color: colors.contrastText }}
          >
            {featuredLesson.learnerName}
          </Text>
          <Text
            className="mt-1 font-figtree text-[13px]"
            style={{ color: colors.contrastMuted }}
          >
            {featuredLesson.packageName}
          </Text>
          <View className="mt-5 flex-row items-center gap-2">
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={colors.primary}
            />
            <Text
              className="flex-1 font-figtree text-[12px]"
              style={{ color: colors.contrastMuted }}
            >
              {featuredLesson.location} · {featuredLesson.transmission}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${featuredStatus === "in_progress" ? "Continue" : "View"} lesson with ${featuredLesson.learnerName}`}
            onPress={() => openLesson(featuredLesson.id)}
            className="mt-6 h-12 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-figtree-bold text-[14px]"
              style={{ color: colors.onPrimary }}
            >
              {featuredStatus === "in_progress"
                ? "Continue lesson"
                : "View lesson"}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={colors.onPrimary}
            />
          </Pressable>
        </HeroSurface>
      ) : (
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-check-outline"
            title="No upcoming lesson today"
            description="Your next assigned lesson will appear here when one is scheduled."
            actionLabel="View schedule"
            onActionPress={() => router.push("/instructor/schedule")}
          />
        </View>
      )}

      <View className="mt-8 flex-row gap-4">
        <StatCard
          icon="calendar-check"
          value={`${instructorTodayLessons.length}`}
          label="Lessons today"
        />
        <StatCard
          icon="clipboard-alert-outline"
          value={`${instructorProfile.outstandingReports}`}
          label="Report due"
          accent={colors.error}
        />
      </View>

      <View className="mt-9">
        <SectionHeader
          title="Today’s schedule"
          actionLabel="View all"
          onActionPress={() => router.push("/instructor/schedule")}
        />
        <View className="mt-4 gap-3">
          {instructorTodayLessons.length > 0 ? (
            instructorTodayLessons
              .slice(0, 2)
              .map((lesson) => (
                <InstructorLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={getLessonStatus(lesson.sessionId, lesson.status)}
                  onPress={() => openLesson(lesson.id)}
                />
              ))
          ) : (
            <ContentEmptyState
              icon="calendar-blank-outline"
              title="Your day is clear"
              description="There are no lessons assigned to you today."
              actionLabel="Set availability"
              onActionPress={() => router.push("/instructor/availability")}
            />
          )}
        </View>
      </View>

      <View className="mt-9">
        <SectionHeader title="Quick actions" />
        <View className="mt-4 flex-row gap-3">
          <QuickAction
            icon="calendar-clock"
            label="Schedule"
            onPress={() => router.push("/instructor/schedule")}
          />
          <QuickAction
            icon="calendar-account"
            label="Availability"
            onPress={() => router.push("/instructor/availability")}
          />
          <QuickAction
            icon="account-outline"
            label="Profile"
            onPress={() => router.push("/instructor/profile")}
          />
        </View>
      </View>
    </DashboardScreen>
  );
}
