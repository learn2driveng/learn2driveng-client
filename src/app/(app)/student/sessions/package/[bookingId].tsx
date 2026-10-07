import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLearnerOperationsStore } from "@/store/learner-operations.store";
import { useReadinessAssessmentStore } from "@/store/readiness-assessment.store";

function formatPurchaseDate(value?: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatAmount(amount?: number, currency = "NGN") {
  if (amount == null) return "Not available";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function LearnerPackageDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const packageCredit = useLearnerOperationsStore((state) =>
    state.packages.find((item) => item.bookingId === bookingId),
  );
  const booking = useLearnerOperationsStore((state) =>
    state.bookings.find((item) => item.id === bookingId),
  );
  const quizAssignments = useReadinessAssessmentStore((state) => state.assignments);
  const quizzes = useReadinessAssessmentStore((state) => state.assessments);
  const refreshQuizzes = useReadinessAssessmentStore((state) => state.refreshLearner);
  useFocusEffect(useCallback(() => { void refreshQuizzes(); }, [refreshQuizzes]));
  const finalMockAssignment = quizAssignments.find((item) => item.bookingId === bookingId);
  const finalMock = quizzes.find((item) => item.id === finalMockAssignment?.assessmentId);

  if (!packageCredit || !booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Package details" />
        <View className="mt-8">
          <DashboardEmptyState
            icon="package-variant-remove"
            title="Package not found"
            description="This package is no longer available on your account."
            actionLabel="View my packages"
            onActionPress={() => router.replace("/student/sessions")}
          />
        </View>
      </DashboardScreen>
    );
  }

  const usedSessions = Math.max(
    packageCredit.totalSessions - packageCredit.remainingSessions,
    0,
  );
  const usedPercentage =
    packageCredit.totalSessions > 0
      ? Math.min(
          Math.round((usedSessions / packageCredit.totalSessions) * 100),
          100,
        )
      : 0;
  const canBook =
    packageCredit.status === "active" && packageCredit.remainingSessions > 0;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Package details" />

      <HeroSurface className="mt-7 rounded-[28px] p-6">
        <View
          className="self-start rounded-full px-3 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Text
            className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
            style={{ color: colors.primary }}
          >
            {packageCredit.status === "active"
              ? "Active package"
              : `${packageCredit.status} package`}
          </Text>
        </View>
        <Text
          className="mt-5 font-figtree-bold text-[25px] leading-8"
          style={{ color: colors.contrastText }}
        >
          {packageCredit.name}
        </Text>
        <Text
          className="mt-2 font-figtree-medium text-[13px]"
          style={{ color: colors.contrastMuted }}
        >
          {packageCredit.schoolName}
        </Text>

        <View className="mt-7 flex-row items-end justify-between gap-4">
          <View>
            <Text
              className="font-figtree-bold text-[36px]"
              style={{ color: colors.primary }}
            >
              {packageCredit.remainingSessions}
            </Text>
            <Text
              className="font-figtree text-[12px]"
              style={{ color: colors.contrastMuted }}
            >
              Lessons remaining
            </Text>
          </View>
          <Text
            className="font-figtree-bold text-[13px]"
            style={{ color: colors.contrastText }}
          >
            {usedSessions} of {packageCredit.totalSessions} used
          </Text>
        </View>
        <View
          className="mt-4 h-2 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.contrastBorder }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${usedPercentage}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </HeroSurface>

      {booking.status === "completed" && finalMockAssignment && finalMock ? (
        <View className="mt-6 rounded-[28px] border p-5" style={surfaces.card}>
          <View className="flex-row items-start gap-3">
            <MaterialCommunityIcons name="clipboard-text-outline" size={26} color={colors.primary} />
            <View className="flex-1">
              <Text className="font-figtree-bold text-[16px]" style={{ color: colors.text }}>
                Optional CBT mock is ready
              </Text>
              <Text className="mt-2 font-figtree text-[12px] leading-5" style={{ color: colors.textMuted }}>
                Your school prepared {finalMock.title}. Take it when you are ready; it does not affect your completed package.
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate({ pathname: "/student/progress/assessments/[assignmentId]", params: { assignmentId: finalMockAssignment.id } })}
            className="mt-4 min-h-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="font-figtree-bold text-[13px]" style={{ color: colors.onPrimary }}>
              {finalMockAssignment.status === "completed" ? "Review mock result" : "Take CBT mock"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-8">
        <SectionHeader title="Package summary" />
        <View
          className="mt-4 overflow-hidden rounded-[28px] border"
          style={surfaces.card}
        >
          {[
            ["Lessons included", String(booking.sessionsTotal)],
            ["Lessons booked", String(booking.sessionsScheduledCount)],
            ["Lessons completed", String(booking.sessionsCompletedCount)],
            ["Purchased", formatPurchaseDate(booking.createdAt)],
            ["Amount paid", formatAmount(booking.amount, booking.currency)],
          ].map(([label, value], index, rows) => (
            <View
              key={label}
              className="flex-row items-center justify-between gap-4 px-5 py-4"
              style={
                index < rows.length - 1
                  ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                  : undefined
              }
            >
              <Text
                className="font-figtree text-[13px]"
                style={{ color: colors.textMuted }}
              >
                {label}
              </Text>
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.text }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {canBook ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.navigate({
              pathname: "/student/sessions/book",
              params: {
                bookingId: packageCredit.bookingId,
                packageName: packageCredit.name,
                schoolName: packageCredit.schoolName,
              },
            })
          }
          className="mt-8 min-h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="calendar-plus"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.onPrimary }}
          >
            Book a lesson
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.navigate("/student/sessions")}
        className="mt-3 min-h-14 items-center justify-center rounded-full border px-6 active:opacity-70"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <Text
          className="font-figtree-bold text-[14px]"
          style={{ color: colors.text }}
        >
          View all lessons
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}
