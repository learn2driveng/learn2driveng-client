import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { assessmentAreaMeta } from "@/features/readiness-assessment";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";

export default function SchoolAssessmentLibraryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const completedAttempts = attempts.filter((attempt) =>
    assignments.some(
      (assignment) =>
        assignment.id === attempt.assignmentId &&
        assignment.latestAttemptId === attempt.id,
    ),
  );
  const passRate = completedAttempts.length
    ? Math.round(
        (completedAttempts.filter((attempt) => attempt.passed).length /
          completedAttempts.length) *
          100,
      )
    : 0;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Assessment library" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Scenario-led readiness checks owned by your school. Open a learner to
        assign the right check at the right stage.
      </Text>

      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
        <View className="flex-row items-center gap-4">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="certificate-outline"
              size={28}
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
              {assessments.length} readiness checks
            </Text>
            <Text
              className="mt-1 text-[11px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {assignments.length} assignments · {passRate}% current pass rate
            </Text>
          </View>
        </View>
      </HeroSurface>

      <View className="mt-8">
        <SectionHeader title="Published assessments" />
        <View className="mt-4 gap-4">
          {assessments.map((assessment) => {
            const meta = assessmentAreaMeta[assessment.area];
            const assignedCount = assignments.filter(
              (item) => item.assessmentId === assessment.id,
            ).length;
            return (
              <View
                key={assessment.id}
                className="rounded-3xl border p-4"
                style={surfaces.card}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon}
                      size={23}
                      color={colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {assessment.title}
                    </Text>
                    <Text
                      className="mt-1 text-[10px] uppercase tracking-[0.7px]"
                      style={{
                        color: colors.textSubtle,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {meta.label}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: colors.successSoft }}
                  >
                    <Text
                      className="text-[9px]"
                      style={{
                        color: colors.success,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      PUBLISHED
                    </Text>
                  </View>
                </View>
                <Text
                  className="mt-4 text-[12px] leading-5"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtree,
                  }}
                >
                  {assessment.description}
                </Text>
                <View className="mt-4 flex-row items-center gap-4">
                  <Text
                    className="text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeSemibold,
                    }}
                  >
                    {assessment.questions.length} questions
                  </Text>
                  <Text
                    className="text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeSemibold,
                    }}
                  >
                    {assessment.durationMinutes} min
                  </Text>
                  <Text
                    className="text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeSemibold,
                    }}
                  >
                    Pass {assessment.passingScore}%
                  </Text>
                </View>
                <View
                  className="my-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />
                <View className="flex-row items-center justify-between gap-3">
                  <Text
                    className="text-[11px]"
                    style={{
                      color: colors.textSubtle,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    Assigned to {assignedCount} learner
                    {assignedCount === 1 ? "" : "s"}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.replace("/school/learners")}
                    className="min-h-10 flex-row items-center justify-center gap-1 rounded-full px-3 active:opacity-75"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <Text
                      className="text-[10px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Choose learner
                    </Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={15}
                      color={colors.text}
                    />
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
