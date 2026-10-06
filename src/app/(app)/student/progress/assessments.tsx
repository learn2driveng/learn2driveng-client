import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import {
  assessmentAreaMeta,
  formatAssessmentDate,
} from "@/features/readiness-assessment";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";

export default function ProgressAssessmentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const currentLearnerId = useAuthStore((state) => state.user?.id);
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const loading = useReadinessAssessmentStore((state) => state.loading);
  const error = useReadinessAssessmentStore((state) => state.error);
  const refreshLearner = useReadinessAssessmentStore((state) => state.refreshLearner);
  useFocusEffect(useCallback(() => { void refreshLearner(); }, [refreshLearner]));
  const learnerAssignments = assignments.filter(
    (item) => item.learnerId === currentLearnerId,
  );
  const openAssignments = learnerAssignments.filter(
    (item) => item.status !== "completed",
  );
  const completedAssignments = learnerAssignments.filter(
    (item) => item.status === "completed",
  );
  const passedCount = completedAssignments.filter(
    (assignment) =>
      attempts.find((attempt) => attempt.id === assignment.latestAttemptId)
        ?.passed,
  ).length;

  const renderAssignment = (
    assignment: (typeof learnerAssignments)[number],
  ) => {
    const assessment = assessments.find(
      (item) => item.id === assignment.assessmentId,
    );
    if (!assessment) return null;
    const attempt = attempts.find(
      (item) => item.id === assignment.latestAttemptId,
    );
    const meta = assessmentAreaMeta[assessment.area];
    const isOpen = assignment.status !== "completed";

    return (
      <Pressable
        key={assignment.id}
        accessibilityRole="button"
        accessibilityLabel={`${isOpen ? "Take" : "Review"} ${assessment.title}`}
        onPress={() =>
          router.push({
            pathname: "/student/progress/assessments/[assignmentId]",
            params: { assignmentId: assignment.id },
          })
        }
        className="rounded-3xl border p-4 active:opacity-80"
        style={surfaces.card}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: attempt?.passed
                ? colors.successSoft
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name={meta.icon}
              size={23}
              color={attempt?.passed ? colors.success : colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[15px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {assessment.title}
            </Text>
            <Text
              className="mt-1 text-[10px] uppercase tracking-[0.6px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {assessment.kind === "final_mock" ? "FINAL CBT MOCK" : "PROGRESS CHECK"} · {meta.label}
            </Text>
          </View>
          {attempt ? (
            <View
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: attempt.passed
                  ? colors.successSoft
                  : colors.verifiedSoft,
              }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: attempt.passed ? colors.success : colors.verified,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {attempt.score}%
              </Text>
            </View>
          ) : (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSubtle}
            />
          )}
        </View>
        <Text
          className="mt-4 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          {assessment.description}
        </Text>
        <View className="mt-4 flex-row items-center gap-4">
          <Text
            className="text-[10px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeSemibold,
            }}
          >
            {assessment.questions.length} questions
          </Text>
          <Text
            className="text-[10px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeSemibold,
            }}
          >
            {assessment.durationMinutes} min
          </Text>
          <Text
            className="text-[10px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeSemibold,
            }}
          >
            {isOpen
              ? assessment.kind === "final_mock"
                ? "Optional · no deadline"
                : `Due ${formatAssessmentDate(assignment.dueAt)}`
              : attempt
                ? attempt.passed
                  ? "Passed"
                  : "Needs review"
                : "Completed"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="CBT quizzes" />
      {loading ? <ActivityIndicator className="mt-4" color={colors.primary} /> : null}
      {error ? (
        <Pressable onPress={() => void refreshLearner()} className="mt-4 rounded-2xl p-4" style={{ backgroundColor: colors.verifiedSoft }}>
          <Text style={{ color: colors.verified }}>{error} Tap to retry.</Text>
        </Pressable>
      ) : null}
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Take optional progress checks during training and a fuller mock quiz
        after you complete a package. Results do not change your package status.
      </Text>

      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
        <View className="flex-row items-center gap-4">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="shield-star-outline"
              size={29}
              color={colors.onPrimary}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[20px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {openAssignments.length
                ? `${openAssignments.length} waiting for you`
                : "You’re all caught up"}
            </Text>
            <Text
              className="mt-1 text-[11px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {passedCount} passed · Results are shared with your school
            </Text>
          </View>
        </View>
      </HeroSurface>

      <View className="mt-8">
        <SectionHeader title="To complete" />
        <View className="mt-4 gap-4">
          {openAssignments.length ? (
            openAssignments.map(renderAssignment)
          ) : (
            <ContentEmptyState
              icon="check-all"
              title="No open assessments"
              description="Your school may assign a progress check during training. A final mock appears when a package is complete and your school has published one."
            />
          )}
        </View>
      </View>

      {completedAssignments.length ? (
        <View className="mt-8">
          <SectionHeader title="Completed" />
          <View className="mt-4 gap-4">
            {completedAssignments.map(renderAssignment)}
          </View>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
