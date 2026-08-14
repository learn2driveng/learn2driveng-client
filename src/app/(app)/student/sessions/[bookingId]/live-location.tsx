import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, Text, View } from "react-native";
import { io } from "socket.io-client";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { LiveLocationMap } from "@/features/live-location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getRealtimeBaseUrl } from "@/lib/api/config";
import {
  createLearnerLocationShare,
  revokeLearnerLocationShare,
} from "@/lib/api/training-sessions";
import { participantToLessonCard } from "@/lib/learner/map-sessions";
import { useAuthStore } from "@/store/auth.store";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import type { SessionCoordinates } from "@/types";

type RealtimeLocation = SessionCoordinates & {
  sessionId: string;
  recordedAt: string;
};

export default function LearnerLiveLocationScreen() {
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const joinedSession = useLearnerSessionsStore((state) =>
    state.joinedSessions.find((item) => item.id === bookingId),
  );
  const lesson = useMemo(
    () => (joinedSession ? participantToLessonCard(joinedSession) : null),
    [joinedSession],
  );
  const session =
    joinedSession && typeof joinedSession.sessionId === "object"
      ? joinedSession.sessionId
      : null;
  const [location, setLocation] = useState<RealtimeLocation | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "waiting" | "live" | "ended" | "unavailable"
  >("connecting");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const publicAppUrl = (
    process.env.EXPO_PUBLIC_WEB_APP_URL ?? "https://learn2drive.ng"
  ).replace(/\/+$/, "");

  const shareWithFamily = async () => {
    if (!joinedSession) return;
    setIsSharing(true);
    setShareError(null);
    try {
      const share = await createLearnerLocationShare(joinedSession.id);
      const url = `${publicAppUrl}/track/${encodeURIComponent(share.token)}`;
      setShareUrl(url);
      await Share.share({
        title: "My live driving lesson",
        message: `Follow my live driving lesson on Learn2Drive. This private link stops working when the lesson ends:\n${url}`,
        url,
      });
    } catch {
      setShareError(
        "The private tracking link could not be shared. Try again.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  const stopFamilySharing = async () => {
    if (!joinedSession) return;
    setShareError(null);
    try {
      await revokeLearnerLocationShare(joinedSession.id);
      setShareUrl(null);
    } catch {
      setShareError("The tracking link could not be stopped. Try again.");
    }
  };

  useEffect(() => {
    if (!session?.id || session.status !== "in_progress" || !accessToken)
      return;

    const socket = io(`${getRealtimeBaseUrl()}/session-location`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit(
        "session:subscribe",
        { sessionId: session.id },
        (response: {
          success: boolean;
          location?: RealtimeLocation | null;
        }) => {
          if (!response.success) {
            setStatus("unavailable");
            return;
          }
          if (response.location) {
            setLocation(response.location);
            setStatus("live");
          } else {
            setStatus("waiting");
          }
        },
      );
    });
    socket.on("location:updated", (nextLocation: RealtimeLocation) => {
      if (nextLocation.sessionId !== session.id) return;
      setLocation(nextLocation);
      setStatus("live");
    });
    socket.on("session:ended", () => setStatus("ended"));
    socket.on("connect_error", () => setStatus("unavailable"));

    return () => {
      socket.disconnect();
    };
  }, [accessToken, session?.id, session?.status]);

  if (!lesson || !session) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon="map-marker-question-outline"
            title="Lesson not found"
            description="This training lesson is unavailable."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (session.status !== "in_progress" || status === "ended") {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon={
              status === "ended"
                ? "map-marker-check-outline"
                : "calendar-clock-outline"
            }
            title={
              status === "ended" ? "Tracking has ended" : "Lesson is not active"
            }
            description="Live tracking is available only while your instructor is conducting this lesson."
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Live lesson" />
      <View
        className="mt-6 flex-row items-center gap-3 rounded-full px-4 py-3"
        style={{ backgroundColor: colors.successSoft }}
      >
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: colors.success }}
        />
        <Text
          className="flex-1 font-figtree-bold text-[12px]"
          style={{ color: colors.success }}
        >
          {status === "live"
            ? "Instructor location is live"
            : "Waiting for the instructor’s location"}
        </Text>
      </View>

      <View className="mt-6">
        {location ? (
          <LiveLocationMap
            coordinates={location}
            learnerName="Training vehicle"
          />
        ) : (
          <View
            className="h-72 items-center justify-center rounded-[28px] border px-6"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={38}
              color={colors.primary}
            />
            <Text
              className="mt-4 text-center font-figtree-bold text-[16px]"
              style={{ color: colors.text }}
            >
              {status === "unavailable"
                ? "Live tracking unavailable"
                : "Getting the first location update"}
            </Text>
            <Text
              className="mt-2 text-center font-figtree text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              The map will update automatically while the lesson is active.
            </Text>
          </View>
        )}
      </View>

      <View
        className="mt-6 rounded-3xl border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="font-figtree-bold text-[16px]"
          style={{ color: colors.text }}
        >
          {lesson.packageName}
        </Text>
        <Text
          className="mt-2 font-figtree text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {lesson.instructor} · {lesson.school}
        </Text>
        {location?.recordedAt ? (
          <Text
            className="mt-3 font-figtree-medium text-[11px]"
            style={{ color: colors.textSubtle }}
          >
            Last updated{" "}
            {new Intl.DateTimeFormat("en-NG", {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(location.recordedAt))}
          </Text>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void shareWithFamily()}
        disabled={isSharing}
        className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <MaterialCommunityIcons
          name="share-variant"
          size={20}
          color={colors.onPrimary}
        />
        <Text
          className="font-figtree-bold text-[15px]"
          style={{ color: colors.onPrimary }}
        >
          {isSharing
            ? "Creating private link…"
            : shareUrl
              ? "Share link again"
              : "Share with family"}
        </Text>
      </Pressable>
      {shareUrl ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void stopFamilySharing()}
          className="mt-3 h-12 items-center justify-center rounded-full border active:opacity-75"
          style={{ backgroundColor: colors.surface, borderColor: colors.error }}
        >
          <Text
            className="font-figtree-bold text-[13px]"
            style={{ color: colors.error }}
          >
            Stop family sharing
          </Text>
        </Pressable>
      ) : null}
      {shareError ? (
        <Text
          accessibilityLiveRegion="polite"
          className="mt-3 text-center font-figtree-medium text-[12px]"
          style={{ color: colors.error }}
        >
          {shareError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
