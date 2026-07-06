import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type {
  GuardianLearnerSummary,
  InstructorLessonSummary,
  LocationSharingStatus,
} from "@/types";

type GuardianActiveSessionCardProps = {
  learner: GuardianLearnerSummary;
  lesson: InstructorLessonSummary;
  sharingStatus: LocationSharingStatus | undefined;
  canViewLocation: boolean;
  onPress: () => void;
};

export function GuardianActiveSessionCard({
  learner,
  lesson,
  sharingStatus,
  canViewLocation,
  onPress,
}: GuardianActiveSessionCardProps) {
  const { colors } = useAppTheme();
  const isSharing = sharingStatus === "sharing" && canViewLocation;
  const statusLabel = isSharing
    ? "Live location"
    : sharingStatus === "sharing"
      ? "Not shared with you"
      : sharingStatus === "failed"
        ? "Location unavailable"
        : sharingStatus === "stopped"
          ? "Sharing stopped"
          : "Waiting for learner";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${learner.name}'s lesson is active. ${statusLabel}.`}
      accessibilityHint="Opens active-session tracking"
      onPress={onPress}
      className="overflow-hidden rounded-[28px] p-5 active:opacity-80"
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
            Session active
          </Text>
        </View>
        <View
          className="rounded-full px-3 py-1.5"
          style={{
            backgroundColor: isSharing
              ? colors.successSoft
              : colors.contrastBorder,
          }}
        >
          <Text
            className="font-figtree-bold text-[10px]"
            style={{
              color: isSharing ? colors.success : colors.contrastMuted,
            }}
          >
            {statusLabel}
          </Text>
        </View>
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
            className="font-figtree-bold text-[19px]"
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
          {lesson.location}
        </Text>
      </View>
      <View className="mt-4 flex-row items-center justify-end gap-2">
        <Text
          className="font-figtree-bold text-[13px]"
          style={{ color: colors.primary }}
        >
          {isSharing ? "View live map" : "View active session"}
        </Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={colors.primary}
        />
      </View>
    </Pressable>
  );
}
