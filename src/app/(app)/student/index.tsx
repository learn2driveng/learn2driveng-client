import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardScreen,
  PackageCreditCard,
  QuickAction,
  SectionHeader,
  StatCard,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

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
            style={{ backgroundColor: colors.text }}
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
        style={{ backgroundColor: colors.text }}
      >
        <Text className="font-figtree-medium text-[15px] text-white/70">
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
            20 Sessions
          </Text>
        </View>
        <Text className="mt-2 font-figtree text-[14px] text-white/65">
          Across 2 active packages
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/student/sessions")}
          className="mt-6 flex-row items-center justify-between border-t border-white/10 pt-4 active:opacity-70"
        >
          <Text className="font-figtree-semibold text-[13px] text-white">
            View breakdown
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
          title="Active packages"
          actionLabel="View all"
          onActionPress={() => router.push("/student/sessions")}
        />
        <View className="mt-4 gap-3">
          <PackageCreditCard
            name="Defensive Driving Package"
            icon="shield-car"
            totalSessions={10}
            remainingSessions={10}
            onPress={() => router.push("/student/sessions")}
          />
          <PackageCreditCard
            name="Professional Driving Package"
            icon="steering"
            totalSessions={10}
            remainingSessions={10}
            onPress={() => router.push("/student/sessions")}
          />
        </View>
      </View>

      <View className="mt-9">
        <SectionHeader
          title="Upcoming session"
          actionLabel="View sessions"
          onActionPress={() => router.push("/student/sessions")}
        />
        <Pressable
          accessibilityRole="button"
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

      <View className="mt-9">
        <SectionHeader title="Quick actions" />
        <View className="mt-4 flex-row gap-3">
          <QuickAction
            icon="calendar-plus"
            label="Book session"
            onPress={() => router.push("/student/sessions")}
          />
          <QuickAction icon="clipboard-text-outline" label="Take a quiz" />
          <QuickAction
            icon="package-variant"
            label="View packages"
            onPress={() => router.push("/student/sessions")}
          />
        </View>
      </View>
    </DashboardScreen>
  );
}
