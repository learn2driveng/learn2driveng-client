import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardScreen, SectionHeader } from "@/components/dashboard";
import {
  GuardianActiveSessionCard,
  LinkedLearnerCard,
} from "@/features/guardian";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  guardianLearners,
  guardianLinks,
  guardianProfile,
} from "@/sample_data/guardian";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function GuardianDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const activeSessionId = useTrainingSessionStore(
    (state) => state.activeSessionId,
  );
  const activeSession = useTrainingSessionStore((state) =>
    activeSessionId ? state.sessions[activeSessionId] : undefined,
  );
  const locationShare = useTrainingSessionStore((state) =>
    activeSessionId ? state.locationShares[activeSessionId] : undefined,
  );
  const activeLearner = guardianLearners.find(
    (learner) => learner.id === activeSession?.learnerId,
  );
  const activeLessonContext = getInstructorLessonContextBySessionId(
    activeSession?.id,
  );
  const activeGuardianLink = activeLearner
    ? guardianLinks.find(
        (link) =>
          link.id === activeLearner.guardianLinkId &&
          link.guardianId === guardianProfile.id &&
          link.status === "active",
      )
    : undefined;
  const canViewActiveLocation = Boolean(
    activeGuardianLink &&
    locationShare?.guardianLinkIds.includes(activeGuardianLink.id),
  );

  return (
    <DashboardScreen>
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text
            className="font-figtree text-[14px]"
            style={{ color: colors.textMuted }}
          >
            Good morning
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 font-figtree-bold text-[28px]"
            style={{ color: colors.text }}
          >
            {guardianProfile.firstName}
          </Text>
          <Text
            className="mt-2 font-figtree text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Stay connected to the learners linked to you.
          </Text>
        </View>
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.primary }}
          >
            {guardianProfile.initials}
          </Text>
        </View>
      </View>

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-start gap-4">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="shield-account-outline"
              size={23}
              color={colors.onPrimary}
            />
          </View>
          <View className="flex-1">
            <Text
              className="font-figtree-bold text-[16px]"
              style={{ color: colors.contrastText }}
            >
              Learner-controlled sharing
            </Text>
            <Text
              className="mt-2 font-figtree text-[12px] leading-5"
              style={{ color: colors.contrastMuted }}
            >
              Live location appears only during an active lesson after the
              learner chooses to share it with you.
            </Text>
          </View>
        </View>
      </View>

      {activeSession && activeLearner && activeLessonContext ? (
        <View className="mt-9">
          <SectionHeader title="Active now" />
          <View className="mt-4">
            <GuardianActiveSessionCard
              learner={activeLearner}
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

      <View className="mt-9">
        <SectionHeader title={`Linked learners · ${guardianLearners.length}`} />
        {guardianLearners.length > 0 ? (
          <View className="mt-4 gap-4">
            {guardianLearners.map((learner) => (
              <LinkedLearnerCard
                key={learner.id}
                learner={learner}
                onPress={() =>
                  router.push({
                    pathname: "/guardian/learners/[learnerId]",
                    params: { learnerId: learner.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View className="mt-4">
            <ContentEmptyState
              icon="account-child-outline"
              title="No linked learners yet"
              description="Linked learners and their active training sessions will appear here."
            />
          </View>
        )}
      </View>

      <View
        className="mt-8 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.verifiedSoft }}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={colors.verified}
        />
        <Text
          className="flex-1 font-figtree-medium text-[12px] leading-5"
          style={{ color: colors.verified }}
        >
          A guardian link allows shared progress and session updates. It does
          not automatically grant access to live location.
        </Text>
      </View>
    </DashboardScreen>
  );
}
