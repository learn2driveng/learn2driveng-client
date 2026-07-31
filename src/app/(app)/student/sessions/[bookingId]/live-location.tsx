import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, Share, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { studentProfile } from "@/sample_data/student";
import { useTrainingSessionStore } from "@/store/training-session.store";

function formatExpiry(expiresAt: string) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(expiresAt));
}

export default function LearnerLiveLocationScreen() {
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const [shareError, setShareError] = useState<string | null>(null);
  const participant = useTrainingSessionStore((state) =>
    Object.values(state.participantsBySessionId).find(
      (item) => item.bookingId === bookingId,
    ),
  );
  const session = useTrainingSessionStore((state) =>
    participant ? state.sessions[participant.sessionId] : undefined,
  );
  const locationShare = useTrainingSessionStore((state) =>
    session ? state.locationShares[session.id] : undefined,
  );
  const requestLocationSharing = useTrainingSessionStore(
    (state) => state.requestLocationSharing,
  );
  const stopLocationSharing = useTrainingSessionStore(
    (state) => state.stopLocationSharing,
  );
  const lessonContext = getInstructorLessonContextBySessionId(session?.id);

  if (!session || !lessonContext) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon="map-marker-question-outline"
            title="Session not found"
            description="This training session is not available for location sharing."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (participant?.learnerId !== studentProfile.id) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon="shield-lock-outline"
            title="Session unavailable"
            description="Only the learner assigned to this session can control location sharing."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (session.status !== "in_progress") {
    const ended = session.status === "completed";
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon={ended ? "map-marker-check-outline" : "calendar-clock-outline"}
            title={ended ? "Sharing has ended" : "Lesson is not active"}
            description={
              ended
                ? "The tracking link expired automatically when the lesson ended."
                : "You can create a tracking link after your instructor starts the lesson."
            }
          />
        </View>
      </DashboardScreen>
    );
  }

  const { lesson, day } = lessonContext;
  const sharingStatus = locationShare?.status ?? "inactive";
  const isRequesting = sharingStatus === "requesting_permission";
  const isSharing = sharingStatus === "sharing";

  const shareTrackingLink = async () => {
    if (!locationShare?.shareUrl) return;

    setShareError(null);
    try {
      await Share.share({
        title: `${studentProfile.firstName}'s live driving lesson`,
        message: `Follow ${studentProfile.firstName}'s live driving lesson on Learn2Drive. This private link expires when the lesson ends:\n${locationShare.shareUrl}`,
        url: locationShare.shareUrl,
      });
    } catch {
      setShareError("The share menu could not be opened. Please try again.");
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Live location" />

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
      >
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
          className="mt-5 font-figtree-bold text-[24px]"
          style={{ color: colors.contrastText }}
        >
          {lesson.packageName}
        </Text>
        <Text
          className="mt-2 font-figtree text-[13px]"
          style={{ color: colors.contrastMuted }}
        >
          {day.fullLabel} · {lesson.time}
        </Text>
        <View
          className="mt-5 flex-row items-center gap-3 border-t pt-5"
          style={{ borderTopColor: colors.contrastBorder }}
        >
          <MaterialCommunityIcons
            name="account-tie-outline"
            size={20}
            color={colors.primary}
          />
          <Text
            className="flex-1 font-figtree-medium text-[12px]"
            style={{ color: colors.contrastMuted }}
          >
            Instructor John · {lesson.location}
          </Text>
        </View>
      </View>

      {isSharing && locationShare ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-7 rounded-[28px] border p-5"
          style={{
            backgroundColor: colors.successSoft,
            borderColor: colors.success,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons
                name="link-variant"
                size={25}
                color={colors.contrastText}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-figtree-bold text-[17px]"
                style={{ color: colors.text }}
              >
                Private tracking link is active
              </Text>
              <Text
                className="mt-1 font-figtree text-[12px]"
                style={{ color: colors.textMuted }}
              >
                Anyone you send it to can follow this lesson until{" "}
                {formatExpiry(locationShare.expiresAt)}.
              </Text>
            </View>
          </View>

          <View
            className="mt-5 rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
              style={{ color: colors.textSubtle }}
            >
              Latest update
            </Text>
            <Text
              className="mt-1 font-figtree-semibold text-[13px]"
              style={{ color: colors.text }}
            >
              {locationShare.lastLocation?.accuracy
                ? `Accurate to about ${Math.round(locationShare.lastLocation.accuracy)} metres`
                : "Getting a precise location…"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => void shareTrackingLink()}
            className="mt-5 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
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
              Share tracking link
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => stopLocationSharing(session.id)}
            className="mt-3 h-13 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{
              minHeight: 52,
              backgroundColor: colors.surface,
              borderColor: colors.error,
            }}
          >
            <MaterialCommunityIcons
              name="link-variant-off"
              size={20}
              color={colors.error}
            />
            <Text
              className="font-figtree-bold text-[14px]"
              style={{ color: colors.error }}
            >
              Stop sharing and expire link
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="mt-8">
            <Text
              className="font-figtree-bold text-[22px]"
              style={{ color: colors.text }}
            >
              Let someone follow this lesson
            </Text>
            <Text
              className="mt-2 font-figtree text-[13px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Create one private link and send it through WhatsApp, Messages or
              any app you trust. The viewer does not need an account.
            </Text>
          </View>

          <View
            className="mt-5 rounded-3xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {[
              "Your location is shared only for this active lesson",
              "The link contains no phone number or home address",
              "You can expire the link at any time",
              "The link stops working automatically when the lesson ends",
            ].map((item, index) => (
              <View
                key={item}
                className={`flex-row items-start gap-3 ${index ? "mt-4" : ""}`}
              >
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={19}
                  color={colors.success}
                />
                <Text
                  className="flex-1 font-figtree-medium text-[12px] leading-5"
                  style={{ color: colors.text }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {sharingStatus === "failed" ? (
            <View
              accessibilityLiveRegion="polite"
              className="mt-5 rounded-2xl p-4"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.error }}
              >
                {locationShare?.failureReason === "permission_denied"
                  ? "Location permission is off"
                  : "Location is currently unavailable"}
              </Text>
              <Text
                className="mt-1 font-figtree text-[12px] leading-5"
                style={{ color: colors.textMuted }}
              >
                {locationShare?.failureReason === "permission_denied"
                  ? "Allow location access in your device settings, then try again."
                  : "Check that location services are enabled, then try again."}
              </Text>
              {locationShare?.failureReason === "permission_denied" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void Linking.openSettings()}
                  className="mt-3 min-h-11 self-start justify-center"
                >
                  <Text
                    className="font-figtree-bold text-[13px]"
                    style={{ color: colors.primary }}
                  >
                    Open settings
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isRequesting }}
            disabled={isRequesting}
            onPress={() =>
              requestLocationSharing(session.id, studentProfile.id)
            }
            className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: isRequesting
                ? colors.surfaceStrong
                : colors.primary,
            }}
          >
            <MaterialCommunityIcons
              name="link-plus"
              size={21}
              color={isRequesting ? colors.textSubtle : colors.onPrimary}
            />
            <Text
              className="font-figtree-bold text-[15px]"
              style={{
                color: isRequesting ? colors.textSubtle : colors.onPrimary,
              }}
            >
              {sharingStatus === "failed"
                ? "Try creating link again"
                : isRequesting
                  ? "Getting your location…"
                  : "Create private tracking link"}
            </Text>
          </Pressable>

          {isRequesting ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => stopLocationSharing(session.id)}
              className="mt-3 h-12 items-center justify-center active:opacity-70"
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.textMuted }}
              >
                Cancel
              </Text>
            </Pressable>
          ) : null}
        </>
      )}

      {shareError ? (
        <Text
          accessibilityRole="alert"
          className="mt-4 text-center font-figtree-medium text-[12px]"
          style={{ color: colors.error }}
        >
          {shareError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
