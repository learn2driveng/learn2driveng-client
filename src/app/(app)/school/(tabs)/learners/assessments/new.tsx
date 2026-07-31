import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { assessmentAreaMeta } from "@/features/readiness-assessment";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";
import type {
  AssessmentQuestion,
  ReadinessArea,
  ReadinessAssessment,
} from "@/types";

type BuilderStep = "details" | "questions" | "review";

type QuestionDraft = {
  prompt: string;
  scenario: string;
  options: [string, string, string, string];
  correctOptionId: string | null;
  explanation: string;
};

const areas = Object.entries(assessmentAreaMeta) as [
  ReadinessArea,
  (typeof assessmentAreaMeta)[ReadinessArea],
][];
const passMarks = [60, 70, 75, 80];
const durations = [5, 10, 15, 20];
const optionIds = ["a", "b", "c", "d"] as const;

function emptyQuestion(): QuestionDraft {
  return {
    prompt: "",
    scenario: "",
    options: ["", "", "", ""],
    correctOptionId: null,
    explanation: "",
  };
}

function BuilderField({
  label,
  multiline = false,
  ...props
}: TextInputProps & { label: string }) {
  const { colors } = useAppTheme();

  return (
    <View>
      <Text
        className="mb-2 text-[10px] uppercase tracking-[0.8px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor={colors.textSubtle}
        textAlignVertical={multiline ? "top" : "center"}
        className={`rounded-2xl border px-4 text-[13px] ${
          multiline ? "min-h-[104px] py-4" : "h-14"
        }`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
        }}
      />
    </View>
  );
}

export default function NewSchoolAssessmentScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const createAssessment = useReadinessAssessmentStore(
    (state) => state.createAssessment,
  );
  const [step, setStep] = useState<BuilderStep>("details");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState<ReadinessArea>("road_rules");
  const [passingScore, setPassingScore] = useState(70);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [questionDraft, setQuestionDraft] =
    useState<QuestionDraft>(emptyQuestion);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detailComplete =
    title.trim().length >= 4 && description.trim().length >= 12;
  const currentQuestionStarted =
    questionDraft.prompt.trim().length > 0 ||
    questionDraft.options.some((option) => option.trim().length > 0);

  const saveQuestion = () => {
    const complete =
      questionDraft.prompt.trim().length >= 6 &&
      questionDraft.options.every((option) => option.trim().length >= 1) &&
      questionDraft.correctOptionId !== null &&
      questionDraft.explanation.trim().length >= 8;

    if (!complete) {
      setError(
        "Add a clear prompt, four options, the correct answer, and a teaching explanation.",
      );
      return;
    }

    const question: AssessmentQuestion = {
      id:
        editingIndex === null
          ? `question-${Date.now().toString(36)}`
          : questions[editingIndex].id,
      prompt: questionDraft.prompt.trim(),
      scenario: questionDraft.scenario.trim() || null,
      options: questionDraft.options.map((option, index) => ({
        id: optionIds[index],
        text: option.trim(),
      })),
      correctOptionId: questionDraft.correctOptionId!,
      explanation: questionDraft.explanation.trim(),
    };

    setQuestions((current) => {
      if (editingIndex === null) return [...current, question];
      return current.map((item, index) =>
        index === editingIndex ? question : item,
      );
    });
    setQuestionDraft(emptyQuestion());
    setEditingIndex(null);
    setError(null);
  };

  const editQuestion = (question: AssessmentQuestion, index: number) => {
    setQuestionDraft({
      prompt: question.prompt,
      scenario: question.scenario ?? "",
      options: [
        question.options[0]?.text ?? "",
        question.options[1]?.text ?? "",
        question.options[2]?.text ?? "",
        question.options[3]?.text ?? "",
      ],
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
    });
    setEditingIndex(index);
    setError(null);
  };

  const publishAssessment = () => {
    const input: Omit<
      ReadinessAssessment,
      "id" | "schoolId" | "createdAt" | "status"
    > = {
      createdBy: profile.adminName,
      title: title.trim(),
      description: description.trim(),
      area,
      durationMinutes,
      passingScore,
      questions,
    };
    createAssessment(input);
    router.replace("/school/learners/assessments");
  };

  const stepNumber = step === "details" ? 1 : step === "questions" ? 2 : 3;

  return (
    <DashboardScreen scrollResetKey={step}>
      <DashboardPageHeader title="Create assessment" />

      <View className="mt-6 flex-row items-center gap-2">
        {["Details", "Questions", "Review"].map((label, index) => {
          const number = index + 1;
          const active = number === stepNumber;
          const complete = number < stepNumber;
          return (
            <View key={label} className="flex-1">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      active || complete
                        ? colors.primary
                        : colors.surfaceStrong,
                  }}
                >
                  {complete ? (
                    <MaterialCommunityIcons
                      name="check"
                      size={15}
                      color={colors.onPrimary}
                    />
                  ) : (
                    <Text
                      className="text-[10px]"
                      style={{
                        color: active ? colors.onPrimary : colors.textSubtle,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {number}
                    </Text>
                  )}
                </View>
                <Text
                  className="text-[10px]"
                  style={{
                    color: active ? colors.text : colors.textSubtle,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {step === "details" ? (
        <>
          <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialCommunityIcons
                name="clipboard-edit-outline"
                size={25}
                color={colors.onPrimary}
              />
            </View>
            <Text
              className="mt-4 text-[20px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Define the learning goal
            </Text>
            <Text
              className="mt-2 text-[12px] leading-5"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Keep one assessment focused on one competency so the result gives
              instructors a useful training signal.
            </Text>
          </HeroSurface>

          <View className="mt-7 gap-5">
            <BuilderField
              label="Assessment title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Junction decisions"
              maxLength={70}
            />
            <BuilderField
              label="Learning objective"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what this assessment should verify"
              multiline
              maxLength={240}
            />

            <View>
              <Text
                className="mb-3 text-[10px] uppercase tracking-[0.8px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Competency area
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {areas.map(([value, meta]) => {
                  const selected = area === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setArea(value)}
                      className="min-h-11 flex-row items-center gap-2 rounded-full border px-4 active:opacity-75"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={meta.icon}
                        size={17}
                        color={selected ? colors.onPrimary : colors.textMuted}
                      />
                      <Text
                        className="text-[11px]"
                        style={{
                          color: selected ? colors.onPrimary : colors.textMuted,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {meta.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text
                className="mb-3 text-[10px] uppercase tracking-[0.8px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Pass mark
              </Text>
              <View className="flex-row gap-2">
                {passMarks.map((value) => {
                  const selected = passingScore === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setPassingScore(value)}
                      className="min-h-11 flex-1 items-center justify-center rounded-2xl border active:opacity-75"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        className="text-[12px]"
                        style={{
                          color: selected ? colors.onPrimary : colors.textMuted,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {value}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View>
              <Text
                className="mb-3 text-[10px] uppercase tracking-[0.8px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Estimated duration
              </Text>
              <View className="flex-row gap-2">
                {durations.map((value) => {
                  const selected = durationMinutes === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setDurationMinutes(value)}
                      className="min-h-11 flex-1 items-center justify-center rounded-2xl border active:opacity-75"
                      style={{
                        backgroundColor: selected
                          ? colors.surfaceStrong
                          : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        className="text-[12px]"
                        style={{
                          color: selected ? colors.text : colors.textMuted,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {value} min
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !detailComplete }}
            disabled={!detailComplete}
            onPress={() => setStep("questions")}
            className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: detailComplete
                ? colors.primary
                : colors.surfaceStrong,
            }}
          >
            <Text
              className="text-[14px]"
              style={{
                color: detailComplete ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Build questions
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={detailComplete ? colors.onPrimary : colors.textSubtle}
            />
          </Pressable>
        </>
      ) : null}

      {step === "questions" ? (
        <>
          <View className="mt-7 flex-row items-end justify-between gap-4">
            <View className="flex-1">
              <Text
                accessibilityRole="header"
                className="text-[22px] leading-7"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Write useful questions
              </Text>
              <Text
                className="mt-2 text-[12px] leading-5"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                Add at least two. Each answer needs an explanation the learner
                can use after submission.
              </Text>
            </View>
            <View
              className="rounded-full px-3 py-2"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {questions.length} saved
              </Text>
            </View>
          </View>

          {questions.length ? (
            <View className="mt-5 gap-3">
              {questions.map((question, index) => (
                <View
                  key={question.id}
                  className="flex-row items-center gap-3 rounded-3xl border p-4"
                  style={surfaces.card}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: colors.successSoft }}
                  >
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      numberOfLines={2}
                      className="text-[12px] leading-5"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {index + 1}. {question.prompt}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit question ${index + 1}`}
                    onPress={() => editQuestion(question, index)}
                    className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={18}
                      color={colors.text}
                    />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}

          <View
            className="mt-6 gap-5 rounded-[28px] border p-5"
            style={surfaces.card}
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-[16px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {editingIndex === null
                  ? `Question ${questions.length + 1}`
                  : `Edit question ${editingIndex + 1}`}
              </Text>
              {editingIndex !== null ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setEditingIndex(null);
                    setQuestionDraft(emptyQuestion());
                    setError(null);
                  }}
                  className="min-h-10 justify-center px-2"
                >
                  <Text
                    className="text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    Cancel edit
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <BuilderField
              label="Question prompt"
              value={questionDraft.prompt}
              onChangeText={(value) =>
                setQuestionDraft((current) => ({ ...current, prompt: value }))
              }
              placeholder="Ask for the safest or correct decision"
              multiline
              maxLength={220}
            />
            <BuilderField
              label="Road scenario · Optional"
              value={questionDraft.scenario}
              onChangeText={(value) =>
                setQuestionDraft((current) => ({ ...current, scenario: value }))
              }
              placeholder="Add context the learner should consider"
              multiline
              maxLength={260}
            />

            <View>
              <Text
                className="mb-3 text-[10px] uppercase tracking-[0.8px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Answer options · Tap the correct one
              </Text>
              <View className="gap-3">
                {optionIds.map((optionId, index) => {
                  const correct = questionDraft.correctOptionId === optionId;
                  return (
                    <View
                      key={optionId}
                      className="flex-row items-center gap-3"
                    >
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityLabel={`Mark option ${optionId.toUpperCase()} correct`}
                        accessibilityState={{ checked: correct }}
                        onPress={() =>
                          setQuestionDraft((current) => ({
                            ...current,
                            correctOptionId: optionId,
                          }))
                        }
                        className="h-10 w-10 items-center justify-center rounded-full border active:opacity-75"
                        style={{
                          backgroundColor: correct
                            ? colors.success
                            : colors.surfaceStrong,
                          borderColor: correct ? colors.success : colors.border,
                        }}
                      >
                        {correct ? (
                          <MaterialCommunityIcons
                            name="check"
                            size={18}
                            color={colors.onDark}
                          />
                        ) : (
                          <Text
                            className="text-[11px] uppercase"
                            style={{
                              color: colors.textMuted,
                              fontFamily: fontFamily.figtreeBold,
                            }}
                          >
                            {optionId}
                          </Text>
                        )}
                      </Pressable>
                      <TextInput
                        accessibilityLabel={`Option ${optionId.toUpperCase()}`}
                        value={questionDraft.options[index]}
                        onChangeText={(value) =>
                          setQuestionDraft((current) => {
                            const options = [
                              ...current.options,
                            ] as QuestionDraft["options"];
                            options[index] = value;
                            return { ...current, options };
                          })
                        }
                        placeholder={`Option ${optionId.toUpperCase()}`}
                        placeholderTextColor={colors.textSubtle}
                        className="h-12 flex-1 rounded-2xl border px-4 text-[13px]"
                        style={{
                          backgroundColor: colors.surface,
                          borderColor: correct ? colors.success : colors.border,
                          color: colors.text,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            <BuilderField
              label="Answer explanation"
              value={questionDraft.explanation}
              onChangeText={(value) =>
                setQuestionDraft((current) => ({
                  ...current,
                  explanation: value,
                }))
              }
              placeholder="Explain why the selected answer is safest or correct"
              multiline
              maxLength={300}
            />

            {error ? (
              <View
                className="flex-row items-start gap-2 rounded-2xl px-4 py-3"
                style={{ backgroundColor: colors.verifiedSoft }}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.verified}
                />
                <Text
                  className="flex-1 text-[11px] leading-4"
                  style={{
                    color: colors.verified,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={saveQuestion}
              className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
              style={{ backgroundColor: colors.contrastSurface }}
            >
              <MaterialCommunityIcons
                name={editingIndex === null ? "plus" : "content-save-outline"}
                size={19}
                color={colors.primary}
              />
              <Text
                className="text-[13px]"
                style={{
                  color: colors.contrastText,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {editingIndex === null ? "Add question" : "Save changes"}
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep("details")}
              className="h-14 flex-1 items-center justify-center rounded-full border active:opacity-75"
              style={surfaces.card}
            >
              <Text
                className="text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Back
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                disabled: questions.length < 2 || currentQuestionStarted,
              }}
              disabled={questions.length < 2 || currentQuestionStarted}
              onPress={() => setStep("review")}
              className="h-14 flex-[1.6] items-center justify-center rounded-full active:opacity-80"
              style={{
                backgroundColor:
                  questions.length >= 2 && !currentQuestionStarted
                    ? colors.primary
                    : colors.surfaceStrong,
              }}
            >
              <Text
                className="text-[13px]"
                style={{
                  color:
                    questions.length >= 2 && !currentQuestionStarted
                      ? colors.onPrimary
                      : colors.textSubtle,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Review assessment
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}

      {step === "review" ? (
        <>
          <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
            <View className="flex-row items-start gap-4">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.primary }}
              >
                <MaterialCommunityIcons
                  name={assessmentAreaMeta[area].icon}
                  size={25}
                  color={colors.onPrimary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[20px] leading-6"
                  style={{
                    color: colors.contrastText,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {title.trim()}
                </Text>
                <Text
                  className="mt-2 text-[11px] leading-4"
                  style={{
                    color: colors.contrastMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {description.trim()}
                </Text>
              </View>
            </View>
            <View className="mt-5 flex-row gap-5">
              <Text
                className="text-[11px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {questions.length} questions
              </Text>
              <Text
                className="text-[11px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {durationMinutes} min
              </Text>
              <Text
                className="text-[11px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Pass {passingScore}%
              </Text>
            </View>
          </HeroSurface>

          <View
            className="mt-5 flex-row items-start gap-3 rounded-3xl border p-4"
            style={{
              backgroundColor: colors.verifiedSoft,
              borderColor: colors.verified,
            }}
          >
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={22}
              color={colors.verified}
            />
            <View className="flex-1">
              <Text
                className="text-[12px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                School-owned content
              </Text>
              <Text
                className="mt-1 text-[11px] leading-4"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                Publishing makes this assessment available to your school for
                learner assignment. {profile.adminName} will be recorded as the
                creator.
              </Text>
            </View>
          </View>

          <Text
            accessibilityRole="header"
            className="mt-8 text-[20px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Question review
          </Text>
          <View className="mt-4 gap-4">
            {questions.map((question, index) => {
              const correctAnswer = question.options.find(
                (option) => option.id === question.correctOptionId,
              );
              return (
                <View
                  key={question.id}
                  className="rounded-3xl border p-4"
                  style={surfaces.card}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-9 w-9 items-center justify-center rounded-xl"
                      style={{ backgroundColor: colors.surfaceStrong }}
                    >
                      <Text
                        className="text-[11px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      className="flex-1 text-[13px] leading-5"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {question.prompt}
                    </Text>
                  </View>
                  <View
                    className="mt-4 rounded-2xl px-4 py-3"
                    style={{ backgroundColor: colors.successSoft }}
                  >
                    <Text
                      className="text-[10px] uppercase tracking-[0.6px]"
                      style={{
                        color: colors.success,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Correct answer
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeSemibold,
                      }}
                    >
                      {correctAnswer?.text}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View className="mt-7 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep("questions")}
              className="h-14 flex-1 items-center justify-center rounded-full border active:opacity-75"
              style={surfaces.card}
            >
              <Text
                className="text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Edit
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={publishAssessment}
              className="h-14 flex-[1.7] flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialCommunityIcons
                name="publish"
                size={19}
                color={colors.onPrimary}
              />
              <Text
                className="text-[13px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Publish assessment
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </DashboardScreen>
  );
}
