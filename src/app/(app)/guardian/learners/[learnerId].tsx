import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
  StatCard,
} from "@/components/dashboard";
import { GuardianActiveSessionCard } from "@/features/guardian";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getGuardianLearner,
  guardianProfile,
} from "@/sample_data/guardian";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { useGuardianAccessStore } from "@/store/guardian-access.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function GuardianLearnerDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { learnerId } = useLocalSearchParams<{ learnerId?: string }>();
  const learner = getGuardianLearner(learnerId);
  const activeSession = useTrainingSessionStore((state) =>
    Object.values(state.sessions).find(
      (session) =>
        session.learnerId === learnerId && session.status === "active",
    ),
  );
  const locationShare = useTrainingSessionStore((state) =>
    activeSession ? state.locationShares[activeSession.id] : undefined,
  );
  const activeLessonContext = getInstructorLessonContextBySessionId(
    activeSession?.id,
  );
  const guardianLinks = useGuardianAccessStore((state) => state.guardianLinks);

  if (!learner) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Learner details" />
        <View className="mt-8">
          <ContentEmptyState
            icon="account-question-outline"
            title="Learner not found"
            description="This learner is not linked to the current guardian account."
          />
        </View>
      </DashboardScreen>
    );
  }

  const remainingSessions = Math.max(
    learner.totalSessions - learner.completedSessions,
    0,
  );
  const progress =
    learner.totalSessions > 0
      ? learner.completedSessions / learner.totalSessions
      : 0;
  const guardianLink = guardianLinks.find(
    (link) =>
      link.learnerId === learner.id &&
      link.guardianId === guardianProfile.id &&
      link.status === "active",
  );
  const canViewActiveLocation = Boolean(
    guardianLink && locationShare?.guardianLinkIds.includes(guardianLink.id),
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Learner details" />

      <View
        className="mt-7 items-center rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View
          className="h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[22px]"
            style={{ color: colors.onPrimary }}
          >
            {learner.initials}
          </Text>
        </View>
        <Text
          accessibilityRole="header"
          className="mt-4 font-figtree-bold text-[24px]"
          style={{ color: colors.contrastText }}
        >
          {learner.name}
        </Text>
        <View className="mt-2 flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="link-variant"
            size={16}
            color={colors.primary}
          />
          <Text
            className="font-figtree-medium text-[12px]"
            style={{ color: colors.contrastMuted }}
          >
            Linked as {learner.relationshipLabel}
          </Text>
        </View>
      </View>

      {activeSession && activeLessonContext ? (
        <View className="mt-9">
          <SectionHeader title="Active now" />
          <View className="mt-4">
            <GuardianActiveSessionCard
              learner={learner}
              lesson={activeLessonContext.lesson}
              sharingStatus={locationShare?.status}
              canViewLocation={canViewActiveLocation}
              onPress={() =>
                router.push({
                  pathname: "/guardian/sessions/[sessionId]",
                  params: { sessionId: activeSession.id },
                })
              }
            />
          </View>
        </View>
      ) : null}

      <View className="mt-7 flex-row gap-4">
        <StatCard
          icon="check-circle-outline"
          value={`${learner.completedSessions}`}
          label="Completed"
          accent={colors.success}
        />
        <StatCard
          icon="calendar-clock"
          value={`${remainingSessions}`}
          label="Remaining"
        />
      </View>

      <View className="mt-9">
        <SectionHeader title="Current training" />
        <View
          className="mt-4 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="font-figtree-bold text-[17px]"
            style={{ color: colors.text }}
          >
            {learner.activePackageName}
          </Text>
          <Text
            className="mt-2 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {learner.schoolName}
          </Text>
          <View
            accessibilityLabel={`${Math.round(progress * 100)} percent complete`}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: learner.totalSessions,
              now: learner.completedSessions,
            }}
            className="mt-5 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: `${Math.min(progress * 100, 100)}%`,
              }}
            />
          </View>
          <Text
            className="mt-3 font-figtree-medium text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {learner.completedSessions} of {learner.totalSessions} sessions
            completed
          </Text>
        </View>
      </View>

      <View className="mt-9">
        <SectionHeader title="Next session" />
        {learner.nextSession ? (
          <View
            className="mt-4 rounded-3xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center gap-3">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={23}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="font-figtree-bold text-[15px]"
                  style={{ color: colors.text }}
                >
                  {learner.nextSession.dateLabel}
                </Text>
                <Text
                  className="mt-1 font-figtree text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  {learner.nextSession.timeLabel} ·{" "}
                  {learner.nextSession.instructorName}
                </Text>
              </View>
            </View>
            <View
              className="mt-4 flex-row items-center gap-2 border-t pt-4"
              style={{ borderTopColor: colors.border }}
            >
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={18}
                color={colors.textSubtle}
              />
              <Text
                className="font-figtree text-[12px]"
                style={{ color: colors.textMuted }}
              >
                {learner.nextSession.location}
              </Text>
            </View>
          </View>
        ) : (
          <View className="mt-4">
            <ContentEmptyState
              icon="calendar-blank-outline"
              title="No upcoming session"
              description="The learner’s next booked session will appear here."
            />
          </View>
        )}
      </View>

      {!activeSession ? (
        <View
          className="mt-8 flex-row items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="map-marker-off-outline"
            size={20}
            color={colors.textMuted}
          />
          <Text
            className="flex-1 font-figtree text-[12px] leading-5"
            style={{ color: colors.textMuted }}
          >
            No live session is active. Location will appear only if this learner
            chooses to share during an active lesson.
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
