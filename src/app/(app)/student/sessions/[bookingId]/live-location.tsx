import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { io } from "socket.io-client";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import {
  GuardianLiveLocationMap,
  TrackingLinkPanel,
  PROXIMITY_WARNING_METERS,
} from "@/features/live-location";
import { haversineMeters } from "@/features/live-location/geo-utils";
import type { GuardianMapLocation } from "@/features/live-location/guardian-live-location-map.types";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getRealtimeBaseUrl } from "@/lib/api/config";
import {
  fetchLearnerLocationShare,
  revokeLearnerLocationShare,
} from "@/lib/api/training-sessions";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { participantToLessonCard } from "@/lib/learner/map-sessions";
import { useAuthStore } from "@/store/auth.store";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import { useLiveLocationStore } from "@/store/live-location.store";
import { useTrainingSessionStore } from "@/store/training-session.store";
import type { SessionCoordinates, SessionLocationSnapshot } from "@/types";

type RealtimeLocation = SessionCoordinates & {
  sessionId: string;
  sourceRole?: "instructor" | "learner";
  recordedAt: string;
};

type SubscribeResponse = {
  success: boolean;
  locations?: {
    instructor: SessionLocationSnapshot | null;
    learner: SessionLocationSnapshot | null;
  };
  proximityMeters?: number | null;
};

function snapshotToMapLocation(
  snapshot: SessionLocationSnapshot | null | undefined,
): GuardianMapLocation | null {
  if (!snapshot) return null;
  return {
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    accuracyInMeters: snapshot.accuracyInMeters,
    heading: snapshot.heading,
  };
}

function appendPathPoint(
  path: GuardianMapLocation[],
  point: GuardianMapLocation,
  maxPoints = 200,
) {
  const last = path[path.length - 1];
  if (
    last &&
    last.latitude === point.latitude &&
    last.longitude === point.longitude
  ) {
    return path;
  }
  return [...path, point].slice(-maxPoints);
}

function computeProximity(
  instructor: GuardianMapLocation | null,
  learner: GuardianMapLocation | null,
) {
  if (!instructor || !learner) return null;
  return haversineMeters(
    instructor.latitude,
    instructor.longitude,
    learner.latitude,
    learner.longitude,
  );
}

export default function LearnerLiveLocationScreen() {
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const joinedSession = useLearnerSessionsStore((state) =>
    state.joinedSessions.find((item) => item.id === bookingId),
  );
  const locationShare = useTrainingSessionStore((state) => {
    const sessionId =
      joinedSession && typeof joinedSession.sessionId === "object"
        ? joinedSession.sessionId.id
        : null;
    return sessionId ? state.locationShares[sessionId] : undefined;
  });
  const pendingShareUrl = useLiveLocationStore((state) => state.pendingShareUrl);
  const setPendingShareUrl = useLiveLocationStore(
    (state) => state.setPendingShareUrl,
  );
  const lesson = useMemo(
    () => (joinedSession ? participantToLessonCard(joinedSession) : null),
    [joinedSession],
  );
  const session =
    joinedSession && typeof joinedSession.sessionId === "object"
      ? joinedSession.sessionId
      : null;
  const [instructorLocation, setInstructorLocation] =
    useState<GuardianMapLocation | null>(null);
  const [instructorPath, setInstructorPath] = useState<GuardianMapLocation[]>(
    [],
  );
  const [proximityMeters, setProximityMeters] = useState<number | null>(null);
  const [status, setStatus] = useState<
    "connecting" | "waiting" | "live" | "ended" | "unavailable"
  >("connecting");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isRevokingShare, setIsRevokingShare] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    void refreshLearnerSessions().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (pendingShareUrl) {
      setShareUrl(pendingShareUrl);
      setPendingShareUrl(null);
    }
  }, [pendingShareUrl, setPendingShareUrl]);

  useEffect(() => {
    if (!joinedSession || session?.status !== "in_progress") return;

    void Location.getForegroundPermissionsAsync()
      .then((result) => setPermissionStatus(result.status))
      .catch(() => undefined);

    void fetchLearnerLocationShare(joinedSession.id)
      .then((share) => setShareUrl(share.shareUrl))
      .catch(() => undefined);
  }, [joinedSession, session?.status]);

  const stopFamilySharing = async () => {
    if (!joinedSession) return;
    setShareError(null);
    setIsRevokingShare(true);
    try {
      await revokeLearnerLocationShare(joinedSession.id);
      setShareUrl(null);
    } catch {
      setShareError("The tracking link could not be stopped. Try again.");
    } finally {
      setIsRevokingShare(false);
    }
  };

  const requestLocationPermission = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(result.status);
  };

  useEffect(() => {
    if (!session?.id || session.status !== "in_progress" || !accessToken)
      return;

    const socket = io(`${getRealtimeBaseUrl()}/session-location`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    let latestInstructorLocation: GuardianMapLocation | null = null;
    let latestLearnerLocation: GuardianMapLocation | null = null;

    const applySnapshot = (response: SubscribeResponse) => {
      if (!response.success) {
        setStatus("unavailable");
        return;
      }

      latestInstructorLocation = snapshotToMapLocation(
        response.locations?.instructor,
      );
      latestLearnerLocation = snapshotToMapLocation(response.locations?.learner);
      setInstructorLocation(latestInstructorLocation);
      if (latestInstructorLocation) {
        setInstructorPath([latestInstructorLocation]);
        setStatus("live");
      } else {
        setStatus("waiting");
      }
      setProximityMeters(
        response.proximityMeters ??
          computeProximity(latestInstructorLocation, latestLearnerLocation),
      );
    };

    socket.on("connect", () => {
      socket.emit(
        "session:subscribe",
        { sessionId: session.id },
        applySnapshot,
      );
    });
    socket.on("location:updated", (nextLocation: RealtimeLocation) => {
      if (nextLocation.sessionId !== session.id) return;

      const point = snapshotToMapLocation(nextLocation as SessionLocationSnapshot);
      if (!point) return;

      if (nextLocation.sourceRole === "learner") {
        latestLearnerLocation = point;
        setProximityMeters(
          computeProximity(latestInstructorLocation, latestLearnerLocation),
        );
        return;
      }

      latestInstructorLocation = point;
      setInstructorLocation(point);
      setInstructorPath((current) => appendPathPoint(current, point));
      setProximityMeters(
        computeProximity(latestInstructorLocation, latestLearnerLocation),
      );
      setStatus("live");
    });
    socket.on("session:ended", () => setStatus("ended"));
    socket.on("connect_error", () => setStatus("unavailable"));

    return () => {
      socket.disconnect();
    };
  }, [accessToken, session?.id, session?.status]);

  const gpsSharingLabel = (() => {
    if (locationShare?.status === "sharing") {
      return "Your location is being shared with the school";
    }
    if (locationShare?.status === "requesting_permission") {
      return "Setting up location sharing…";
    }
    if (locationShare?.status === "failed") {
      return locationShare.failureReason === "permission_denied"
        ? "Location permission is required for live tracking"
        : "Location sharing is unavailable on this device";
    }
    if (permissionStatus === Location.PermissionStatus.DENIED) {
      return "Allow location access so your family can verify you are in the lesson";
    }
    return null;
  })();

  const hasMapData = Boolean(instructorLocation);
  const showProximityWarning =
    proximityMeters != null && proximityMeters > PROXIMITY_WARNING_METERS;

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
            ? "Training vehicle location is live"
            : "Waiting for the training vehicle GPS"}
        </Text>
      </View>

      {gpsSharingLabel ? (
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor:
              locationShare?.status === "failed" ||
              permissionStatus === Location.PermissionStatus.DENIED
                ? colors.error
                : colors.border,
          }}
        >
          <Text
            className="font-figtree-medium text-[13px] leading-5"
            style={{ color: colors.text }}
          >
            {gpsSharingLabel}
          </Text>
          {locationShare?.status === "failed" &&
          locationShare.failureReason === "permission_denied" ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void Linking.openSettings()}
              className="mt-3 self-start rounded-full px-4 py-2 active:opacity-80"
              style={{ backgroundColor: colors.successSoft }}
            >
              <Text
                className="font-figtree-bold text-[12px]"
                style={{ color: colors.primary }}
              >
                Open settings
              </Text>
            </Pressable>
          ) : permissionStatus === Location.PermissionStatus.UNDETERMINED ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void requestLocationPermission()}
              className="mt-3 self-start rounded-full px-4 py-2 active:opacity-80"
              style={{ backgroundColor: colors.successSoft }}
            >
              <Text
                className="font-figtree-bold text-[12px]"
                style={{ color: colors.primary }}
              >
                Allow location access
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {showProximityWarning ? (
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: "#FFF7ED",
            borderColor: "#FB923C",
          }}
        >
          <Text
            className="font-figtree-bold text-[13px]"
            style={{ color: "#9A3412" }}
          >
            GPS trails do not tally
          </Text>
          <Text
            className="mt-2 font-figtree text-[12px] leading-5"
            style={{ color: "#C2410C" }}
          >
            Your phone and the instructor device are about{" "}
            {Math.round(proximityMeters!)} m apart. Both should track the same
            vehicle during the lesson.
          </Text>
        </View>
      ) : null}

      <View className="mt-6">
        {hasMapData ? (
          <GuardianLiveLocationMap
            vehicle={instructorLocation}
            vehicleLabel="Training vehicle"
            path={instructorPath}
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
        {proximityMeters != null && !showProximityWarning ? (
          <Text
            className="mt-3 font-figtree-medium text-[11px]"
            style={{ color: colors.textSubtle }}
          >
            Your GPS and the instructor device tally — about{" "}
            {Math.round(proximityMeters)} m apart
          </Text>
        ) : null}
        {instructorLocation ? (
          <Text
            className="mt-3 font-figtree-medium text-[11px]"
            style={{ color: colors.textSubtle }}
          >
            Map shows the training vehicle. Learner GPS is still recorded for
            audit.
          </Text>
        ) : null}
      </View>

      {shareUrl ? (
        <View className="mt-6">
          <TrackingLinkPanel
            shareUrl={shareUrl}
            learnerFirstName={undefined}
            onRevoke={() => void stopFamilySharing()}
            isRevoking={isRevokingShare}
          />
        </View>
      ) : (
        <View
          className="mt-6 rounded-3xl border p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text
            className="font-figtree-medium text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Loading the session tracking link…
          </Text>
        </View>
      )}
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
