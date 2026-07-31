import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { fontFamily } from "@/constants/fonts";
import { useRoleRouteAccess } from "@/features/auth";
import { LearnerLocationPublisher } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentLayout() {
  const { colors } = useAppTheme();
  const access = useRoleRouteAccess("learner", "/student");

  if (access.status === "checking") return null;
  if (access.status === "redirect") return <Redirect href={access.href} />;

  return (
    <>
      <LearnerLocationPublisher />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSubtle,
          tabBarLabelStyle: {
            fontFamily: fontFamily.figtreeMedium,
            fontSize: 11,
          },
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="home-variant"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: "Explore",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="compass"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: "Sessions",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-clock"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: "Progress",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="chart-line"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="account-circle"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
