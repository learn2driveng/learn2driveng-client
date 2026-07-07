import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import type { InstructorLessonStatus, InstructorLessonSummary } from "@/types";

type InstructorLessonCardProps = {
  lesson: InstructorLessonSummary;
  status?: InstructorLessonStatus;
  onPress?: () => void;
};

export function InstructorLessonCard({
  lesson,
  status: statusOverride,
  onPress,
}: InstructorLessonCardProps) {
  const { colors } = useAppTheme();
  const lessonStatus = statusOverride ?? lesson.status;
  const status = {
    upcoming: {
      label: "Upcoming",
      color: colors.verified,
      background: colors.verifiedSoft,
    },
    in_progress: {
      label: "In progress",
      color: colors.onPrimary,
      background: colors.primary,
    },
    completed: {
      label: "Completed",
      color: colors.success,
      background: colors.successSoft,
    },
  }[lessonStatus];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${lesson.time}. Lesson with ${lesson.learnerName}. ${lesson.packageName}. ${lesson.location}.`}
      accessibilityHint="Opens lesson details"
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className="flex-row items-center rounded-3xl border p-4 active:opacity-75"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <Text
          className="font-figtree-bold text-[13px]"
          style={{ color: colors.text }}
        >
          {lesson.learnerInitials}
        </Text>
      </View>
      <View className="ml-4 flex-1">
        <View className="flex-row items-center justify-between gap-3">
          <Text
            className="flex-1 font-figtree-bold text-[15px]"
            style={{ color: colors.text }}
          >
            {lesson.learnerName}
          </Text>
          <View className="items-end">
            <Text
              className="font-figtree-bold text-[13px]"
              style={{ color: colors.primary }}
            >
              {lesson.time}
            </Text>
            <View
              className="mt-1 rounded-full px-2 py-0.5"
              style={{ backgroundColor: status.background }}
            >
              <Text
                className="font-figtree-bold text-[10px] uppercase tracking-[0.4px]"
                style={{ color: status.color }}
              >
                {status.label}
              </Text>
            </View>
          </View>
        </View>
        <Text
          className="mt-1 font-figtree text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {lesson.packageName}
        </Text>
        <View className="mt-2 flex-row items-center gap-1">
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={14}
            color={colors.textSubtle}
          />
          <Text
            numberOfLines={1}
            className="flex-1 font-figtree text-[11px]"
            style={{ color: colors.textSubtle }}
          >
            {lesson.location} · {lesson.transmission}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={colors.textSubtle}
      />
    </Pressable>
  );
}
