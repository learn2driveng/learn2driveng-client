import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  endInstructorTrainingSession,
  fetchInstructorAssignedSession,
  markInstructorSessionAttendance,
} from "@/lib/api/training-sessions";
import { refreshInstructorOperations } from "@/lib/instructor/hydrate-instructor-operations";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import type { ApiError, InstructorLessonSummary } from "@/types";

type AttendanceStatus = "present" | "absent";
type AttendanceByParticipant = Record<string, AttendanceStatus | undefined>;
type FeedbackByParticipant = Record<string, string | undefined>;

type AttendanceLearner = NonNullable<
  InstructorLessonSummary["learners"]
>[number];

const attendanceOptions: {
  value: AttendanceStatus;
  label: string;
  icon: "account-check-outline" | "account-off-outline";
}[] = [
  {
    value: "present",
    label: "Present",
    icon: "account-check-outline",
  },
  {
    value: "absent",
    label: "Absent",
    icon: "account-off-outline",
  },
];

function lessonLearners(
  lesson: InstructorLessonSummary | undefined,
): AttendanceLearner[] {
  if (!lesson) return [];
  if (lesson.learners?.length) return lesson.learners;
  if (!lesson.participantId) return [];

  return [
    {
      participantId: lesson.participantId,
      learnerId: lesson.learnerId,
      name: lesson.learnerName,
      initials: lesson.learnerInitials,
      packageName: lesson.packageName,
      status: "scheduled",
    },
  ];
}

function initialAttendance(learners: AttendanceLearner[]) {
  return Object.fromEntries(
    learners
      .filter(
        (learner) =>
          learner.status === "present" || learner.status === "absent",
      )
      .map((learner) => [learner.participantId, learner.status]),
  ) as AttendanceByParticipant;
}

export default function InstructorLessonReportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const getLessonContext = useInstructorOperationsStore(
    (state) => state.getLessonContext,
  );
  const context = getLessonContext(lessonId);
  const learners = lessonLearners(context?.lesson);
  const [attendance, setAttendance] = useState<AttendanceByParticipant>(() =>
    initialAttendance(learners),
  );
  const [feedback, setFeedback] = useState<FeedbackByParticipant>({});
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!context) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Attendance" />
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-remove-outline"
            title="Lesson not found"
            description="This lesson is not available in the current instructor schedule."
          />
        </View>
      </DashboardScreen>
    );
  }

  const { lesson, day } = context;
  const learnersToRecord = learners.filter(
    (learner) => learner.status === "scheduled",
  );
  const allSelected = learnersToRecord.every(
    (learner) => attendance[learner.participantId],
  );
  const canSubmit = learnersToRecord.length > 0 && allSelected && !isSubmitting;
  const presentCount = learners.filter(
    (learner) => attendance[learner.participantId] === "present",
  ).length;
  const absentCount = learners.filter(
    (learner) => attendance[learner.participantId] === "absent",
  ).length;

  const selectAttendance = (participantId: string, value: AttendanceStatus) => {
    setAttendance((current) => ({ ...current, [participantId]: value }));
    if (value === "absent" && openFeedbackId === participantId) {
      setOpenFeedbackId(null);
    }
  };

  const markEveryonePresent = () => {
    setAttendance((current) => ({
      ...current,
      ...Object.fromEntries(
        learnersToRecord.map((learner) => [learner.participantId, "present"]),
      ),
    }));
  };

  const saveAttendance = async () => {
    if (!canSubmit) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await Promise.all(
        learnersToRecord.map((learner) => {
          const status = attendance[learner.participantId];
          if (!status) return Promise.resolve();

          const note = feedback[learner.participantId]?.trim();
          return markInstructorSessionAttendance(
            lesson.sessionId,
            learner.participantId,
            status,
            status === "present" && note
              ? { instructorFeedback: note }
              : undefined,
          );
        }),
      );

      const updatedSession = await fetchInstructorAssignedSession(
        lesson.sessionId,
      );
      const allAttendanceMarked = updatedSession.participants.every(
        (participant) => participant.status !== "scheduled",
      );
      if (allAttendanceMarked && updatedSession.status === "in_progress") {
        await endInstructorTrainingSession(lesson.sessionId);
      }
      await refreshInstructorOperations();
      setSubmitted(true);
    } catch (caught) {
      const error = caught as ApiError;
      setSubmitError(
        error.message ||
          "We could not save all attendance. Refresh and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <DashboardScreen>
        <View className="items-center pt-12">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.successSoft }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={32}
                color={colors.contrastText}
              />
            </View>
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            className="mt-7 text-center font-figtree-bold text-[28px]"
            style={{ color: colors.text }}
          >
            Attendance saved
          </Text>
          <Text
            className="mt-3 max-w-[310px] text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            Attendance has been recorded for {learners.length}{" "}
            {learners.length === 1 ? "learner" : "learners"}.
          </Text>
        </View>

        <View
          className="mt-8 flex-row rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <AttendanceSummary value={presentCount} label="Present" />
          <View
            className="mx-5 w-px"
            style={{ backgroundColor: colors.border }}
          />
          <AttendanceSummary value={absentCount} label="Absent" />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/instructor/attendance")}
          className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            Back to attendance
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors.onPrimary}
          />
        </Pressable>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Attendance" />

      <View
        className="mt-6 rounded-3xl border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="car-clock"
              size={21}
              color={colors.primary}
            />
          </View>
          <View className="min-w-0 flex-1">
            <Text
              className="font-figtree-bold text-[16px]"
              style={{ color: colors.text }}
            >
              {lesson.packageName}
            </Text>
            <Text
              className="mt-1 font-figtree text-[12px]"
              style={{ color: colors.textMuted }}
            >
              {day.fullLabel} · {lesson.time} · {learners.length}{" "}
              {learners.length === 1 ? "learner" : "learners"}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-8 flex-row items-end justify-between gap-4">
        <View className="flex-1">
          <SectionHeader title="Learners" />
          <Text
            className="mt-2 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            Mark each learner, then save once.
          </Text>
        </View>
        {learnersToRecord.length > 1 ? (
          <Pressable
            accessibilityRole="button"
            onPress={markEveryonePresent}
            className="min-h-11 items-center justify-center rounded-full border px-4 active:opacity-75"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="font-figtree-bold text-[12px]"
              style={{ color: colors.primary }}
            >
              All present
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="mt-4 gap-3">
        {learners.map((learner) => {
          const selectedStatus = attendance[learner.participantId];
          const alreadyRecorded = learner.status !== "scheduled";
          const feedbackOpen = openFeedbackId === learner.participantId;

          return (
            <View
              key={learner.participantId}
              className="rounded-3xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <Text
                    className="font-figtree-bold text-[12px]"
                    style={{ color: colors.text }}
                  >
                    {learner.initials}
                  </Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className="font-figtree-bold text-[14px]"
                    style={{ color: colors.text }}
                  >
                    {learner.name}
                  </Text>
                  <Text
                    className="mt-1 font-figtree text-[11px]"
                    style={{ color: colors.textMuted }}
                  >
                    {learner.packageName}
                  </Text>
                </View>
                {alreadyRecorded ? (
                  <Text
                    className="font-figtree-bold text-[10px] uppercase"
                    style={{
                      color:
                        selectedStatus === "present"
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    Recorded
                  </Text>
                ) : null}
              </View>

              <View className="mt-4 flex-row gap-2">
                {attendanceOptions.map((option) => {
                  const selected = selectedStatus === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="radio"
                      accessibilityLabel={`${learner.name}: ${option.label}`}
                      accessibilityState={{
                        selected,
                        disabled: alreadyRecorded,
                      }}
                      disabled={alreadyRecorded}
                      onPress={() =>
                        selectAttendance(learner.participantId, option.value)
                      }
                      className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border px-4 active:opacity-75"
                      style={{
                        backgroundColor: selected
                          ? option.value === "present"
                            ? colors.successSoft
                            : colors.surfaceStrong
                          : colors.surface,
                        borderColor: selected
                          ? option.value === "present"
                            ? colors.success
                            : colors.error
                          : colors.border,
                        opacity: alreadyRecorded && !selected ? 0.45 : 1,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={option.icon}
                        size={18}
                        color={
                          selected
                            ? option.value === "present"
                              ? colors.success
                              : colors.error
                            : colors.textSubtle
                        }
                      />
                      <Text
                        className="font-figtree-bold text-[12px]"
                        style={{
                          color: selected
                            ? option.value === "present"
                              ? colors.success
                              : colors.error
                            : colors.textMuted,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {!alreadyRecorded && selectedStatus === "present" ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: feedbackOpen }}
                  onPress={() =>
                    setOpenFeedbackId((current) =>
                      current === learner.participantId
                        ? null
                        : learner.participantId,
                    )
                  }
                  className="mt-3 min-h-10 flex-row items-center justify-center gap-2 rounded-full px-4 active:opacity-75"
                >
                  <MaterialCommunityIcons
                    name={feedbackOpen ? "chevron-up" : "message-plus-outline"}
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    className="font-figtree-bold text-[12px]"
                    style={{ color: colors.primary }}
                  >
                    {feedbackOpen ? "Hide note" : "Add optional note"}
                  </Text>
                </Pressable>
              ) : null}

              {feedbackOpen && selectedStatus === "present" ? (
                <View
                  className="mt-2 rounded-2xl border px-4 py-3"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                >
                  <TextInput
                    accessibilityLabel={`Optional lesson note for ${learner.name}`}
                    multiline
                    maxLength={500}
                    onChangeText={(value) =>
                      setFeedback((current) => ({
                        ...current,
                        [learner.participantId]: value,
                      }))
                    }
                    placeholder="Add a short observation"
                    placeholderTextColor={colors.textFaint}
                    textAlignVertical="top"
                    value={feedback[learner.participantId] ?? ""}
                    className="min-h-20 font-figtree text-[13px] leading-5"
                    style={{ color: colors.text }}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        accessibilityHint={
          canSubmit
            ? "Saves attendance for every learner"
            : "Mark every learner present or absent"
        }
        disabled={!canSubmit}
        onPress={() => void saveAttendance()}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
        style={{
          backgroundColor: canSubmit ? colors.primary : colors.surfaceStrong,
        }}
      >
        <MaterialCommunityIcons
          name="clipboard-check-outline"
          size={20}
          color={canSubmit ? colors.onPrimary : colors.textSubtle}
        />
        <Text
          className="font-figtree-bold text-[15px]"
          style={{ color: canSubmit ? colors.onPrimary : colors.textSubtle }}
        >
          {isSubmitting ? "Saving…" : "Save attendance"}
        </Text>
      </Pressable>

      {submitError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 text-center font-figtree-medium text-[12px]"
          style={{ color: colors.error }}
        >
          {submitError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}

function AttendanceSummary({ value, label }: { value: number; label: string }) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-1 items-center">
      <Text
        className="font-figtree-bold text-[24px]"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
      <Text
        className="mt-1 font-figtree text-[12px]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </Text>
    </View>
  );
}
