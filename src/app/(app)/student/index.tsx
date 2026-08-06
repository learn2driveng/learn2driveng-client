import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardEmptyState,
  DashboardScreen,
  PackageCreditCard,
  QuickAction,
  SectionHeader,
  StatCard,
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
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const user = useAuthStore((state) => state.user);
  const bookings = useLearnerOperationsStore((state) => state.bookings);
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const expiredPackages = useLearnerOperationsStore(selectExpiredLearnerPackages);
  const totalRemainingSessions = useLearnerOperationsStore(
    selectTotalRemainingSessions,
  );
  const joinedSessions = useLearnerSessionsStore((state) => state.joinedSessions);
  const activeLesson = useLearnerSessionsStore(selectActiveLessonCard);
  const upcomingLesson = useLearnerSessionsStore(selectUpcomingLessonCards)[0];
  const activeLocationShare = useTrainingSessionStore((state) =>
    activeLesson
      ? state.locationShares[activeLesson.sessionId]
      : undefined,
  );
  const progressSummary = computeProgressSummary(bookings, joinedSessions);
  const packagesWithCredits = activePackages.filter(
    (item) => item.remainingSessions > 0,
  );
  const hasPackages = activePackages.length > 0;
  const hasCredits = totalRemainingSessions > 0;
  const greetingName = user?.firstName ?? "there";
  const profileInitials = user ? userInitials(user) : "L2";
  const header = (
    <View className="flex-row items-center justify-between">
      <View>
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
          Welcome, {greetingName}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push("/student/profile/inbox")}
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
        </Pressable>
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.primary }}
          >
            {profileInitials}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <DashboardScreen>
      <AppLogo height={48} className="mb-6" />
      {header}

      {activeLesson ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Active lesson with ${activeLesson.instructor}. Location ${
            activeLocationShare?.status === "sharing"
              ? "is sharing"
              : "is not sharing"
          }.`}
          accessibilityHint="Opens live location controls"
          onPress={() =>
            router.push({
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
                {activeLocationShare?.status === "sharing"
                  ? "Sharing location"
                  : "Not sharing"}
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
              Manage live location
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={colors.contrastText}
            />
          </View>
        </Pressable>
      ) : null}

      <HeroSurface
        className={`${activeLesson ? "mt-5" : "mt-8"} rounded-[28px] p-6`}
      >
        <Text
          className="font-figtree-medium text-[15px]"
          style={{ color: colors.contrastMuted }}
        >
          Available session balance
        </Text>

        <View className="mt-4 flex-row items-baseline gap-2">
          <Text
            className="font-figtree-bold"
            style={{
              color: colors.primary,
              fontSize: 20,
            }}
          >
            {totalRemainingSessions}{" "}
            {totalRemainingSessions === 1 ? "Session" : "Sessions"}
          </Text>
        </View>
        <Text
          className="mt-2 font-figtree text-[14px]"
          style={{ color: colors.contrastMuted }}
        >
          {!hasPackages
            ? expiredPackages.length > 0
              ? "No active training packages"
              : "No training packages yet"
            : hasCredits
              ? `Across ${packagesWithCredits.length} active ${
                  packagesWithCredits.length === 1 ? "package" : "packages"
                }`
              : "No sessions remaining in your packages"}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push(hasCredits ? "/student/sessions" : "/student/explore")
          }
          className="mt-6 flex-row items-center justify-between border-t pt-4 active:opacity-70"
          style={{ borderTopColor: colors.contrastBorder }}
        >
          <Text
            className="font-figtree-semibold text-[13px]"
            style={{ color: colors.contrastText }}
          >
            {hasCredits ? "View breakdown" : "Explore packages"}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors.primary}
          />
        </Pressable>
      </HeroSurface>

      <View className="mt-8 flex-row gap-4">
        <StatCard
          icon="calendar-check"
          value={String(progressSummary.completedLessons)}
          label="Sessions completed"
        />
        <StatCard
          icon="clock-outline"
          value={progressSummary.drivingTime}
          label="Driving hours"
        />
      </View>

      <View className="mt-9">
        <SectionHeader
          title="Training packages"
          actionLabel={
            hasPackages ? (hasCredits ? "View all" : "Get more") : undefined
          }
          onActionPress={
            hasPackages
              ? () =>
                  router.push(
                    hasCredits ? "/student/sessions" : "/student/explore",
                  )
              : undefined
          }
        />
        {hasPackages ? (
          <View className="mt-4 gap-3">
            {activePackages.map((item) => (
              <PackageCreditCard
                key={item.id}
                name={item.name}
                icon={item.icon}
                totalSessions={item.totalSessions}
                remainingSessions={item.remainingSessions}
                status={item.status === "pending" ? "active" : item.status}
                onPress={() => router.push("/student/sessions")}
              />
            ))}
          </View>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="package-variant-plus"
              title={
                expiredPackages.length > 0
                  ? "No active training packages"
                  : "No training packages yet"
              }
              description={
                expiredPackages.length > 0
                  ? "Renew an expired package or choose a new one to continue booking lessons."
                  : "Choose a verified driving school and purchase a package to start booking lessons."
              }
              actionLabel="Explore packages"
              onActionPress={() => router.push("/student/explore")}
            />
          </View>
        )}
      </View>

      {expiredPackages.length > 0 ? (
        <View className="mt-9">
          <SectionHeader title="Expired packages" />
          <View className="mt-4 gap-3">
            {expiredPackages.map((item) => (
              <PackageCreditCard
                key={item.id}
                name={item.name}
                icon={item.icon}
                totalSessions={item.totalSessions}
                remainingSessions={item.remainingSessions}
                status="expired"
                actionLabel="Renew"
                onPress={() => router.push("/student/explore")}
              />
            ))}
          </View>
        </View>
      ) : null}

      {hasPackages && hasCredits && upcomingLesson ? (
        <View className="mt-9">
          <SectionHeader
            title="Upcoming session"
            actionLabel="View sessions"
            onActionPress={() => router.push("/student/sessions")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View upcoming session"
            onPress={() =>
              router.push({
                pathname: "/student/sessions/[bookingId]",
                params: { bookingId: upcomingLesson.id },
              })
            }
            className="mt-4 flex-row items-center gap-4 rounded-3xl border p-5 active:opacity-70"
            style={surfaces.card}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="steering"
                size={30}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-figtree-bold text-[17px]"
                style={{ color: colors.text }}
              >
                {upcomingLesson.packageName}
              </Text>
              <Text
                className="mt-1 font-figtree text-[13px]"
                style={{ color: colors.textMuted }}
              >
                {upcomingLesson.date} · {upcomingLesson.time}
              </Text>
              <Text
                className="mt-2 font-figtree-medium text-[12px]"
                style={{ color: colors.primary }}
              >
                {upcomingLesson.instructor} · {upcomingLesson.school}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSubtle}
            />
          </Pressable>
        </View>
      ) : null}

      <View className="mt-9">
        <SectionHeader title="Quick actions" />
        <View className="mt-4 flex-row gap-3">
          <QuickAction
            icon={hasCredits ? "calendar-plus" : "package-variant-plus"}
            label={hasCredits ? "Book session" : "Get a package"}
            onPress={() =>
              router.push(hasCredits ? "/student/sessions" : "/student/explore")
            }
          />
          <QuickAction
            icon="clipboard-text-outline"
            label="Take a quiz"
            onPress={() => router.push("/student/progress/assessments")}
          />
          <QuickAction
            icon="package-variant"
            label={hasPackages ? "View packages" : "Explore packages"}
            onPress={() =>
              router.push(
                hasPackages ? "/student/sessions" : "/student/explore",
              )
            }
          />
        </View>
      </View>
    </DashboardScreen>
  );
}
