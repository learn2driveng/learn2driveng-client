import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  learnerAssessments,
  learnerProgressLessons,
  progressSkills,
} from "@/sample_data";

export default function StudentProgressScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const latestAssessment = learnerAssessments[0];
  const recentLesson = learnerProgressLessons[0];

  return (
    <DashboardScreen>
      <AppLogo height={48} className="mb-6" />
      <Text
        className="text-[10px] uppercase tracking-[2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        Learning journey
      </Text>
      <Text
        accessibilityRole="header"
        className="mt-1 text-[28px] leading-8 tracking-[-0.7px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Your driving <Text style={{ color: colors.primary }}>progress</Text>
      </Text>
      <Text
        className="mt-2 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Keep building confidence with every lesson.
      </Text>

      <View
        className="mt-7 rounded-[28px] border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-[86px] w-[86px] items-center justify-center rounded-full border-[8px]"
            style={{
              backgroundColor: colors.surfaceMuted,
              borderColor: colors.primary,
            }}
          >
            <Text
              className="text-[22px] tracking-[-0.5px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              68%
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Overall readiness
            </Text>
            <Text
              className="mt-2 text-[18px] leading-6"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              You’re right on track
            </Text>
            <Text
              className="mt-1 text-[12px] leading-4"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              6 of 10 lessons completed
            </Text>
          </View>
        </View>

        <View
          className="mt-5 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <View className="mt-4 flex-row">
          {[
            ["7h 20m", "Driving time"],
            ["86%", "Best score"],
            ["4", "Lessons left"],
          ].map(([value, label], index) => (
            <View
              key={label}
              className="flex-1 items-center px-1"
              style={
                index
                  ? { borderLeftWidth: 1, borderLeftColor: colors.border }
                  : undefined
              }
            >
              <Text
                className="text-[16px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
              <Text
                className="mt-1 text-center text-[9px] uppercase tracking-[0.5px]"
                style={{
                  color: colors.textSubtle,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Skill development" />
        <View
          className="mt-4 overflow-hidden rounded-3xl border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {progressSkills.map((skill, index) => (
            <View
              key={skill.id}
              className="py-4"
              style={
                index
                  ? { borderTopWidth: 1, borderTopColor: colors.border }
                  : undefined
              }
            >
              <View className="flex-row items-center">
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name={skill.icon}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text
                  className="ml-3 flex-1 text-[13px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeSemibold,
                  }}
                >
                  {skill.name}
                </Text>
                <Text
                  className="text-[12px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {skill.progress}%
                </Text>
              </View>
              <View
                className="ml-[52px] mt-3 h-1.5 overflow-hidden rounded-full"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${skill.progress}%`,
                  }}
                />
              </View>
              <Text
                className="ml-[52px] mt-2 text-[11px] leading-4"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtree,
                }}
              >
                {skill.note}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Assessments"
          actionLabel="View all"
          onActionPress={() => router.push("/student/progress/assessments")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View assessments"
          onPress={() => router.push("/student/progress/assessments")}
          className="mt-4 flex-row items-center rounded-3xl border p-4 active:opacity-80"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.successSoft }}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={27}
              color={colors.success}
            />
          </View>
          <View className="ml-4 flex-1">
            <Text
              className="text-[14px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {latestAssessment.title}
            </Text>
            <Text
              className="mt-1 text-[11px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Passed with an {latestAssessment.score}% score
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[11px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {latestAssessment.score}%
            </Text>
          </View>
        </Pressable>
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Lesson history"
          actionLabel="View all"
          onActionPress={() => router.push("/student/progress/history")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`View ${recentLesson.title}`}
          onPress={() =>
            router.push({
              pathname: "/student/progress/history/[lessonId]",
              params: { lessonId: recentLesson.id },
            })
          }
          className="mt-4 rounded-3xl border p-4 active:opacity-80"
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
                className="text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {recentLesson.title}
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {recentLesson.completedAt} · {recentLesson.duration}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textMuted}
            />
          </View>
          <Text
            className="mt-4 text-[12px] leading-5"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            {recentLesson.feedback}
          </Text>
        </Pressable>
      </View>
    </DashboardScreen>
  );
}
