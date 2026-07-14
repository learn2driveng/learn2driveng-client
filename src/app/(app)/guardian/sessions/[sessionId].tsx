import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { LiveLocationMap } from "@/features/guardian";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getGuardianLearner,
  guardianProfile,
} from "@/sample_data/guardian";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { useGuardianAccessStore } from "@/store/guardian-access.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

function formatUpdateAge(lastUpdatedAt: string | null, now: number) {
  if (!lastUpdatedAt) return "Waiting for an update";

  const seconds = Math.max(
    0,
    Math.floor((now - Date.parse(lastUpdatedAt)) / 1000),
  );
  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  return `Updated ${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
}

export default function GuardianSessionTrackingScreen() {
  const { colors } = useAppTheme();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const session = useTrainingSessionStore((state) =>
    sessionId ? state.sessions[sessionId] : undefined,
  );
  const locationShare = useTrainingSessionStore((state) =>
    sessionId ? state.locationShares[sessionId] : undefined,
  );
  const [now, setNow] = useState(() => Date.now());
  const learner = getGuardianLearner(session?.learnerId);
  const lessonContext = getInstructorLessonContextBySessionId(session?.id);
  const guardianLinks = useGuardianAccessStore((state) => state.guardianLinks);
  const guardianLink = session
    ? guardianLinks.find(
        (link) =>
          link.learnerId === session.learnerId &&
          link.guardianId === guardianProfile.id &&
          link.status === "active",
      )
    : undefined;
  const isRecipient = Boolean(
    guardianLink && locationShare?.guardianLinkIds.includes(guardianLink.id),
  );

  useEffect(() => {
    if (locationShare?.status !== "sharing" || !locationShare.lastUpdatedAt) {
      return;
    }

    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, [locationShare?.lastUpdatedAt, locationShare?.status]);

  if (!session || !learner || !lessonContext || !guardianLink) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Active session" />
        <View className="mt-8">
          <ContentEmptyState
            icon="shield-lock-outline"
            title="Session unavailable"
            description="This session is not available to the current guardian account."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (session.status !== "active") {
    const ended = session.status === "completed";
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Session tracking" />
        <View className="mt-8">
          <ContentEmptyState
            icon={ended ? "flag-checkered" : "calendar-clock-outline"}
            title={ended ? "Lesson has ended" : "Lesson is not active"}
            description={
              ended
                ? "Live location is no longer available because this lesson is complete."
                : "Tracking becomes available after the instructor starts the lesson."
            }
          />
        </View>
      </DashboardScreen>
    );
  }

  const { lesson, day } = lessonContext;
  const updateAgeMs = locationShare?.lastUpdatedAt
    ? now - Date.parse(locationShare.lastUpdatedAt)
    : Number.POSITIVE_INFINITY;
  const isStale = updateAgeMs > 90000;
  const isDelayed = updateAgeMs > 30000;
  const canShowLocation = Boolean(
    isRecipient &&
    locationShare?.status === "sharing" &&
    locationShare.lastLocation,
  );
  const trackingLabel = isStale
    ? "Update is stale"
    : isDelayed
      ? "Updates delayed"
      : "Live";
  const trackingColor = isStale
    ? colors.error
    : isDelayed
      ? colors.primary
      : colors.success;

  let waitingTitle = "Waiting for learner";
  let waitingDescription =
    "The lesson is active, but the learner has not shared live location with you.";
  let waitingIcon:
    | "map-marker-outline"
    | "map-marker-off-outline"
    | "map-marker-alert-outline" = "map-marker-outline";

  if (locationShare?.status === "requesting_permission" && isRecipient) {
    waitingTitle = "Learner is enabling location";
    waitingDescription =
      "Location will appear after the learner completes device permission.";
  } else if (locationShare?.status === "stopped" && isRecipient) {
    waitingTitle = "Learner stopped sharing";
    waitingDescription =
      "The lesson is still active, but live location is no longer being shared.";
    waitingIcon = "map-marker-off-outline";
  } else if (locationShare?.status === "failed" && isRecipient) {
    waitingTitle = "Location temporarily unavailable";
    waitingDescription =
      "The learner’s device could not provide a current location. Session details remain visible.";
    waitingIcon = "map-marker-alert-outline";
  } else if (locationShare?.status === "sharing" && !isRecipient) {
    waitingTitle = "Location was not shared with you";
    waitingDescription =
      "The learner selected different linked guardians for this session.";
    waitingIcon = "map-marker-off-outline";
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Active session" />

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-row items-center gap-2">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colors.success }}
            />
            <Text
              className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
              style={{ color: colors.success }}
            >
              Lesson in progress
            </Text>
          </View>
          <Text
            className="font-figtree-medium text-[11px]"
            style={{ color: colors.contrastMuted }}
          >
            {day.fullLabel}
          </Text>
        </View>

        <View className="mt-5 flex-row items-center">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-figtree-bold text-[15px]"
              style={{ color: colors.onPrimary }}
            >
              {learner.initials}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <Text
              className="font-figtree-bold text-[20px]"
              style={{ color: colors.contrastText }}
            >
              {learner.name}
            </Text>
            <Text
              className="mt-1 font-figtree text-[12px]"
              style={{ color: colors.contrastMuted }}
            >
              {lesson.packageName}
            </Text>
          </View>
        </View>

        <View
          className="mt-5 flex-row items-center gap-2 border-t pt-4"
          style={{ borderTopColor: colors.contrastBorder }}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={18}
            color={colors.primary}
          />
          <Text
            className="flex-1 font-figtree text-[12px]"
            style={{ color: colors.contrastMuted }}
          >
            {lesson.location} · Instructor John
          </Text>
        </View>
      </View>

      <View className="mt-9">
        <SectionHeader title="Live location" />
        {canShowLocation && locationShare?.lastLocation ? (
          <>
            <View className="mt-4">
              <LiveLocationMap
                coordinates={locationShare.lastLocation}
                learnerName={learner.name}
              />
            </View>
            <View
              accessibilityLiveRegion="polite"
              className="mt-4 flex-row items-center rounded-2xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name={isStale ? "wifi-alert" : "crosshairs-gps"}
                  size={20}
                  color={trackingColor}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="font-figtree-bold text-[13px]"
                  style={{ color: trackingColor }}
                >
                  {trackingLabel}
                </Text>
                <Text
                  className="mt-1 font-figtree text-[11px]"
                  style={{ color: colors.textMuted }}
                >
                  {formatUpdateAge(locationShare.lastUpdatedAt, now)}
                </Text>
              </View>
              <Text
                className="font-figtree-bold text-[11px]"
                style={{ color: colors.textMuted }}
              >
                {locationShare.lastLocation.accuracy
                  ? `±${Math.round(locationShare.lastLocation.accuracy)} m`
                  : "Accuracy pending"}
              </Text>
            </View>
          </>
        ) : (
          <View className="mt-4">
            <ContentEmptyState
              icon={waitingIcon}
              title={waitingTitle}
              description={waitingDescription}
            />
          </View>
        )}
      </View>

      <View
        className="mt-8 flex-row items-start gap-3 rounded-2xl p-4"
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
          The learner controls this share. Location disappears when they stop
          sharing or when the instructor ends the lesson.
        </Text>
      </View>
    </DashboardScreen>
  );
}
