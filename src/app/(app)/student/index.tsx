import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardScreen,
  PackageCreditCard,
  QuickAction,
  SectionHeader,
  StatCard,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { studentPackages } from "@/sample_data";

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const activePackages = studentPackages.filter(
    (item) => item.status === "active",
  );
  const expiredPackages = studentPackages.filter(
    (item) => item.status === "expired",
  );
  const totalRemainingSessions = activePackages.reduce(
    (total, item) => total + item.remainingSessions,
    0,
  );
  const packagesWithCredits = activePackages.filter(
    (item) => item.remainingSessions > 0,
  );
  const hasPackages = activePackages.length > 0;
  const hasCredits = totalRemainingSessions > 0;

  return (
    <DashboardScreen>
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
            Welcome, Alex
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
              AJ
            </Text>
          </View>
        </View>
      </View>

      <View
        className="mt-8 rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
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
      </View>

      <View className="mt-8 flex-row gap-4">
        <StatCard icon="calendar-check" value="4" label="Sessions completed" />
        <StatCard icon="clock-outline" value="18.5h" label="Driving hours" />
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
                status={item.status}
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
                status={item.status}
                expiresOn={item.expiresOn}
                actionLabel="Renew"
                onPress={() => router.push("/student/explore")}
              />
            ))}
          </View>
        </View>
      ) : null}

      {hasPackages ? (
        <View className="mt-9">
          <SectionHeader
            title="Upcoming session"
            actionLabel="View sessions"
            onActionPress={() => router.push("/student/sessions")}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View upcoming session"
            onPress={() => router.push("/student/sessions")}
            className="mt-4 flex-row items-center gap-4 rounded-3xl border p-5 active:opacity-70"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
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
                Practical Driving Session
              </Text>
              <Text
                className="mt-1 font-figtree text-[13px]"
                style={{ color: colors.textMuted }}
              >
                Tomorrow · 10:00 AM · Instructor John
              </Text>
              <Text
                className="mt-2 font-figtree-medium text-[12px]"
                style={{ color: colors.primary }}
              >
                Defensive Driving Package · Session 1 of 10
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
          <QuickAction icon="clipboard-text-outline" label="Take a quiz" />
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
