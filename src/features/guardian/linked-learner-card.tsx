import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { GuardianLearnerSummary } from "@/types";

type LinkedLearnerCardProps = {
  learner: GuardianLearnerSummary;
  onPress: () => void;
};

export function LinkedLearnerCard({
  learner,
  onPress,
}: LinkedLearnerCardProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const progress =
    learner.totalSessions > 0
      ? learner.completedSessions / learner.totalSessions
      : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${learner.name}, ${learner.relationshipLabel}. ${learner.completedSessions} of ${learner.totalSessions} sessions completed.`}
      accessibilityHint="Opens linked learner details"
      onPress={onPress}
      className="overflow-hidden rounded-[28px] border active:opacity-75"
      style={surfaces.card}
    >
      <View className="p-5">
        <View className="flex-row items-center">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.contrastSurface }}
          >
            <Text
              className="font-figtree-bold text-[15px]"
              style={{ color: colors.primary }}
            >
              {learner.initials}
            </Text>
          </View>
          <View className="ml-4 flex-1">
            <View className="flex-row items-center gap-2">
              <Text
                className="font-figtree-bold text-[18px]"
                style={{ color: colors.text }}
              >
                {learner.name}
              </Text>
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: colors.verifiedSoft }}
              >
                <Text
                  className="font-figtree-bold text-[10px]"
                  style={{ color: colors.verified }}
                >
                  {learner.relationshipLabel}
                </Text>
              </View>
            </View>
            <Text
              numberOfLines={1}
              className="mt-1 font-figtree text-[12px]"
              style={{ color: colors.textMuted }}
            >
              {learner.schoolName}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={23}
            color={colors.textSubtle}
          />
        </View>

        <View className="mt-6 flex-row items-end justify-between gap-4">
          <View>
            <Text
              className="font-figtree text-[11px]"
              style={{ color: colors.textMuted }}
            >
              Package progress
            </Text>
            <Text
              className="mt-1 font-figtree-bold text-[14px]"
              style={{ color: colors.text }}
            >
              {learner.activePackageName}
            </Text>
          </View>
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.text }}
          >
            {learner.completedSessions}/{learner.totalSessions}
          </Text>
        </View>
        <View
          accessibilityLabel={`${Math.round(progress * 100)} percent complete`}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: 0,
            max: learner.totalSessions,
            now: learner.completedSessions,
          }}
          className="mt-3 h-2 overflow-hidden rounded-full"
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
      </View>

      {learner.nextSession ? (
        <View
          className="flex-row items-center gap-3 border-t px-5 py-4"
          style={{
            backgroundColor: colors.surfaceMuted,
            borderTopColor: colors.border,
          }}
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="calendar-clock"
              size={20}
              color={colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text
              className="font-figtree text-[10px] uppercase tracking-[0.8px]"
              style={{ color: colors.textSubtle }}
            >
              Next session
            </Text>
            <Text
              className="mt-1 font-figtree-bold text-[13px]"
              style={{ color: colors.text }}
            >
              {learner.nextSession.dateLabel} · {learner.nextSession.timeLabel}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}
