import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { io } from "socket.io-client";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getRealtimeBaseUrl } from "@/lib/api/config";
import {
  fetchSchoolLocationShare,
  fetchSchoolTrainingSessions,
  revokeSchoolLocationShare,
} from "@/lib/api/training-sessions";
import {
  readInstructorNameFromSession,
  readLearnerLabelFromParticipant,
  sessionDisplayLocation,
} from "@/lib/instructor/map-sessions";
import {
  copyTrackingLink,
  openTrackingLinkInBrowser,
  shareTrackingLinkViaWhatsApp,
} from "@/lib/share/tracking-link";
import { useAuthStore } from "@/store/auth.store";
import type { EnrichedTrainingSession, SessionLocationSnapshot, TrainingSession } from "@/types";

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

type SessionShareState = {
  shareUrl: string;
  expiresAt: string;
};

type LiveSessionLocationState = {
  proximityMeters: number | null;
  instructorUpdatedAt: string | null;
  learnerUpdatedAt: string | null;
};

type SubscribeResponse = {
  success: boolean;
  locations?: {
    instructor: SessionLocationSnapshot | null;
    learner: SessionLocationSnapshot | null;
  };
  proximityMeters?: number | null;
};

function snapshotTimestamp(
  snapshot: SessionLocationSnapshot | null | undefined,
) {
  if (!snapshot?.recordedAt) return null;
  return typeof snapshot.recordedAt === "string"
    ? snapshot.recordedAt
    : new Date(snapshot.recordedAt).toISOString();
}

export default function SchoolSessionMonitoringScreen() {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [shareBySessionId, setShareBySessionId] = useState<
    Record<string, SessionShareState>
  >({});
  const [liveBySessionId, setLiveBySessionId] = useState<
    Record<string, LiveSessionLocationState>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const loadMonitoring = useCallback(async () => {
    setError(null);
    try {
      const nextSessions = await fetchSchoolTrainingSessions();
      setSessions(nextSessions);

      const active = nextSessions.filter(
        (session) => session.status === "in_progress",
      );
      const shares = await Promise.all(
        active.map(async (session) => {
          try {
            const share = await fetchSchoolLocationShare(session.id);
            return [session.id, share] as const;
          } catch {
            return null;
          }
        }),
      );

      setShareBySessionId(
        Object.fromEntries(
          shares.filter(Boolean).map((entry) => [
            entry![0],
            {
              shareUrl: entry![1].shareUrl,
              expiresAt: entry![1].expiresAt,
            },
          ]),
        ),
      );
    } catch {
      setError("We could not load live session monitoring.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMonitoring();
    const timer = setInterval(() => {
      void loadMonitoring();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadMonitoring]);

  const activeSessions = sessions.filter(
    (session) => session.status === "in_progress",
  );
  const activeSessionIds = useMemo(
    () => activeSessions.map((session) => session.id).sort().join(","),
    [activeSessions],
  );
  const scheduledSessions = sessions.filter(
    (session) => session.status === "scheduled",
  );

  useEffect(() => {
    if (!accessToken || !activeSessionIds) return;

    const sessionIds = activeSessionIds.split(",").filter(Boolean);
    const socket = io(`${getRealtimeBaseUrl()}/session-location`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    const applySnapshot = (sessionId: string, response: SubscribeResponse) => {
      if (!response.success) return;
      setLiveBySessionId((current) => ({
        ...current,
        [sessionId]: {
          proximityMeters: response.proximityMeters ?? null,
          instructorUpdatedAt: snapshotTimestamp(
            response.locations?.instructor,
          ),
          learnerUpdatedAt: snapshotTimestamp(response.locations?.learner),
        },
      }));
    };

    socket.on("connect", () => {
      for (const sessionId of sessionIds) {
        socket.emit(
          "session:subscribe",
          { sessionId },
          (response: SubscribeResponse) => applySnapshot(sessionId, response),
        );
      }
    });

    socket.on("location:updated", (location: SessionLocationSnapshot) => {
      if (!location.sessionId) return;
      setLiveBySessionId((current) => {
        const previous = current[location.sessionId] ?? {
          proximityMeters: null,
          instructorUpdatedAt: null,
          learnerUpdatedAt: null,
        };
        const recordedAt =
          typeof location.recordedAt === "string"
            ? location.recordedAt
            : new Date(location.recordedAt).toISOString();

        if (location.sourceRole === "learner") {
          return {
            ...current,
            [location.sessionId]: {
              ...previous,
              learnerUpdatedAt: recordedAt,
            },
          };
        }

        return {
          ...current,
          [location.sessionId]: {
            ...previous,
            instructorUpdatedAt: recordedAt,
          },
        };
      });
    });

    socket.on("session:ended", ({ sessionId }: { sessionId: string }) => {
      setLiveBySessionId((current) => {
        const next = { ...current };
        delete next[sessionId];
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, activeSessionIds]);

  const revokeShare = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeSchoolLocationShare(sessionId);
      setShareBySessionId((current) => {
        const next = { ...current };
        delete next[sessionId];
        return next;
      });
    } finally {
      setRevokingSessionId(null);
    }
  };

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
        Operational visibility for lessons being delivered by your school. Each
        active lesson has one guardian tracking link created when the instructor
        starts the session.
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
          The same tracking link is available to learners, guardians, and your
          school staff while the lesson is active.
        </Text>
      </View>

      <View className="mt-8">
        <SectionHeader title="Active lessons" />
        {isLoading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View className="mt-4">
            <ContentEmptyState
              icon="cloud-alert-outline"
              title="Monitoring unavailable"
              description={error}
              actionLabel="Try again"
              onActionPress={() => void loadMonitoring()}
            />
          </View>
        ) : (
          <View className="mt-4 gap-3">
            {activeSessions.length ? (
              activeSessions.map((session) => {
                const enriched = session as EnrichedTrainingSession;
                const share = shareBySessionId[session.id];
                const live = liveBySessionId[session.id];
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
                            readLearnerLabelFromParticipant(undefined)}
                        </Text>
                        <Text
                          className="mt-1 text-[11px]"
                          style={{
                            color: colors.textMuted,
                            fontFamily: fontFamily.figtreeMedium,
                          }}
                        >
                          {readInstructorNameFromSession(enriched)} ·{" "}
                          {sessionDisplayLocation(enriched)}
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
                          Tracking link
                        </Text>
                        <Text
                          className="mt-1 text-[12px]"
                          style={{
                            color: share ? colors.success : colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {share ? "Active" : "Unavailable"}
                        </Text>
                      </View>
                    </View>

                    {live ? (
                      <View
                        className="mt-4 rounded-2xl border px-4 py-3"
                        style={{
                          backgroundColor: colors.surfaceStrong,
                          borderColor: colors.border,
                        }}
                      >
                        <Text
                          className="font-figtree-medium text-[10px] uppercase"
                          style={{ color: colors.textSubtle }}
                        >
                          Live GPS
                        </Text>
                        <Text
                          className="mt-2 font-figtree text-[12px] leading-5"
                          style={{ color: colors.text }}
                        >
                          {live.proximityMeters != null
                            ? `Instructor and learner GPS tally — about ${Math.round(live.proximityMeters)} m apart`
                            : "Waiting for paired GPS from the same vehicle"}
                        </Text>
                        <Text
                          className="mt-2 font-figtree text-[11px]"
                          style={{ color: colors.textMuted }}
                        >
                          Instructor:{" "}
                          {live.instructorUpdatedAt
                            ? "updated"
                            : "no signal yet"}
                          {" · "}
                          Learner:{" "}
                          {live.learnerUpdatedAt ? "updated" : "no signal yet"}
                        </Text>
                      </View>
                    ) : null}

                    {share ? (
                      <View className="mt-4 gap-3">
                        <View
                          className="rounded-2xl border px-4 py-3"
                          style={{
                            backgroundColor: colors.surfaceStrong,
                            borderColor: colors.border,
                          }}
                        >
                          <Text
                            className="font-figtree-medium text-[10px] uppercase"
                            style={{ color: colors.textSubtle }}
                          >
                            Guardian link
                          </Text>
                          <Text
                            selectable
                            className="mt-1 font-figtree text-[12px] leading-5"
                            style={{ color: colors.text }}
                          >
                            {share.shareUrl}
                          </Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2">
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => void copyTrackingLink(share.shareUrl)}
                            className="h-10 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
                            style={{ backgroundColor: colors.surfaceStrong }}
                          >
                            <MaterialCommunityIcons
                              name="content-copy"
                              size={15}
                              color={colors.text}
                            />
                            <Text
                              className="font-figtree-bold text-[11px]"
                              style={{ color: colors.text }}
                            >
                              Copy
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              void shareTrackingLinkViaWhatsApp(share.shareUrl)
                            }
                            className="h-10 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
                            style={{ backgroundColor: "#DCFCE7" }}
                          >
                            <MaterialCommunityIcons
                              name="whatsapp"
                              size={15}
                              color="#15803D"
                            />
                            <Text
                              className="font-figtree-bold text-[11px]"
                              style={{ color: "#15803D" }}
                            >
                              WhatsApp
                            </Text>
                          </Pressable>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() =>
                              void openTrackingLinkInBrowser(share.shareUrl)
                            }
                            className="h-10 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <MaterialCommunityIcons
                              name="open-in-new"
                              size={15}
                              color={colors.onPrimary}
                            />
                            <Text
                              className="font-figtree-bold text-[11px]"
                              style={{ color: colors.onPrimary }}
                            >
                              Open
                            </Text>
                          </Pressable>
                        </View>

                        <Pressable
                          accessibilityRole="button"
                          disabled={revokingSessionId === session.id}
                          onPress={() => void revokeShare(session.id)}
                          className="h-10 items-center justify-center rounded-full border active:opacity-75"
                          style={{ borderColor: colors.error }}
                        >
                          <Text
                            className="font-figtree-bold text-[11px]"
                            style={{ color: colors.error }}
                          >
                            {revokingSessionId === session.id
                              ? "Revoking…"
                              : "Revoke link"}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
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
        )}
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
              const enriched = session as EnrichedTrainingSession;
              const transmission =
                typeof enriched.vehicleId === "object" &&
                enriched.vehicleId?.transmissionType
                  ? enriched.vehicleId.transmissionType
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
                      {session.title}
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
