import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardEmptyState,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { userInitials } from "@/lib/learner/map-api";
import { computeProgressSummary } from "@/lib/learner/map-sessions";
import { useAuthStore } from "@/store/auth.store";
import {
  selectActiveLearnerPackages,
  selectExpiredLearnerPackages,
  selectTotalRemainingSessions,
  useLearnerOperationsStore,
} from "@/store/learner-operations.store";
import {
  selectActiveLessonCard,
  selectUpcomingLessonCards,
  useLearnerSessionsStore,
} from "@/store/learner-sessions.store";
import {
  refreshNotificationUnreadCount,
  useNotificationStore,
} from "@/store/notification.store";

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const user = useAuthStore((state) => state.user);
  const unreadNotificationCount = useNotificationStore(
    (state) => state.unreadCount,
  );
  const bookings = useLearnerOperationsStore((state) => state.bookings);
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const expiredPackages = useLearnerOperationsStore(
    selectExpiredLearnerPackages,
  );
  const totalRemainingSessions = useLearnerOperationsStore(
    selectTotalRemainingSessions,
  );
  const joinedSessions = useLearnerSessionsStore(
    (state) => state.joinedSessions,
  );
  const activeLesson = useLearnerSessionsStore(selectActiveLessonCard);
  const upcomingLesson = useLearnerSessionsStore(selectUpcomingLessonCards)[0];
  const progressSummary = computeProgressSummary(bookings, joinedSessions);
  const packagesWithCredits = activePackages.filter(
    (item) => item.remainingSessions > 0,
  );
  const hasPackages = activePackages.length > 0;
  const hasCredits = totalRemainingSessions > 0;
  const bookablePackage = packagesWithCredits[0];
  const hasMultipleBookablePackages = packagesWithCredits.length > 1;
  const currentPackage = activePackages[0];
  const completedPercentage =
    progressSummary.totalLessons > 0
      ? Math.min(
          Math.round(
            (progressSummary.completedLessons / progressSummary.totalLessons) *
              100,
          ),
          100,
        )
      : 0;
  const greetingName = user?.firstName ?? "there";
  const profileInitials = user ? userInitials(user) : "L2";
  useFocusEffect(
    useCallback(() => {
      void refreshNotificationUnreadCount().catch(() => undefined);
    }, []),
  );
  const header = (
    <View className="flex-row items-center justify-between">
      <View>
        <Text
          className="font-figtree text-[14px]"
          style={{ color: colors.textMuted }}
        >
          Welcome back
        </Text>
        <Text
          accessibilityRole="header"
          className="mt-1 font-figtree-bold text-[28px]"
          style={{ color: colors.text }}
        >
          Hi, {greetingName}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            unreadNotificationCount > 0
              ? `Notifications, ${unreadNotificationCount} unread`
              : "Notifications"
          }
          onPress={() => router.navigate("/student/profile/inbox")}
          className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={22}
            color={colors.text}
          />
          {unreadNotificationCount > 0 ? (
            <View
              className="absolute -right-1 -top-1 min-w-5 items-center justify-center rounded-full border-2 px-1"
              style={{
                height: 20,
                borderColor: colors.background,
                backgroundColor: colors.primary,
              }}
            >
              <Text
                className="font-figtree-bold text-[10px] leading-[16px]"
                style={{ color: colors.onPrimary }}
              >
                {unreadNotificationCount > 99
                  ? "99+"
                  : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.navigate("/student/profile")}
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.primary }}
          >
            {profileInitials}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <DashboardScreen>
      {header}

      {activeLesson ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Active lesson with ${activeLesson.instructor}. View live instructor location.`}
          accessibilityHint="Opens the live lesson map"
          onPress={() =>
            router.navigate({
              pathname: "/student/sessions/[bookingId]/live-location",
              params: { bookingId: activeLesson.id },
            })
          }
          className="mt-8 overflow-hidden rounded-[28px] p-5 active:opacity-80"
          style={{ backgroundColor: colors.success }}
        >
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-row items-center gap-2">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colors.contrastText }}
              />
              <Text
                className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
                style={{ color: colors.contrastText }}
              >
                Lesson in progress
              </Text>
            </View>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
            >
              <Text
                className="font-figtree-bold text-[10px]"
                style={{ color: colors.contrastText }}
              >
                Live tracking
              </Text>
            </View>
          </View>
          <Text
            className="mt-5 font-figtree-bold text-[21px]"
            style={{ color: colors.contrastText }}
          >
            {activeLesson.packageName}
          </Text>
          <Text
            className="mt-2 font-figtree text-[12px]"
            style={{ color: colors.contrastText }}
          >
            {activeLesson.instructor} · {activeLesson.location}
          </Text>
          <View
            className="mt-5 flex-row items-center justify-between border-t pt-4"
            style={{ borderTopColor: "rgba(255,255,255,0.24)" }}
          >
            <Text
              className="font-figtree-bold text-[13px]"
              style={{ color: colors.contrastText }}
            >
              View live location
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={colors.contrastText}
            />
          </View>
        </Pressable>
      ) : null}

      {upcomingLesson ? (
        <HeroSurface
          className={`${activeLesson ? "mt-5" : "mt-8"} rounded-[28px] p-6`}
        >
          <View className="flex-row items-center justify-between gap-4">
            <View
              className="flex-row items-center gap-2 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
              />
              <Text
                className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
                style={{ color: colors.contrastText }}
              >
                Next lesson
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.navigate("/student/sessions")}
              className="min-h-10 justify-center rounded-full px-3 active:opacity-70"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Text
                className="font-figtree-bold text-[11px]"
                style={{ color: colors.contrastMuted }}
              >
                All lessons
              </Text>
            </Pressable>
          </View>

          <Text
            className="mt-6 font-figtree-bold text-[24px] leading-7"
            style={{ color: colors.contrastText }}
          >
            {upcomingLesson.packageName}
          </Text>
          <View className="mt-4 flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(255,184,0,0.15)" }}
            >
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={23}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-figtree-bold text-[16px]"
                style={{ color: colors.contrastText }}
              >
                {upcomingLesson.date}
              </Text>
              <Text
                className="mt-0.5 font-figtree-medium text-[13px]"
                style={{ color: colors.contrastMuted }}
              >
                {upcomingLesson.time}
              </Text>
            </View>
          </View>

          <View
            className="mt-5 border-t pt-4"
            style={{ borderTopColor: colors.contrastBorder }}
          >
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons
                name="account-outline"
                size={17}
                color={colors.contrastMuted}
              />
              <Text
                numberOfLines={1}
                className="flex-1 font-figtree-medium text-[12px]"
                style={{ color: colors.contrastMuted }}
              >
                {upcomingLesson.instructor} · {upcomingLesson.school}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View upcoming lesson"
            onPress={() =>
              router.navigate({
                pathname: "/student/sessions/[bookingId]",
                params: { bookingId: upcomingLesson.id },
              })
            }
            className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="arrow-right"
              size={19}
              color={colors.onPrimary}
            />
            <Text
              className="font-figtree-bold text-[14px]"
              style={{ color: colors.onPrimary }}
            >
              View lesson
            </Text>
          </Pressable>
        </HeroSurface>
      ) : hasCredits && bookablePackage ? (
        <HeroSurface
          className={`${activeLesson ? "mt-5" : "mt-8"} rounded-[28px] p-6`}
        >
          <View
            className="self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <Text
              className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
              style={{ color: colors.primary }}
            >
              Ready to book
            </Text>
          </View>
          <Text
            className="mt-5 font-figtree-bold text-[24px]"
            style={{ color: colors.contrastText }}
          >
            Choose your next lesson
          </Text>
          <Text
            className="mt-2 font-figtree text-[14px] leading-5"
            style={{ color: colors.contrastMuted }}
          >
            {hasMultipleBookablePackages
              ? `You have ${packagesWithCredits.length} packages with lessons available.`
              : `Select a date and time for ${bookablePackage.name}.`}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasMultipleBookablePackages
                ? "Choose a package to book a lesson"
                : `Book a lesson from ${bookablePackage.name}`
            }
            onPress={() =>
              hasMultipleBookablePackages
                ? router.navigate("/student/sessions")
                : router.navigate({
                    pathname: "/student/sessions/book",
                    params: {
                      bookingId: bookablePackage.bookingId,
                      packageName: bookablePackage.name,
                      schoolName: bookablePackage.schoolName,
                    },
                  })
            }
            className="mt-6 min-h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
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
              {hasMultipleBookablePackages
                ? "Choose a package"
                : "Book a lesson"}
            </Text>
          </Pressable>
        </HeroSurface>
      ) : (
        <View className={`${activeLesson ? "mt-5" : "mt-8"}`}>
          <DashboardEmptyState
            icon="calendar-plus"
            title={hasPackages ? "No lessons remaining" : "Start your training"}
            description={
              hasPackages
                ? "Choose another package to continue booking lessons."
                : expiredPackages.length > 0
                  ? "Your previous package has expired. Choose a package to continue."
                  : "Choose a driving school and package to begin."
            }
            actionLabel="Explore packages"
            onActionPress={() => router.navigate("/student/explore")}
          />
        </View>
      )}

      <View className="mt-8">
        <SectionHeader
          title="Your training"
          actionLabel="View progress"
          onActionPress={() => router.navigate("/student/progress")}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View training progress"
          onPress={() => router.navigate("/student/progress")}
          className="mt-4 rounded-[28px] border p-5 active:opacity-80"
          style={surfaces.card}
        >
          <View className="flex-row">
            <View className="flex-1 items-center px-1">
              <Text
                className="font-figtree-bold text-[24px]"
                style={{ color: colors.text }}
              >
                {totalRemainingSessions}
              </Text>
              <Text
                className="mt-1 text-center font-figtree text-[11px]"
                style={{ color: colors.textMuted }}
              >
                Available
              </Text>
            </View>
            <View className="w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-1 items-center px-1">
              <Text
                className="font-figtree-bold text-[24px]"
                style={{ color: colors.text }}
              >
                {progressSummary.completedLessons}
              </Text>
              <Text
                className="mt-1 text-center font-figtree text-[11px]"
                style={{ color: colors.textMuted }}
              >
                Completed
              </Text>
            </View>
            <View className="w-px" style={{ backgroundColor: colors.border }} />
            <View className="flex-1 items-center px-1">
              <Text
                className="font-figtree-bold text-[24px]"
                style={{ color: colors.text }}
              >
                {progressSummary.drivingTime}
              </Text>
              <Text
                className="mt-1 text-center font-figtree text-[11px]"
                style={{ color: colors.textMuted }}
              >
                Driving time
              </Text>
            </View>
          </View>
          <View
            className="mt-5 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${completedPercentage}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
        </Pressable>
      </View>

      {hasPackages && currentPackage ? (
        <View className="mt-8">
          <SectionHeader
            title="Current package"
            actionLabel={activePackages.length > 1 ? "View all" : undefined}
            onActionPress={
              activePackages.length > 1
                ? () => router.navigate("/student/sessions")
                : undefined
            }
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${currentPackage.name}, ${currentPackage.remainingSessions} lessons remaining`}
            accessibilityHint="Opens package details and booking options"
            onPress={() =>
              router.navigate({
                pathname: "/student/sessions/package/[bookingId]",
                params: { bookingId: currentPackage.bookingId },
              })
            }
            className="mt-4 rounded-[28px] border p-4 active:opacity-80"
            style={surfaces.card}
          >
            <View className="flex-row items-center gap-4">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "rgba(255,184,0,0.14)" }}
              >
                <MaterialCommunityIcons
                  name={currentPackage.icon}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="font-figtree-bold text-[15px]"
                  style={{ color: colors.text }}
                >
                  {currentPackage.name}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-1 font-figtree text-[12px]"
                  style={{ color: colors.textMuted }}
                >
                  {currentPackage.schoolName}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-2"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <Text
                  className="font-figtree-bold text-[11px]"
                  style={{ color: colors.text }}
                >
                  {currentPackage.remainingSessions}/
                  {currentPackage.totalSessions} left
                </Text>
              </View>
            </View>
            <View
              className="mt-4 flex-row items-center justify-between border-t pt-4"
              style={{ borderTopColor: colors.border }}
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.text }}
              >
                View package
              </Text>
              <View
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.contrastSurface }}
              >
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color={colors.primary}
                />
              </View>
            </View>
          </Pressable>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
