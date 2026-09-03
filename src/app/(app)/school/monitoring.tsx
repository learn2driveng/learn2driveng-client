import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  readInstructorNameFromSession,
  readLearnerLabelFromParticipant,
  sessionDisplayLocation,
} from "@/lib/instructor/map-sessions";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

function elapsedLabel(value: string | null) {
  if (!value) return "Not started";
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
  return `${minutes} min elapsed`;
}

function scheduleLabel(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SchoolSessionMonitoringScreen() {
  const { colors } = useAppTheme();
  const [renderedAt] = useState(() => Date.now());
  const surfaces = useSurfaceStyles();
  const schoolId = useSchoolOperationsStore((state) => state.profile.id);
  const sessionsById = useTrainingSessionStore((state) => state.sessions);
  const participantsBySessionId = useTrainingSessionStore(
    (state) => state.participantsBySessionId,
  );
  const sessions = Object.values(sessionsById);
  const schoolSessions = sessions.filter((session) => {
    const sessionSchoolId =
      typeof session.schoolId === "object" && session.schoolId
        ? session.schoolId.id
        : session.schoolId;
    return sessionSchoolId === schoolId;
  });
  const activeSessions = schoolSessions.filter(
    (session) => session.status === "in_progress",
  );
  const scheduledSessions = schoolSessions.filter(
    (session) =>
      session.status === "scheduled" &&
      new Date(session.scheduledEndTime).getTime() > renderedAt,
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Session monitoring" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Operational visibility for lessons being delivered by your school.
      </Text>

      <View className="mt-7 flex-row gap-3">
        <View
          className="flex-1 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.successSoft,
            borderColor: colors.success,
            ...surfaces.floating,
          }}
        >
          <Text
            className="text-[24px]"
            style={{
              color: colors.success,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {activeSessions.length}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            active now
          </Text>
        </View>
        <View className="flex-1 rounded-3xl border p-4" style={surfaces.card}>
          <Text
            className="text-[24px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {scheduledSessions.length}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            scheduled
          </Text>
        </View>
      </View>

      <View
        className="mt-5 flex-row items-start gap-3 rounded-3xl border p-4"
        style={{
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        }}
      >
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={20}
          color={colors.verified}
        />
        <Text
          className="flex-1 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Location publishing is controlled by the assigned instructor and is
          limited to an active lesson. A learner must separately create a
          time-limited tracking link before anyone else can follow it.
        </Text>
      </View>

      <View className="mt-8">
        <SectionHeader title="Active lessons" />
        <View className="mt-4 gap-3">
          {activeSessions.length ? (
            activeSessions.map((session) => {
              const participant = participantsBySessionId[session.id];
              return (
                <View
                  key={session.id}
                  className="rounded-3xl border p-4"
                  style={surfaces.card}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: colors.successSoft }}
                    >
                      <MaterialCommunityIcons
                        name="steering"
                        size={24}
                        color={colors.success}
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
                        {session.title ||
                          readLearnerLabelFromParticipant(participant)}
                      </Text>
                      <Text
                        className="mt-1 text-[11px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {readInstructorNameFromSession(session)} ·{" "}
                        {sessionDisplayLocation(session)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-2.5 py-1.5"
                      style={{ backgroundColor: colors.successSoft }}
                    >
                      <Text
                        className="text-[10px]"
                        style={{
                          color: colors.success,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        LIVE
                      </Text>
                    </View>
                  </View>
                  <View className="mt-4 flex-row gap-3">
                    <View
                      className="flex-1 rounded-2xl p-3"
                      style={{ backgroundColor: colors.surfaceStrong }}
                    >
                      <Text
                        className="text-[10px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        Duration
                      </Text>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {elapsedLabel(session.actualStartTime ?? null)}
                      </Text>
                    </View>
                    <View
                      className="flex-1 rounded-2xl p-3"
                      style={{ backgroundColor: colors.surfaceStrong }}
                    >
                      <Text
                        className="text-[10px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        Scheduled end
                      </Text>
                      <Text
                        className="mt-1 text-[12px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {scheduleLabel(session.scheduledEndTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <ContentEmptyState
              icon="steering-off"
              title="No active lessons"
              description="Lessons appear here when an instructor starts a scheduled session."
            />
          )}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Coming up" />
        <View className="mt-4 gap-3">
          {scheduledSessions
            .sort(
              (left, right) =>
                new Date(left.scheduledStartTime).getTime() -
                new Date(right.scheduledStartTime).getTime(),
            )
            .slice(0, 4)
            .map((session) => {
              const participant = participantsBySessionId[session.id];
              const transmission =
                typeof session.vehicleId === "object" &&
                session.vehicleId?.transmissionType
                  ? session.vehicleId.transmissionType
                  : "Lesson";
              return (
                <View
                  key={session.id}
                  className="flex-row items-center gap-3 rounded-3xl border p-4"
                  style={surfaces.card}
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name="calendar-clock"
                      size={21}
                      color={colors.primary}
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
                      {session.title ||
                        readLearnerLabelFromParticipant(participant)}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {scheduleLabel(session.scheduledStartTime)}
                    </Text>
                  </View>
                  <Text
                    className="text-[10px]"
                    style={{
                      color: colors.textSubtle,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {transmission}
                  </Text>
                </View>
              );
            })}
        </View>
      </View>
    </DashboardScreen>
  );
}
