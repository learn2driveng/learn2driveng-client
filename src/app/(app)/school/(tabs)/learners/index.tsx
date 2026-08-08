import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";
import type { SchoolLearnerStatus } from "@/types";

const filters: { label: string; value: "all" | SchoolLearnerStatus }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "On hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
];

export default function SchoolLearnersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const learners = useReadinessAssessmentStore((state) => state.learners);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | SchoolLearnerStatus>("all");

  const filteredLearners = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return learners.filter((learner) => {
      const matchesFilter = filter === "all" || learner.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        learner.name.toLowerCase().includes(normalizedQuery) ||
        learner.packageName.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [filter, learners, query]);

  const activeLearners = learners.filter((item) => item.status === "active");
  const pendingAssignments = assignments.filter(
    (item) => item.status !== "completed",
  );
  const latestAttemptByAssignment = new Map(
    attempts.map((attempt) => [attempt.assignmentId, attempt]),
  );

  return (
    <DashboardScreen>
      <AppLogo height={52} className="mb-6" />
      <DashboardPageHeader title="Learners" showBack={false} />
      <Text
        className="mt-2 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Follow enrolment, practical progress, and certification readiness in one
        place.
      </Text>

      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text
              className="text-[11px] uppercase tracking-[1px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Active learners
            </Text>
            <Text
              className="mt-1 text-[32px] leading-9"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {activeLearners.length}
            </Text>
            <Text
              className="mt-2 text-[11px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {pendingAssignments.length} assessment
              {pendingAssignments.length === 1 ? "" : "s"} awaiting completion
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/school/learners/assessments")}
            className="h-14 w-14 items-center justify-center rounded-2xl active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={26}
              color={colors.onPrimary}
            />
          </Pressable>
        </View>
      </HeroSurface>

      <View
        className="mt-6 h-12 flex-row items-center rounded-2xl border px-4"
        style={surfaces.card}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.textSubtle}
        />
        <TextInput
          accessibilityLabel="Search learners"
          value={query}
          onChangeText={setQuery}
          placeholder="Search learner or package"
          placeholderTextColor={colors.textSubtle}
          className="ml-3 flex-1 text-[13px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
        />
      </View>

      <View className="mt-3 flex-row flex-wrap gap-2">
        {filters.map((item) => {
          const selected = filter === item.value;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              className="min-h-10 justify-center rounded-full border px-4 active:opacity-75"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: selected ? colors.onPrimary : colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-8">
        <SectionHeader
          title={`Learner overview · ${filteredLearners.length}`}
          actionLabel="Assessments"
          onActionPress={() => router.push("/school/learners/assessments")}
        />
        <View className="mt-4 gap-4">
          {filteredLearners.length === 0 ? (
            <ContentEmptyState
              icon="account-school-outline"
              title="No learners yet"
              description="Learners appear here after they purchase one of your packages."
            />
          ) : null}
          {filteredLearners.map((learner) => {
            const learnerAssignments = assignments.filter(
              (item) => item.learnerId === learner.id,
            );
            const completedScores = learnerAssignments
              .map((item) => latestAttemptByAssignment.get(item.id)?.score)
              .filter((score): score is number => score !== undefined);
            const theoryReadiness = completedScores.length
              ? Math.round(
                  completedScores.reduce((sum, score) => sum + score, 0) /
                    completedScores.length,
                )
              : null;
            const needsAttention =
              learner.instructorId === null || learner.practicalReadiness < 50;

            return (
              <Pressable
                key={learner.id}
                accessibilityRole="button"
                accessibilityLabel={`View ${learner.name}`}
                onPress={() =>
                  router.push({
                    pathname: "/school/learners/[learnerId]",
                    params: { learnerId: learner.id },
                  })
                }
                className="rounded-3xl border p-4 active:opacity-80"
                style={surfaces.card}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {learner.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {learner.name}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {learner.packageName}
                    </Text>
                  </View>
                  {needsAttention ? (
                    <View
                      className="rounded-full px-2.5 py-1.5"
                      style={{ backgroundColor: colors.verifiedSoft }}
                    >
                      <Text
                        className="text-[9px]"
                        style={{
                          color: colors.verified,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        REVIEW
                      </Text>
                    </View>
                  ) : null}
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={21}
                    color={colors.textSubtle}
                  />
                </View>
                <View
                  className="my-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {learner.completedLessons}/{learner.totalLessons}
                    </Text>
                    <Text
                      className="mt-1 text-[9px] uppercase tracking-[0.6px]"
                      style={{
                        color: colors.textSubtle,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Lessons
                    </Text>
                  </View>
                  <View
                    className="flex-1 border-l pl-3"
                    style={{ borderColor: colors.border }}
                  >
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {theoryReadiness === null
                        ? "Not started"
                        : `${theoryReadiness}%`}
                    </Text>
                    <Text
                      className="mt-1 text-[9px] uppercase tracking-[0.6px]"
                      style={{
                        color: colors.textSubtle,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Theory
                    </Text>
                  </View>
                  <View
                    className="flex-1 border-l pl-3"
                    style={{ borderColor: colors.border }}
                  >
                    <Text
                      numberOfLines={1}
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {learner.instructorName?.split(" ")[0] ?? "Unassigned"}
                    </Text>
                    <Text
                      className="mt-1 text-[9px] uppercase tracking-[0.6px]"
                      style={{
                        color: colors.textSubtle,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Instructor
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </DashboardScreen>
  );
}
