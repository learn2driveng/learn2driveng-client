import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { assessmentAreaMeta } from "@/features/readiness-assessment";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";
import type { AssessmentAttempt } from "@/types";

type ScreenMode = "intro" | "question" | "result";

export default function LearnerAssessmentScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const currentLearnerId = useAuthStore((state) => state.user?.id);
  const assignments = useReadinessAssessmentStore((state) => state.assignments);
  const assessments = useReadinessAssessmentStore((state) => state.assessments);
  const completedAssessmentAnswers = useReadinessAssessmentStore((state) => state.completedAssessmentAnswers);
  const attempts = useReadinessAssessmentStore((state) => state.attempts);
  const startAssessment = useReadinessAssessmentStore(
    (state) => state.startAssessment,
  );
  const submitAssessment = useReadinessAssessmentStore(
    (state) => state.submitAssessment,
  );
  const refreshLearner = useReadinessAssessmentStore((state) => state.refreshLearner);
  const loading = useReadinessAssessmentStore((state) => state.loading);
  const loadError = useReadinessAssessmentStore((state) => state.error);
  useFocusEffect(useCallback(() => { void refreshLearner(); }, [refreshLearner]));
  const assignment = assignments.find(
    (item) => item.id === assignmentId && item.learnerId === currentLearnerId,
  );
  const assessment = completedAssessmentAnswers[assignmentId ?? ""] ?? assessments.find(
    (item) => item.id === assignment?.assessmentId,
  );
  const existingAttempt = attempts.find(
    (item) => item.id === assignment?.latestAttemptId,
  );
  const [mode, setMode] = useState<ScreenMode>(
    existingAttempt ? "result" : "intro",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittedAttempt, setSubmittedAttempt] =
    useState<AssessmentAttempt | null>(existingAttempt ?? null);
  const [working, setWorking] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const resultAttempt = submittedAttempt ?? existingAttempt;

  if (!assignment || !assessment) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Assessment" />
        {loading ? <ActivityIndicator className="mt-8" color={colors.primary} /> : (
        <View className="mt-8">
          <ContentEmptyState
            icon="clipboard-alert-outline"
            title={loadError ? "Could not load assessment" : "Assessment unavailable"}
            description={loadError ?? "This assignment may have been removed by your school."}
          />
          {loadError ? <Pressable onPress={() => void refreshLearner()} className="mt-4 rounded-full p-4" style={{ backgroundColor: colors.primary }}><Text style={{ color: colors.onPrimary }}>Try again</Text></Pressable> : null}
        </View>
        )}
      </DashboardScreen>
    );
  }

  const meta = assessmentAreaMeta[assessment.area];
  const question = assessment.questions[questionIndex];
  const currentAnswer = question ? answers[question.id] : undefined;

  if (resultAttempt && (mode === "result" || assignment.status === "completed")) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Assessment result" />
        <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-6">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name={
                resultAttempt.passed ? "trophy-outline" : "refresh-circle"
              }
              size={29}
              color={colors.onPrimary}
            />
          </View>
          <Text
            className="mt-5 text-[34px] leading-10"
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {resultAttempt.score}%
          </Text>
          <Text
            className="mt-2 text-[18px]"
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {resultAttempt.passed
              ? assessment.kind === "final_mock" ? "Mock quiz passed" : "Progress check passed"
              : "Review and practise"}
          </Text>
          <Text
            className="mt-2 text-[12px] leading-5"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {resultAttempt.passed
              ? "Your quiz result has been shared with your school. It does not change your package status."
              : `The pass mark is ${assessment.passingScore}%. Use the explanations below with your instructor.`}
          </Text>
        </HeroSurface>

        <Text
          accessibilityRole="header"
          className="mt-8 text-[20px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Answer review
        </Text>
        <View className="mt-4 gap-4">
          {assessment.questions.map((item, index) => {
            const selected = resultAttempt.answers[item.id];
            const correct = selected === item.correctOptionId;
            return (
              <View
                key={item.id}
                className="rounded-3xl border p-4"
                style={surfaces.card}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: correct
                        ? colors.successSoft
                        : colors.verifiedSoft,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={correct ? "check" : "close"}
                      size={19}
                      color={correct ? colors.success : colors.verified}
                    />
                  </View>
                  <Text
                    className="flex-1 text-[13px] leading-5"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {index + 1}. {item.prompt}
                  </Text>
                </View>
                <Text
                  className="mt-4 text-[11px] leading-5"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtree,
                  }}
                >
                  {item.explanation}
                </Text>
              </View>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/student/progress/assessments")}
          className="mt-6 h-14 items-center justify-center rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Back to assessments
          </Text>
        </Pressable>
        {actionError ? (
          <Text className="mt-3 text-[12px]" style={{ color: colors.verified }}>
            {actionError}
          </Text>
        ) : null}
      </DashboardScreen>
    );
  }

  if (mode === "question" && question) {
    const progress = ((questionIndex + 1) / assessment.questions.length) * 100;
    return (
      <DashboardScreen>
        <DashboardPageHeader title={assessment.title} />
        <View className="mt-6 flex-row items-center justify-between">
          <Text
            className="text-[11px] uppercase tracking-[0.8px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Question {questionIndex + 1} of {assessment.questions.length}
          </Text>
          <Text
            className="text-[11px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
        <View
          className="mt-3 h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <View
            className="h-full rounded-full"
            style={{ backgroundColor: colors.primary, width: `${progress}%` }}
          />
        </View>

        {question.scenario ? (
          <View
            className="mt-7 rounded-3xl border p-4"
            style={{
              backgroundColor: colors.verifiedSoft,
              borderColor: colors.verified,
            }}
          >
            <Text
              className="text-[10px] uppercase tracking-[0.8px]"
              style={{
                color: colors.verified,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Road scenario
            </Text>
            <Text
              className="mt-2 text-[13px] leading-5"
              style={{
                color: colors.text,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {question.scenario}
            </Text>
          </View>
        ) : null}

        <Text
          accessibilityRole="header"
          className="mt-7 text-[22px] leading-7 tracking-[-0.4px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {question.prompt}
        </Text>

        <View className="mt-5 gap-3">
          {question.options.map((option, index) => {
            const selected = currentAnswer === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() =>
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: option.id,
                  }))
                }
                className="min-h-[64px] flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
                style={{
                  ...surfaces.card,
                  backgroundColor: selected
                    ? colors.verifiedSoft
                    : colors.surface,
                  borderColor: selected ? colors.verified : colors.border,
                }}
              >
                <View
                  className="h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: selected
                      ? colors.primary
                      : colors.surfaceStrong,
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
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  className="flex-1 text-[13px] leading-5"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeSemibold,
                  }}
                >
                  {option.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !currentAnswer || working }}
          disabled={!currentAnswer || working}
          onPress={async () => {
            const isLast = questionIndex === assessment.questions.length - 1;
            if (!isLast) {
              setQuestionIndex((current) => current + 1);
              return;
            }
            setWorking(true);
            setActionError(null);
            try {
              const attempt = await submitAssessment(assignment.id, answers);
              setSubmittedAttempt(attempt);
              setMode("result");
            } catch (cause) {
              setActionError(
                cause && typeof cause === "object" && "message" in cause
                  ? String(cause.message)
                  : "Could not submit your answers. Please try again.",
              );
            } finally {
              setWorking(false);
            }
          }}
          className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{
            backgroundColor: currentAnswer
              ? colors.primary
              : colors.surfaceStrong,
          }}
        >
          <Text
            className="text-[14px]"
            style={{
              color: currentAnswer ? colors.onPrimary : colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {working ? "Submitting…" : questionIndex === assessment.questions.length - 1
              ? "Submit assessment"
              : "Next question"}
          </Text>
          {working ? <ActivityIndicator color={colors.onPrimary} /> : null}
          <MaterialCommunityIcons
            name="arrow-right"
            size={19}
            color={currentAnswer ? colors.onPrimary : colors.textSubtle}
          />
        </Pressable>
        {actionError ? (
          <Text className="mt-3 text-[12px]" style={{ color: colors.verified }}>
            {actionError}
          </Text>
        ) : null}
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Assessment briefing" />
      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-6">
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name={meta.icon}
            size={28}
            color={colors.onPrimary}
          />
        </View>
        <Text
          className="mt-5 text-[25px] leading-8 tracking-[-0.5px]"
          style={{
            color: colors.contrastText,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {assessment.title}
        </Text>
        <Text
          className="mt-3 text-[12px] leading-5"
          style={{
            color: colors.contrastMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          {assessment.description}
        </Text>
      </HeroSurface>

      <View className="mt-5 flex-row gap-3">
        {[
          [`${assessment.questions.length}`, "Questions"],
          [`${assessment.durationMinutes} min`, "Estimate"],
          [`${assessment.passingScore}%`, "Pass mark"],
        ].map(([value, label]) => (
          <View
            key={label}
            className="flex-1 rounded-2xl border p-3"
            style={surfaces.card}
          >
            <Text
              className="text-[15px]"
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

      <View className="mt-8 rounded-3xl border p-5" style={surfaces.card}>
        <Text
          className="text-[16px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Before you begin
        </Text>
        {[
          "Choose the safest response, not only the fastest one.",
          "You can move forward after selecting an answer.",
          "Your result and learning needs are shared with your school.",
        ].map((item) => (
          <View key={item} className="mt-4 flex-row items-start gap-3">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={19}
              color={colors.success}
            />
            <Text
              className="flex-1 text-[12px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {item}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: working }}
        disabled={working}
        onPress={async () => {
          setWorking(true);
          setActionError(null);
          try {
            await startAssessment(assignment.id);
            setMode("question");
          } catch (cause) {
            setActionError(
              cause && typeof cause === "object" && "message" in cause
                ? String(cause.message)
                : "Could not start the assessment. Please try again.",
            );
          } finally {
            setWorking(false);
          }
        }}
        className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <Text
          className="text-[14px]"
          style={{
            color: colors.onPrimary,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {working ? "Starting…" : "Start assessment"}
        </Text>
        {working ? <ActivityIndicator color={colors.onPrimary} /> : <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />}
      </Pressable>
      {actionError ? (
        <Text className="mt-3 text-[12px]" style={{ color: colors.verified }}>
          {actionError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
