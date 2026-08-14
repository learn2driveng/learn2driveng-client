import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";

export default function ProgressHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const progressLessons = useLearnerSessionsStore(
    (state) => state.progressLessons,
  );

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
            Progress
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 text-[24px] leading-7 tracking-[-0.6px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Lesson history
          </Text>
        </View>
      </View>

      {progressLessons.length === 0 ? (
        <View className="mt-8">
          <ContentEmptyState
            icon="history"
            title="No completed lessons yet"
            description="Completed sessions will appear here after attendance is marked."
            actionLabel="Book a session"
            onActionPress={() => router.push("/student/sessions")}
          />
        </View>
      ) : (
        <View className="mt-6 gap-4">
          {progressLessons.map((lesson) => (
            <Pressable
              key={lesson.id}
              accessibilityRole="button"
              accessibilityLabel={`View ${lesson.title}`}
              onPress={() =>
                router.push({
                  pathname: "/student/progress/history/[lessonId]",
                  params: { lessonId: lesson.id },
                })
              }
              className="rounded-3xl border p-4 active:opacity-80"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="car-clock"
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    className="text-[14px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {lesson.completedAt} · {lesson.duration}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={colors.textMuted}
                />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </DashboardScreen>
  );
}
