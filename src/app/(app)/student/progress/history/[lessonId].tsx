import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";

export default function ProgressLessonDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const lesson = useLearnerSessionsStore((state) =>
    state.progressLessons.find((item) => item.id === lessonId),
  );

  if (!lesson) {
    return (
      <DashboardScreen>
        <View
          className="items-center rounded-3xl border p-6"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="file-search-outline"
            size={36}
            color={colors.textMuted}
          />
          <Text
            className="mt-3 text-[16px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Lesson not found
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="mt-5 rounded-full px-5 py-3 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Go back
            </Text>
          </Pressable>
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        </Pressable>
        <View className="flex-1">
          <Text
            className="text-[10px] uppercase tracking-[2px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Completed lesson
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 text-[24px] leading-7 tracking-[-0.6px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {lesson.title}
          </Text>
        </View>
      </View>

      <View
        className="mt-6 rounded-[28px] border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text
              className="text-[11px] uppercase tracking-[1px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {lesson.schoolName}
            </Text>
            <Text
              className="mt-2 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {lesson.instructorName} · {lesson.completedAt}
            </Text>
          </View>
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="check"
              size={24}
              color={colors.success}
            />
          </View>
        </View>

        <View
          className="my-5 h-px"
          style={{ backgroundColor: colors.border }}
        />

        <Text
          className="text-[12px] uppercase tracking-[1px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Instructor feedback
        </Text>
        <Text
          className="mt-2 text-[14px] leading-6"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          {lesson.feedback}
        </Text>
      </View>

      <View className="mt-6">
        <Text
          className="text-[18px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Practise next
        </Text>
        <View className="mt-3 gap-3">
          {lesson.focusAreas.map((area) => (
            <View
              key={area}
              className="flex-row items-center rounded-2xl border p-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <MaterialCommunityIcons
                name="arrow-right-circle-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                className="ml-3 text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeSemibold,
                }}
              >
                {area}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </DashboardScreen>
  );
}
