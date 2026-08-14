import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import type {
  InstructorAssignedSession,
  InstructorSessionParticipant,
} from "@/types/training-session";

function learnerName(participant: InstructorSessionParticipant) {
  if (typeof participant.learnerId === "string") return "Learner";
  return (
    `${participant.learnerId.firstName ?? ""} ${participant.learnerId.lastName ?? ""}`.trim() ||
    "Learner"
  );
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InstructorAttendanceScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const assignedSessions = useInstructorOperationsStore(
    (state) => state.assignedSessions,
  );
  const sessions = [...assignedSessions]
    .filter((session) => session.participants.length > 0)
    .sort(
      (left, right) =>
        new Date(right.scheduledStartTime).getTime() -
        new Date(left.scheduledStartTime).getTime(),
    );
  const pendingSessions = sessions.filter(
    (session) =>
      session.status === "in_progress" &&
      session.participants.some(
        (participant) => participant.status === "scheduled",
      ),
  );
  const recordedSessions = sessions.filter((session) =>
    session.participants.some((participant) =>
      ["present", "absent"].includes(participant.status),
    ),
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Attendance" showBack={false} />
      <Text
        className="mt-3 font-figtree text-[14px] leading-5"
        style={{ color: colors.textMuted }}
      >
        Mark every learner present or absent, then save once.
      </Text>

      <View className="mt-8">
        {pendingSessions.length > 0 ? (
          <View className="gap-3">
            {pendingSessions.map((session) => (
              <AttendanceSessionCard
                key={session.id}
                session={session}
                actionLabel="Mark attendance"
                onPress={() =>
                  router.push({
                    pathname: "/instructor/sessions/[lessonId]/report",
                    params: { lessonId: session.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View className="mt-4">
            <ContentEmptyState
              icon="clipboard-check-outline"
              title="No attendance waiting"
              description="Active lessons that still need attendance will appear here."
            />
          </View>
        )}
      </View>

      {recordedSessions.length > 0 ? (
        <View className="mt-8">
          <SectionHeader title="Recently recorded" />
          <View className="mt-4 gap-3">
            {recordedSessions.slice(0, 10).map((session) => (
              <AttendanceSessionCard key={session.id} session={session} />
            ))}
          </View>
        </View>
      ) : null}
    </DashboardScreen>
  );
}

function AttendanceSessionCard({
  session,
  actionLabel,
  onPress,
}: {
  session: InstructorAssignedSession;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const presentCount = session.participants.filter(
    (participant) => participant.status === "present",
  ).length;
  const absentCount = session.participants.filter(
    (participant) => participant.status === "absent",
  ).length;
  const pendingCount = session.participants.filter(
    (participant) => participant.status === "scheduled",
  ).length;

  return (
    <View
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{
            backgroundColor: pendingCount
              ? colors.surfaceStrong
              : colors.successSoft,
          }}
        >
          <MaterialCommunityIcons
            name={
              pendingCount
                ? "clipboard-clock-outline"
                : "clipboard-check-outline"
            }
            size={21}
            color={pendingCount ? colors.primary : colors.success}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.text }}
          >
            {session.title}
          </Text>
          <Text
            className="mt-1 font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {formatSessionDate(session.scheduledStartTime)} ·{" "}
            {session.participants.length}{" "}
            {session.participants.length === 1 ? "learner" : "learners"}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2">
        {session.participants.map((participant) => (
          <View
            key={participant.id}
            className="flex-row items-center justify-between gap-3"
          >
            <Text
              className="flex-1 font-figtree-medium text-[12px]"
              style={{ color: colors.text }}
            >
              {learnerName(participant)}
            </Text>
            <Text
              className="font-figtree-bold text-[10px] uppercase"
              style={{
                color:
                  participant.status === "present"
                    ? colors.success
                    : participant.status === "absent"
                      ? colors.error
                      : colors.textSubtle,
              }}
            >
              {participant.status === "scheduled"
                ? "Not marked"
                : participant.status}
            </Text>
          </View>
        ))}
      </View>

      <View
        className="mt-4 flex-row gap-4 border-t pt-4"
        style={{ borderTopColor: colors.border }}
      >
        <AttendanceCount
          value={presentCount}
          label="Present"
          color={colors.success}
        />
        <AttendanceCount
          value={absentCount}
          label="Absent"
          color={colors.error}
        />
        <AttendanceCount
          value={pendingCount}
          label="Not marked"
          color={colors.textMuted}
        />
      </View>

      {actionLabel && onPress ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          className="mt-5 h-12 items-center justify-center rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.onPrimary }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function AttendanceCount({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View className="flex-1">
      <Text className="font-figtree-bold text-[15px]" style={{ color }}>
        {value}
      </Text>
      <Text className="mt-1 font-figtree text-[10px]" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
