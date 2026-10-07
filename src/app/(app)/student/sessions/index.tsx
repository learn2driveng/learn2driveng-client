import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardScreen,
  PackageCreditCard,
  SectionHeader,
} from "@/components/dashboard";
import { BookingCard } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import type { LearnerPackageCredit } from "@/lib/learner/map-api";
import {
  selectActiveLearnerPackages,
  selectExpiredLearnerPackages,
  selectTotalRemainingSessions,
  useLearnerOperationsStore,
} from "@/store/learner-operations.store";
import {
  selectUpcomingLessonCards,
  useLearnerSessionsStore,
} from "@/store/learner-sessions.store";

export default function StudentSessionsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const expiredPackages = useLearnerOperationsStore(
    selectExpiredLearnerPackages,
  );
  const refreshBookings = useLearnerOperationsStore(
    (state) => state.refreshBookings,
  );
  const totalRemainingSessions = useLearnerOperationsStore(
    selectTotalRemainingSessions,
  );
  const hasPackages = activePackages.length > 0;
  const hasCredits = totalRemainingSessions > 0;
  const upcomingBooking = useLearnerSessionsStore(selectUpcomingLessonCards)[0];

  useFocusEffect(
    useCallback(() => {
      void refreshBookings().catch(() => undefined);
    }, [refreshBookings]),
  );
  const refresh = useCallback(async () => {
    await Promise.all([refreshBookings(), refreshLearnerSessions()]);
  }, [refreshBookings]);

  const bookPackage = (packageCredit: LearnerPackageCredit) => {
    router.push({
      pathname: "/student/sessions/book",
      params: {
        packageName: packageCredit.name,
        schoolName: packageCredit.schoolName,
        bookingId: packageCredit.bookingId,
      },
    });
  };

  const viewPackage = (packageCredit: LearnerPackageCredit) => {
    router.push({
      pathname: "/student/sessions/package/[bookingId]",
      params: { bookingId: packageCredit.bookingId },
    });
  };

  return (
    <DashboardScreen onRefresh={refresh}>
      <Text
        accessibilityRole="header"
        className="font-figtree-bold text-[30px]"
        style={{ color: colors.text }}
      >
        Sessions
      </Text>
      <Text
        className="mt-2 font-figtree text-[16px]"
        style={{ color: colors.textMuted }}
      >
        Book and manage the driving sessions included in your packages.
      </Text>

      <View
        className="mt-8 flex-row items-center gap-4 rounded-3xl p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="ticket-confirmation-outline"
            size={25}
            color={colors.onPrimary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree-bold text-[26px]"
            style={{ color: colors.contrastText }}
          >
            {totalRemainingSessions}
          </Text>
          <Text
            className="font-figtree text-[13px]"
            style={{ color: colors.contrastMuted }}
          >
            Available session credits
          </Text>
        </View>
      </View>

      {upcomingBooking ? (
        <View className="mt-9">
          <SectionHeader
            title="Upcoming lesson"
            actionLabel="View history"
            onActionPress={() => router.push("/student/sessions/history")}
          />
          <View className="mt-4">
            <BookingCard
              booking={upcomingBooking}
              onPress={() =>
                router.push({
                  pathname: "/student/sessions/[bookingId]",
                  params: { bookingId: upcomingBooking.id },
                })
              }
            />
          </View>
        </View>
      ) : null}

      <View className="mt-9">
        <SectionHeader title="Training packages" />
        {hasPackages ? (
          <>
            <Text
              className="mt-2 font-figtree text-[13px]"
              style={{ color: colors.textMuted }}
            >
              {hasCredits
                ? "Book a lesson directly from a package with available credits."
                : "All lessons in your active packages are booked."}
            </Text>
            <View className="mt-4 gap-3">
              {activePackages.map((item) => (
                <PackageCreditCard
                  key={item.id}
                  name={item.name}
                  schoolName={item.schoolName}
                  icon={item.icon}
                  totalSessions={item.totalSessions}
                  remainingSessions={item.remainingSessions}
                  status={item.status}
                  onBookPress={() => bookPackage(item)}
                  onViewPress={() => viewPackage(item)}
                />
              ))}
            </View>
          </>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="package-variant-plus"
              title="No active packages"
              description={
                expiredPackages.length > 0
                  ? "Purchase a new package before booking another session."
                  : "Purchase a training package before booking your first driving session."
              }
              actionLabel="Explore packages"
              onActionPress={() => router.push("/student/explore")}
            />
          </View>
        )}
      </View>

      {expiredPackages.length > 0 ? (
        <View className="mt-9">
          <SectionHeader title="Past packages" />
          <Text
            className="mt-2 font-figtree text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Completed and inactive packages cannot be used to book sessions.
          </Text>
          <View className="mt-4 gap-3">
            {expiredPackages.map((item) => (
              <PackageCreditCard
                key={item.id}
                name={item.name}
                schoolName={item.schoolName}
                icon={item.icon}
                totalSessions={item.totalSessions}
                remainingSessions={item.remainingSessions}
                status={item.status}
                onViewPress={() => viewPackage(item)}
              />
            ))}
          </View>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
