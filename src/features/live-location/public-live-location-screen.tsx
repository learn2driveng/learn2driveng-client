import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardScreen } from "@/components/dashboard";
import { LiveLocationMap } from "@/features/live-location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { studentProfile } from "@/sample_data/student";
import { useTrainingSessionStore } from "@/store/training-session.store";

type PublicLiveLocationScreenProps = {
  shareToken?: string;
};

function formatUpdatedAt(timestamp: string | null) {
  if (!timestamp) return "Waiting for the first location update";

  return `Updated ${new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp))}`;
}

export function PublicLiveLocationScreen({
  shareToken,
}: PublicLiveLocationScreenProps) {
  const { colors } = useAppTheme();
  const [currentTime, setCurrentTime] = useState(0);
  const locationShare = useTrainingSessionStore((state) =>
    Object.values(state.locationShares).find(
      (share) => share.shareToken === shareToken,
    ),
  );
  const session = useTrainingSessionStore((state) =>
    locationShare ? state.sessions[locationShare.sessionId] : undefined,
  );
  const lessonContext = getInstructorLessonContextBySessionId(session?.id);

  useEffect(() => {
    const updateCurrentTime = () => setCurrentTime(Date.now());
    updateCurrentTime();
    const timer = setInterval(updateCurrentTime, 30_000);
    return () => clearInterval(timer);
  }, []);

  const hasExpired =
    !locationShare ||
    locationShare.status !== "sharing" ||
    !session ||
    session.status !== "in_progress" ||
    (currentTime > 0 && Date.parse(locationShare.expiresAt) <= currentTime);

  if (hasExpired || !locationShare || !session || !lessonContext) {
    return (
      <DashboardScreen>
        <View className="items-center pt-4">
          <AppLogo height={48} />
        </View>
        <View className="mt-16">
          <ContentEmptyState
            icon="link-variant-off"
            title="This tracking link is no longer active"
            description="The learner may have stopped sharing, the lesson may have ended, or the private link may have expired."
          />
        </View>
        <View
          className="mt-6 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-start gap-3">
            <MaterialCommunityIcons
              name="shield-lock-outline"
              size={22}
              color={colors.success}
            />
            <Text
              className="flex-1 font-figtree text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Learn2Drive automatically removes location access when a learner
              stops sharing or an active lesson ends.
            </Text>
          </View>
        </View>
      </DashboardScreen>
    );
  }

  const { lesson } = lessonContext;

  return (
    <DashboardScreen>
      <View className="flex-row items-center justify-between pt-2">
        <AppLogo height={46} />
        <View
          className="flex-row items-center gap-2 rounded-full px-3 py-2"
          style={{ backgroundColor: colors.successSoft }}
        >
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.success }}
          />
          <Text
            className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
            style={{ color: colors.success }}
          >
            Live lesson
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <Text
          accessibilityRole="header"
          className="font-figtree-bold text-[29px] leading-9"
          style={{ color: colors.text }}
        >
          {studentProfile.firstName} is on a driving lesson
        </Text>
        <Text
          className="mt-2 font-figtree text-[14px] leading-6"
          style={{ color: colors.textMuted }}
        >
          This private view shows only the learner’s current location and
          essential lesson information.
        </Text>
      </View>

      <View className="mt-6">
        {locationShare.lastLocation ? (
          <LiveLocationMap
            coordinates={locationShare.lastLocation}
            learnerName={studentProfile.firstName}
          />
        ) : (
          <View
            className="h-72 items-center justify-center rounded-[28px] border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={36}
              color={colors.primary}
            />
            <Text
              className="mt-4 font-figtree-semibold text-[14px]"
              style={{ color: colors.text }}
            >
              Waiting for a location update
            </Text>
          </View>
        )}
      </View>

      <Text
        accessibilityLiveRegion="polite"
        className="mt-3 text-center font-figtree-medium text-[11px]"
        style={{ color: colors.textSubtle }}
      >
        {formatUpdatedAt(locationShare.lastUpdatedAt)}
      </Text>

      <View
        className="mt-6 overflow-hidden rounded-3xl border px-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {[
          ["Instructor", "Instructor John"],
          ["Driving school", "Elite Safety Driving Academy"],
          ["Lesson", lesson.packageName],
          ["Area", lesson.location],
        ].map(([label, value], index) => (
          <View
            key={label}
            className="flex-row items-start justify-between gap-5 py-4"
            style={
              index
                ? { borderTopWidth: 1, borderTopColor: colors.border }
                : undefined
            }
          >
            <Text
              className="font-figtree-medium text-[12px]"
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
        ))}
      </View>

      <View
        className="mt-6 flex-row items-start gap-3 rounded-3xl p-5"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={22}
          color={colors.success}
        />
        <Text
          className="flex-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          No account is required. Access ends when {studentProfile.firstName}{" "}
          stops sharing or the lesson finishes.
        </Text>
      </View>
    </DashboardScreen>
  );
}
