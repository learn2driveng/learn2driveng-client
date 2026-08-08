import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { DashboardEmptyState, DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  computeProgressSkills,
  computeProgressSummary,
} from "@/lib/learner/map-sessions";
import { useAuthStore } from "@/store/auth.store";
import { useLearnerOperationsStore } from "@/store/learner-operations.store";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";

export default function StudentProgressScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const bookings = useLearnerOperationsStore((state) => state.bookings);
  const joinedSessions = useLearnerSessionsStore((state) => state.joinedSessions);
  const progressLessons = useLearnerSessionsStore((state) => state.progressLessons);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const summary = computeProgressSummary(bookings, joinedSessions);
  const progressSkills = computeProgressSkills(bookings, joinedSessions);
  const recentLesson = progressLessons[0];
  const learnerAssignments = assignments.filter(
    (item) => item.learnerId === user?.id,
  );
  const assessmentAssignment =
    learnerAssignments.find((item) => item.status !== "completed") ??
    learnerAssignments[0];
  const latestAssessment = assessments.find(
    (item) => item.id === assessmentAssignment?.assessmentId,
  );
  const latestAttempt = attempts.find(
    (item) => item.id === assessmentAssignment?.latestAttemptId,
  );
  const readinessLabel =
    summary.totalLessons === 0
      ? "Book your first lesson"
      : summary.readiness >= 70
        ? "You're right on track"
        : "Keep building momentum";

  return (
    <DashboardScreen>
      <AppLogo height={48} className="mb-6" />
      <Text
        className="text-[10px] uppercase tracking-[2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        Learning journey
      </Text>
      <Text
        accessibilityRole="header"
        className="mt-1 text-[28px] leading-8 tracking-[-0.7px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Your driving <Text style={{ color: colors.primary }}>progress</Text>
      </Text>
      <Text
        className="mt-2 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Track lesson completion and readiness from your real bookings.
      </Text>

      <View
        className="mt-7 rounded-[28px] border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-[86px] w-[86px] items-center justify-center rounded-full border-[8px]"
            style={{
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.primary,
            }}
          >
            <Text
              className="text-[22px] tracking-[-0.5px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {summary.readiness}%
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Overall readiness
            </Text>
            <Text
              className="mt-2 text-[18px] leading-6"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {readinessLabel}
            </Text>
            <Text
              className="mt-1 text-[12px] leading-4"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {summary.completedLessons} of {summary.totalLessons || 0} lessons
              completed
            </Text>
          </View>
        </View>

        <View
          className="mt-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <View className="mt-4 flex-row">
          {[
            [summary.drivingTime, "Driving time"],
            [`${summary.bestScore}%`, "Best score"],
            [String(summary.remainingLessons), "Lessons left"],
          ].map(([value, label], index) => (
            <View
              key={label}
              className="flex-1 items-center px-1"
              style={
                index
                  ? { borderLeftWidth: 1, borderLeftColor: colors.border }
                  : undefined
              }
            >
              <Text
                className="text-[16px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
              <Text
                className="mt-1 text-center text-[9px] uppercase tracking-[0.5px]"
                style={{
                  color: colors.textSubtle,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Skill development" />
        {progressSkills.length > 0 ? (
          <View
            className="mt-4 overflow-hidden rounded-3xl border px-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {progressSkills.map((skill, index) => (
              <View
                key={skill.id}
                className="py-4"
                style={
                  index
                    ? { borderTopWidth: 1, borderTopColor: colors.border }
                    : undefined
                }
              >
                <View className="flex-row items-center">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name={skill.icon}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    className="ml-3 flex-1 text-[13px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeSemibold,
                    }}
                  >
                    {skill.name}
                  </Text>
                  <Text
                    className="text-[12px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {skill.progress}%
                  </Text>
                </View>
                <View
                  className="ml-[52px] mt-3 h-1.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: colors.primary,
                      width: `${skill.progress}%`,
                    }}
                  />
                </View>
                <Text
                  className="ml-[52px] mt-2 text-[11px] leading-4"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtree,
                  }}
                >
                  {skill.note}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="chart-line"
              title="No progress yet"
              description="Complete lessons to start building your skill profile."
              actionLabel="Book a session"
              onActionPress={() => router.push("/student/sessions")}
            />
          </View>
        )}
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Assessments"
          actionLabel="View all"
          onActionPress={() => router.push("/student/progress/assessments")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View assessments"
          onPress={() => router.push("/student/progress/assessments")}
          className="mt-4 flex-row items-center rounded-3xl border p-4 active:opacity-80"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={27}
              color={colors.success}
            />
          </View>
          <View className="ml-4 flex-1">
            <Text
              className="text-[14px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {latestAssessment?.title ?? "Readiness assessments"}
            </Text>
            <Text
              className="mt-1 text-[11px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {assessmentAssignment?.status === "completed" && latestAttempt
                ? `Completed with a ${latestAttempt.score}% score`
                : learnerAssignments.length > 0
                  ? "A readiness check is waiting for you"
                  : "No assessments assigned yet"}
            </Text>
          </View>
          {latestAttempt ? (
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {latestAttempt.score}%
              </Text>
            </View>
          ) : (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSubtle}
            />
          )}
        </Pressable>
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Lesson history"
          actionLabel={recentLesson ? "View all" : undefined}
          onActionPress={
            recentLesson
              ? () => router.push("/student/progress/history")
              : undefined
          }
        />
        {recentLesson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${recentLesson.title}`}
            onPress={() =>
              router.push({
                pathname: "/student/progress/history/[lessonId]",
                params: { lessonId: recentLesson.id },
              })
            }
            className="mt-4 rounded-3xl border p-4 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="car-clock"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="text-[13px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {recentLesson.title}
                </Text>
                <Text
                  className="mt-1 text-[11px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {recentLesson.completedAt} · {recentLesson.duration}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textMuted}
              />
            </View>
            <Text
              className="mt-4 text-[12px] leading-5"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
            >
              {recentLesson.feedback}
            </Text>
          </Pressable>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="history"
              title="No completed lessons yet"
              description="Finished sessions will appear here once your instructor marks attendance."
              actionLabel="Book a session"
              onActionPress={() => router.push("/student/sessions")}
            />
          </View>
        )}
      </View>
    </DashboardScreen>
  );
}
