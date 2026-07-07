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
import { getInstructorLessonContext } from "@/sample_data/instructor";

type AttendanceStatus = "present" | "late" | "absent";
type SkillRating = "needs_practice" | "developing" | "confident";
type SkillId = "vehicle_control" | "observation" | "junctions" | "parking";

const attendanceOptions: {
  value: AttendanceStatus;
  label: string;
  icon: "account-check-outline" | "clock-alert-outline" | "account-off-outline";
}[] = [
  {
    value: "present",
    label: "Present",
    icon: "account-check-outline",
  },
  {
    value: "late",
    label: "Late",
    icon: "clock-alert-outline",
  },
  {
    value: "absent",
    label: "Absent",
    icon: "account-off-outline",
  },
];

const skills: { id: SkillId; label: string }[] = [
  { id: "vehicle_control", label: "Vehicle control" },
  { id: "observation", label: "Observation and mirrors" },
  { id: "junctions", label: "Junctions and traffic" },
  { id: "parking", label: "Parking and manoeuvres" },
];

const ratings: { value: SkillRating; label: string }[] = [
  { value: "needs_practice", label: "Needs practice" },
  { value: "developing", label: "Developing" },
  { value: "confident", label: "Confident" },
];

const emptySkillRatings: Record<SkillId, SkillRating | null> = {
  vehicle_control: null,
  observation: null,
  junctions: null,
  parking: null,
};

export default function InstructorLessonReportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const context = getInstructorLessonContext(lessonId);
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(null);
  const [skillRatings, setSkillRatings] = useState(emptySkillRatings);
  const [notes, setNotes] = useState("");
  const [nextFocus, setNextFocus] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!context) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Attendance and report" />
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
  const allSkillsRated = skills.every(
    (skill) => skillRatings[skill.id] !== null,
  );
  const canSubmit =
    attendance !== null && (attendance === "absent" || allSkillsRated);
  const selectAttendance = (value: AttendanceStatus) => {
    setAttendance(value);
    if (value === "absent") setSkillRatings(emptySkillRatings);
  };

  if (submitted) {
    const attendanceLabel =
      attendanceOptions.find((item) => item.value === attendance)?.label ??
      "Recorded";

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
            Report submitted
          </Text>
          <Text
            className="mt-3 max-w-[310px] text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            Attendance and lesson feedback for {lesson.learnerName} have been
            recorded.
          </Text>
        </View>

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <ReportSummaryRow label="Learner" value={lesson.learnerName} />
          <ReportSummaryRow label="Lesson" value={lesson.packageName} />
          <ReportSummaryRow label="Attendance" value={attendanceLabel} last />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/instructor/schedule")}
          className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            Back to schedule
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
      <DashboardPageHeader title="Attendance and report" />

      <View
        className="mt-6 flex-row items-center rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <Text
            className="font-figtree-bold text-[13px]"
            style={{ color: colors.text }}
          >
            {lesson.learnerInitials}
          </Text>
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="font-figtree-bold text-[16px]"
            style={{ color: colors.text }}
          >
            {lesson.learnerName}
          </Text>
          <Text
            className="mt-1 font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {day.fullLabel} · {lesson.packageName}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="check-circle"
          size={22}
          color={colors.success}
        />
      </View>

      <View className="mt-9">
        <SectionHeader title="Attendance" />
        <Text
          className="mt-2 font-figtree text-[13px]"
          style={{ color: colors.textMuted }}
        >
          Confirm whether the learner attended this lesson.
        </Text>
        <View className="mt-4 flex-row gap-2">
          {attendanceOptions.map((item) => {
            const selected = attendance === item.value;

            return (
              <Pressable
                key={item.value}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => selectAttendance(item.value)}
                className="min-h-24 flex-1 items-center justify-center rounded-2xl border p-3 active:opacity-75"
                style={{
                  backgroundColor: selected
                    ? colors.surfaceStrong
                    : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={23}
                  color={selected ? colors.primary : colors.textSubtle}
                />
                <Text
                  className="mt-2 text-center font-figtree-bold text-[11px]"
                  style={{ color: colors.text }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {attendance === "absent" ? (
        <View
          className="mt-7 flex-row items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: colors.verifiedSoft }}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.verified}
          />
          <Text
            className="flex-1 font-figtree-medium text-[12px] leading-5"
            style={{ color: colors.verified }}
          >
            Skill ratings are not required when the learner is absent. You may
            add a note explaining the absence.
          </Text>
        </View>
      ) : null}

      {attendance !== "absent" ? (
        <View className="mt-9">
          <SectionHeader title="Skill assessment" />
          <Text
            className="mt-2 font-figtree text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Rate the learner’s performance during this lesson.
          </Text>
          <View className="mt-4 gap-3">
            {skills.map((skill) => (
              <View
                key={skill.id}
                className="rounded-3xl border p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="font-figtree-bold text-[14px]"
                  style={{ color: colors.text }}
                >
                  {skill.label}
                </Text>
                <View className="mt-3 flex-row gap-2">
                  {ratings.map((rating) => {
                    const selected = skillRatings[skill.id] === rating.value;

                    return (
                      <Pressable
                        key={rating.value}
                        accessibilityRole="radio"
                        accessibilityLabel={`${skill.label}: ${rating.label}`}
                        accessibilityState={{ selected }}
                        onPress={() =>
                          setSkillRatings((current) => ({
                            ...current,
                            [skill.id]: rating.value,
                          }))
                        }
                        className="min-h-12 flex-1 items-center justify-center rounded-xl border px-2 active:opacity-75"
                        style={{
                          backgroundColor: selected
                            ? colors.primary
                            : colors.surface,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-center font-figtree-bold text-[11px]"
                          style={{
                            color: selected
                              ? colors.onPrimary
                              : colors.textMuted,
                          }}
                        >
                          {rating.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-9">
        <SectionHeader title="Instructor notes" />
        <Text
          className="mt-2 font-figtree text-[13px]"
          style={{ color: colors.textMuted }}
        >
          Record useful observations for the learner and school.
        </Text>
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <TextInput
            accessibilityLabel="Instructor lesson notes"
            multiline
            maxLength={500}
            onChangeText={setNotes}
            placeholder="What went well? What needs more practice?"
            placeholderTextColor={colors.textFaint}
            textAlignVertical="top"
            value={notes}
            className="min-h-28 font-figtree text-[14px] leading-5"
            style={{ color: colors.text }}
          />
          <Text
            className="mt-2 self-end font-figtree text-[10px]"
            style={{ color: colors.textSubtle }}
          >
            {notes.length}/500
          </Text>
        </View>
      </View>

      {attendance !== "absent" ? (
        <View className="mt-7">
          <Text
            className="font-figtree-bold text-[12px] uppercase tracking-[1px]"
            style={{ color: colors.textSubtle }}
          >
            Next lesson focus
          </Text>
          <TextInput
            accessibilityLabel="Recommended focus for the next lesson"
            maxLength={160}
            onChangeText={setNextFocus}
            placeholder="e.g. Earlier mirror checks before lane changes"
            placeholderTextColor={colors.textFaint}
            value={nextFocus}
            className="mt-3 min-h-14 rounded-full border px-5 font-figtree text-[13px]"
            style={{
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSubmit }}
        accessibilityHint={
          canSubmit
            ? "Submits attendance and the lesson report"
            : "Select attendance and complete each required skill rating"
        }
        disabled={!canSubmit}
        onPress={() => setSubmitted(true)}
        className="mt-9 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor: canSubmit ? colors.primary : colors.surfaceStrong,
        }}
      >
        <MaterialCommunityIcons
          name="send-check-outline"
          size={20}
          color={canSubmit ? colors.onPrimary : colors.textSubtle}
        />
        <Text
          className="font-figtree-bold text-[15px]"
          style={{
            color: canSubmit ? colors.onPrimary : colors.textSubtle,
          }}
        >
          Submit lesson report
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}

type ReportSummaryRowProps = {
  label: string;
  value: string;
  last?: boolean;
};

function ReportSummaryRow({
  label,
  value,
  last = false,
}: ReportSummaryRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-row items-start justify-between gap-5 py-3"
      style={
        last ? undefined : { borderBottomWidth: 1, borderColor: colors.border }
      }
    >
      <Text
        className="font-figtree text-[12px]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </Text>
      <Text
        className="max-w-[62%] text-right font-figtree-bold text-[12px]"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
    </View>
  );
}
