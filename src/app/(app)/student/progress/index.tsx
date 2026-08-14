import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { computeProgressSummary } from "@/lib/learner/map-sessions";
import {
  selectActiveLearnerPackages,
  useLearnerOperationsStore,
} from "@/store/learner-operations.store";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";

export default function StudentProgressScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const bookings = useLearnerOperationsStore((state) => state.bookings);
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const joinedSessions = useLearnerSessionsStore(
    (state) => state.joinedSessions,
  );
  const progressLessons = useLearnerSessionsStore(
    (state) => state.progressLessons,
  );
  const summary = computeProgressSummary(bookings, joinedSessions);
  const currentPackage = activePackages[0];
  const recentLesson = progressLessons[0];
  const completedPercentage =
    summary.totalLessons > 0
      ? Math.min(
          Math.round((summary.completedLessons / summary.totalLessons) * 100),
          100,
        )
      : 0;

  return (
    <DashboardScreen>
      <Text
        accessibilityRole="header"
        className="text-[28px] leading-8 tracking-[-0.7px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Your training
      </Text>
      <Text
        className="mt-2 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        See the lessons you have attended and feedback from your instructor.
      </Text>

      <View
        className="mt-7 overflow-hidden rounded-[28px] border"
        style={{
          backgroundColor: colors.contrastSurface,
          borderColor: colors.contrastBorder,
        }}
      >
        <View className="p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text
                className="text-[10px] uppercase tracking-[1.4px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {currentPackage ? "Current package" : "Training record"}
              </Text>
              <Text
                className="mt-2 text-[19px] leading-6"
                style={{
                  color: colors.contrastText,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {currentPackage?.name ?? "No active package"}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {currentPackage?.schoolName ??
                  "Choose a package to begin training"}
              </Text>
            </View>
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialCommunityIcons
                name={currentPackage?.icon ?? "steering"}
                size={23}
                color={colors.onPrimary}
              />
            </View>
          </View>

          <View className="mt-6 flex-row items-end justify-between">
            <Text
              className="text-[13px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeSemibold,
              }}
            >
              {summary.completedLessons} attended
            </Text>
            <Text
              className="text-[12px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {summary.totalLessons} total lessons
            </Text>
          </View>
          <View
            className="mt-3 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.contrastSurfaceStrong }}
          >
            <View
              className="h-full rounded-full"
              style={{
                backgroundColor: colors.primary,
                width: `${completedPercentage}%`,
              }}
            />
          </View>
        </View>

        <View
          className="flex-row border-t"
          style={{ borderColor: colors.contrastBorder }}
        >
          <TrainingStat value={summary.drivingTime} label="Driving time" />
          <TrainingStat
            value={String(summary.completedLessons)}
            label="Attended"
            bordered
          />
          <TrainingStat
            value={String(summary.remainingLessons)}
            label="Remaining"
            bordered
          />
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Latest instructor feedback" />
        {recentLesson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View feedback for ${recentLesson.title}`}
            onPress={() =>
              router.push({
                pathname: "/student/progress/history/[lessonId]",
                params: { lessonId: recentLesson.id },
              })
            }
            className="mt-4 rounded-3xl border p-5 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={21}
                  color={colors.onPrimary}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  className="text-[15px]"
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
                  {recentLesson.instructorName} · {recentLesson.completedAt}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.textSubtle}
              />
            </View>
            <Text
              className="mt-4 text-[13px] leading-5"
              numberOfLines={4}
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              {recentLesson.feedback}
            </Text>
          </Pressable>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="message-text-clock-outline"
              title="No instructor feedback yet"
              description="Feedback will appear here after you attend a lesson and your instructor completes the report."
              actionLabel="View available lessons"
              onActionPress={() => router.push("/student/sessions")}
            />
          </View>
        )}
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Lessons attended"
          actionLabel={recentLesson ? "View all" : undefined}
          onActionPress={
            recentLesson
              ? () => router.push("/student/progress/history")
              : undefined
          }
        />
        {recentLesson ? (
          <View
            className="mt-4 flex-row items-center rounded-3xl border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.successSoft }}
            >
              <MaterialCommunityIcons
                name="check"
                size={22}
                color={colors.success}
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
          </View>
        ) : null}
      </View>
    </DashboardScreen>
  );
}

function TrainingStat({
  value,
  label,
  bordered = false,
}: {
  value: string;
  label: string;
  bordered?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center px-2 py-4"
      style={
        bordered
          ? { borderLeftWidth: 1, borderLeftColor: colors.contrastBorder }
          : undefined
      }
    >
      <Text
        className="text-[17px]"
        style={{
          color: colors.contrastText,
          fontFamily: fontFamily.figtreeBold,
        }}
      >
        {value}
      </Text>
      <Text
        className="mt-1 text-[9px] uppercase tracking-[0.7px]"
        style={{
          color: colors.contrastMuted,
          fontFamily: fontFamily.figtreeBold,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
