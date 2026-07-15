import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

export default function SchoolLearnerDetailScreen() {
  const { learnerId } = useLocalSearchParams<{ learnerId: string }>();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const learners = useReadinessAssessmentStore((state) => state.learners);
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const assignAssessment = useReadinessAssessmentStore(
    (state) => state.assignAssessment,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const learner = learners.find((item) => item.id === learnerId);

  if (!learner) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Learner" />
        <View className="mt-8">
          <ContentEmptyState
            icon="account-question-outline"
            title="Learner not found"
            description="This learner is not available in the current school roster."
          />
        </View>
      </DashboardScreen>
    );
  }

  const learnerAssignments = assignments.filter(
    (assignment) => assignment.learnerId === learner.id,
  );
  const completedAttempts = learnerAssignments
    .map((assignment) =>
      attempts.find((attempt) => attempt.id === assignment.latestAttemptId),
    )
    .filter((attempt) => attempt !== undefined);
  const theoryReadiness = completedAttempts.length
    ? Math.round(
        completedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          completedAttempts.length,
      )
    : 0;
  const overallReadiness = Math.round(
    learner.practicalReadiness * 0.6 + theoryReadiness * 0.4,
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title={learner.name} />
      <Text
        className="mt-2 text-[12px]"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        {learner.packageName} · Joined {formatAssessmentDate(learner.joinedAt)}
      </Text>

      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
        <View className="flex-row items-center gap-4">
          <View
            className="h-[76px] w-[76px] items-center justify-center rounded-full border-[7px]"
            style={{
              backgroundColor: colors.contrastSurfaceStrong,
              borderColor: colors.primary,
            }}
          >
            <Text
              className="text-[19px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {overallReadiness}%
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Combined readiness
            </Text>
            <Text
              className="mt-2 text-[18px] leading-6"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {overallReadiness >= 75
                ? "Approaching test readiness"
                : "Still building core skills"}
            </Text>
            <Text
              className="mt-1 text-[11px] leading-4"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Theory supports decisions; practical lessons confirm safe
              execution.
            </Text>
          </View>
        </View>
      </HeroSurface>

      <View className="mt-4 flex-row gap-3">
        {[
          [`${learner.completedLessons}/${learner.totalLessons}`, "Lessons"],
          [`${learner.practicalReadiness}%`, "Practical"],
          [completedAttempts.length ? `${theoryReadiness}%` : "—", "Theory"],
        ].map(([value, label]) => (
          <View
            key={label}
            className="flex-1 rounded-2xl border p-3"
            style={surfaces.card}
          >
            <Text
              className="text-[16px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {value}
            </Text>
            <Text
              className="mt-1 text-[9px] uppercase tracking-[0.5px]"
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

      <View className="mt-8">
        <SectionHeader title="Training relationship" />
        <View className="mt-4 rounded-3xl border p-4" style={surfaces.card}>
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="account-tie-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[10px] uppercase tracking-[0.8px]"
                style={{
                  color: colors.textSubtle,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Assigned instructor
              </Text>
              <Text
                className="mt-1 text-[14px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {learner.instructorName ?? "Needs assignment"}
              </Text>
            </View>
          </View>
          <View
            className="my-4 h-px"
            style={{ backgroundColor: colors.border }}
          />
          <Text
            className="text-[11px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {learner.email} · {learner.phone}
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Assigned assessments" />
        <View className="mt-4 gap-3">
          {learnerAssignments.length ? (
            learnerAssignments.map((assignment) => {
              const assessment = assessments.find(
                (item) => item.id === assignment.assessmentId,
              );
              if (!assessment) return null;
              const attempt = attempts.find(
                (item) => item.id === assignment.latestAttemptId,
              );
              return (
                <View
                  key={assignment.id}
                  className="flex-row items-center gap-3 rounded-3xl border p-4"
                  style={surfaces.card}
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: attempt?.passed
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={assessmentAreaMeta[assessment.area].icon}
                      size={21}
                      color={attempt?.passed ? colors.success : colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {assessment.title}
                    </Text>
                    <Text
                      className="mt-1 text-[10px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {attempt
                        ? `Completed · ${attempt.score}%`
                        : `Due ${formatAssessmentDate(assignment.dueAt)}`}
                    </Text>
                  </View>
                  <Text
                    className="text-[10px] uppercase"
                    style={{
                      color: attempt?.passed
                        ? colors.success
                        : colors.textSubtle,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {attempt
                      ? attempt.passed
                        ? "Passed"
                        : "Review"
                      : assignment.status.replace("_", " ")}
                  </Text>
                </View>
              );
            })
          ) : (
            <ContentEmptyState
              icon="clipboard-text-outline"
              title="No assessments yet"
              description="Assign a focused readiness check from the library below."
            />
          )}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Assign a readiness check" />
        <Text
          className="mt-2 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Assign only when it supports the learner’s current lesson stage. The
          default due date is seven days.
        </Text>
        {notice ? (
          <View
            className="mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={18}
              color={colors.success}
            />
            <Text
              className="flex-1 text-[11px]"
              style={{
                color: colors.success,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {notice}
            </Text>
          </View>
        ) : null}
        <View className="mt-4 gap-3">
          {assessments.map((assessment) => {
            const alreadyOpen = learnerAssignments.some(
              (assignment) =>
                assignment.assessmentId === assessment.id &&
                assignment.status !== "completed",
            );
            return (
              <View
                key={assessment.id}
                className="rounded-3xl border p-4"
                style={surfaces.card}
              >
                <View className="flex-row items-start gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {assessment.title}
                    </Text>
                    <Text
                      className="mt-1 text-[10px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {assessment.questions.length} questions · Pass{" "}
                      {assessment.passingScore}%
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: alreadyOpen }}
                    disabled={alreadyOpen}
                    onPress={() => {
                      const assigned = assignAssessment(
                        assessment.id,
                        learner.id,
                      );
                      setNotice(
                        assigned
                          ? `${assessment.title} assigned to ${learner.name}.`
                          : "This assessment already has an open assignment.",
                      );
                    }}
                    className="min-h-10 justify-center rounded-full px-4 active:opacity-75"
                    style={{
                      backgroundColor: alreadyOpen
                        ? colors.surfaceStrong
                        : colors.primary,
                    }}
                  >
                    <Text
                      className="text-[10px]"
                      style={{
                        color: alreadyOpen
                          ? colors.textSubtle
                          : colors.onPrimary,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {alreadyOpen ? "Assigned" : "Assign"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </DashboardScreen>
  );
}
