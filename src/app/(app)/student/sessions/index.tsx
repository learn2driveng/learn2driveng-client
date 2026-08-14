import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardScreen,
  PackageCreditCard,
  SectionHeader,
} from "@/components/dashboard";
import { BookingCard } from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
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
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const expiredPackages = useLearnerOperationsStore(selectExpiredLearnerPackages);
  const totalRemainingSessions = useLearnerOperationsStore(
    selectTotalRemainingSessions,
  );
  const selectedPackage = activePackages.find(
    (item) => item.id === selectedPackageId,
  );
  const hasPackages = activePackages.length > 0;
  const hasCredits = totalRemainingSessions > 0;
  const upcomingBooking = useLearnerSessionsStore(selectUpcomingLessonCards)[0];

  const bookSelectedPackage = () => {
    if (!selectedPackage) return;

    router.push({
      pathname: "/student/sessions/book",
      params: {
        packageName: selectedPackage.name,
        schoolName: selectedPackage.schoolName,
        bookingId: selectedPackage.bookingId,
      },
    });
  };

  return (
    <DashboardScreen>
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
        {hasCredits ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedPackage }}
            disabled={!selectedPackage}
            onPress={bookSelectedPackage}
            className="h-11 flex-row items-center gap-2 rounded-2xl px-4 active:opacity-75"
            style={{
              backgroundColor: selectedPackage
                ? colors.primary
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name="calendar-plus"
              size={19}
              color={selectedPackage ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="font-figtree-bold text-[13px]"
              style={{
                color: selectedPackage ? colors.onPrimary : colors.textSubtle,
              }}
            >
              Book
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasPackages && upcomingBooking ? (
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
                ? "Select the package you want to use, then tap Book."
                : "You have used all the sessions included in your packages."}
            </Text>
            {!hasCredits ? (
              <View className="mt-4">
                <DashboardEmptyState
                  icon="ticket-confirmation-outline"
                  title="No sessions remaining"
                  description="Explore available packages to continue your driving training."
                  actionLabel="Explore packages"
                  onActionPress={() => router.push("/student/explore")}
                />
              </View>
            ) : null}
            <View className="mt-4 gap-3">
              {activePackages.map((item) => {
                const hasPackageCredits = item.remainingSessions > 0;

                return (
                  <PackageCreditCard
                    key={item.id}
                    name={item.name}
                    icon={item.icon}
                    totalSessions={item.totalSessions}
                    remainingSessions={item.remainingSessions}
                    status={item.status === "pending" ? "active" : item.status}
                    selected={selectedPackageId === item.id}
                    disabled={!hasPackageCredits}
                    onPress={() => setSelectedPackageId(item.id)}
                  />
                );
              })}
            </View>
          </>
        ) : (
          <View className="mt-4">
            <DashboardEmptyState
              icon="package-variant-plus"
              title="No active packages"
              description={
                expiredPackages.length > 0
                  ? "Renew an expired package or purchase a new one before booking another session."
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
          <SectionHeader title="Expired packages" />
          <Text
            className="mt-2 font-figtree text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Expired packages cannot be used to book sessions.
          </Text>
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
    </DashboardScreen>
  );
}
