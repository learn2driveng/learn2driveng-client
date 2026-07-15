import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

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
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";

const currentLearnerId = "learner-amara";

export default function ProgressAssessmentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
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
              {meta.label}
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
              ? `Due ${formatAssessmentDate(assignment.dueAt)}`
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
      <DashboardPageHeader title="Readiness assessments" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Short school-assigned checks that help connect your theory knowledge to
        safer decisions during lessons.
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
              description="Your school will assign a readiness check when it supports your current training stage."
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
