import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { toInstructorLessonStatus } from "@/features/instructor";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function InstructorLessonDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const getLessonContext = useInstructorOperationsStore(
    (state) => state.getLessonContext,
  );
  const context = getLessonContext(lessonId);
  const sessionStatus = useTrainingSessionStore(
    (state) => state.sessions[context?.lesson.sessionId ?? ""]?.status,
  );

  if (!context) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Lesson details" />
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
  const lessonStatus = toInstructorLessonStatus(sessionStatus, lesson.status);
  const statusStyle = {
    scheduled: {
      label: "Upcoming lesson",
      color: colors.verified,
      background: colors.verifiedSoft,
    },
    in_progress: {
      label: "Lesson in progress",
      color: colors.onPrimary,
      background: colors.primary,
    },
    completed: {
      label: "Lesson completed",
      color: colors.success,
      background: colors.successSoft,
    },
    cancelled: {
      label: "Lesson cancelled",
      color: colors.error,
      background: colors.surfaceStrong,
    },
    missed: {
      label: "Lesson missed",
      color: colors.error,
      background: colors.surfaceStrong,
    },
  }[lessonStatus];
  const canOpenSession =
    lessonStatus === "scheduled" || lessonStatus === "in_progress";

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Lesson details" />

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: statusStyle.background }}
          >
            <Text
              className="font-figtree-bold text-[10px] uppercase tracking-[0.6px]"
              style={{ color: statusStyle.color }}
            >
              {statusStyle.label}
            </Text>
          </View>
          <Text
            className="font-figtree-medium text-[12px]"
            style={{ color: colors.contrastMuted }}
          >
            {lesson.duration}
          </Text>
        </View>

        <Text
          className="mt-5 font-figtree-bold text-[38px] tracking-[-1px]"
          style={{ color: colors.contrastText }}
        >
          {lesson.time}
        </Text>
        <Text
          className="mt-1 font-figtree text-[13px]"
          style={{ color: colors.contrastMuted }}
        >
          {day.fullLabel}
        </Text>

        <View
          className="mt-5 flex-row items-center border-t pt-5"
          style={{ borderTopColor: colors.contrastBorder }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-figtree-bold text-[13px]"
              style={{ color: colors.onPrimary }}
            >
              {lesson.learnerInitials}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="font-figtree-bold text-[18px]"
              style={{ color: colors.contrastText }}
            >
              {lesson.learnerName}
            </Text>
            <Text
              className="mt-1 font-figtree text-[12px]"
              style={{ color: colors.contrastMuted }}
            >
              {lesson.packageName}
            </Text>
          </View>
        </View>
      </View>

      {lesson.learners && lesson.learners.length > 0 ? (
        <View className="mt-9">
          <SectionHeader
            title={`Learners (${lesson.learnerCount ?? lesson.learners.length})`}
          />
          <View
            className="mt-4 overflow-hidden rounded-3xl border px-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {lesson.learners.map((learner, index) => (
              <View
                key={learner.participantId}
                className="flex-row items-center py-4"
                style={
                  index
                    ? { borderTopWidth: 1, borderTopColor: colors.border }
                    : undefined
                }
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <Text
                    className="font-figtree-bold text-[12px]"
                    style={{ color: colors.text }}
                  >
                    {learner.initials}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
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
                <Text
                  className="font-figtree-bold text-[10px] uppercase"
                  style={{
                    color:
                      learner.status === "present"
                        ? colors.success
                        : learner.status === "absent"
                          ? colors.error
                          : colors.textSubtle,
                  }}
                >
                  {learner.status === "scheduled"
                    ? "Not marked"
                    : learner.status}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="mt-9">
        <SectionHeader title="Lesson overview" />
        <View
          className="mt-4 overflow-hidden rounded-3xl border px-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <DetailRow
            icon="calendar-outline"
            label="Date"
            value={day.fullLabel}
          />
          <DetailRow
            icon="clock-outline"
            label="Time"
            value={`${lesson.time} · ${lesson.duration}`}
          />
          <DetailRow
            icon="map-marker-outline"
            label="Location"
            value={lesson.location}
          />
          <DetailRow
            icon="car-shift-pattern"
            label="Transmission"
            value={lesson.transmission}
            last
          />
        </View>
      </View>

      <View className="mt-9">
        <SectionHeader title="Before the lesson" />
        <View
          className="mt-4 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {[
            "Confirm the learner’s identity and booking",
            "Inspect the school-assigned vehicle",
            "Review the package focus before starting",
          ].map((item, index) => (
            <View
              key={item}
              className={`flex-row items-start gap-3 ${index ? "mt-4" : ""}`}
            >
              <View
                className="mt-0.5 h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.successSoft }}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={15}
                  color={colors.success}
                />
              </View>
              <Text
                className="flex-1 font-figtree-medium text-[13px] leading-5"
                style={{ color: colors.text }}
              >
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className="mt-7 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.verifiedSoft }}
      >
        <MaterialCommunityIcons
          name="shield-account-outline"
          size={20}
          color={colors.verified}
        />
        <Text
          className="flex-1 font-figtree-medium text-[12px] leading-5"
          style={{ color: colors.verified }}
        >
          Starting the lesson updates its session status. Any private
          live-location link remains controlled by the learner.
        </Text>
      </View>

      {canOpenSession ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/instructor/sessions/[lessonId]",
              params: { lessonId: lesson.id },
            })
          }
          className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name={lessonStatus === "in_progress" ? "play" : "play-outline"}
            size={21}
            color={colors.onPrimary}
          />
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            {lessonStatus === "in_progress"
              ? "Continue lesson"
              : "Start lesson"}
          </Text>
        </Pressable>
      ) : (
        <View
          accessible
          accessibilityLabel="Lesson completed"
          className="mt-8 flex-row items-center justify-center gap-2 rounded-full border py-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="check-circle"
            size={21}
            color={colors.success}
          />
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.text }}
          >
            Lesson completed
          </Text>
        </View>
      )}
    </DashboardScreen>
  );
}

type DetailRowProps = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
  last?: boolean;
};

function DetailRow({ icon, label, value, last = false }: DetailRowProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-row items-center gap-3 py-4"
      style={
        last ? undefined : { borderBottomWidth: 1, borderColor: colors.border }
      }
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <Text
        className="flex-1 font-figtree text-[12px]"
        style={{ color: colors.textMuted }}
      >
        {label}
      </Text>
      <Text
        className="max-w-[55%] text-right font-figtree-bold text-[12px]"
        style={{ color: colors.text }}
      >
        {value}
      </Text>
    </View>
  );
}
