import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";

import { fontFamily } from "@/constants/fonts";
import { useRoleRouteAccess } from "@/features/auth";
import { LearnerLocationPublisher } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import { hydrateLearnerOperations } from "@/lib/learner/hydrate-learner-operations";
import { hydrateLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";

export default function StudentLayout() {
  const { colors } = useAppTheme();
  const access = useRoleRouteAccess("learner", "/student");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (access.status !== "allowed") return;

    let active = true;

    Promise.all([
      hydrateLearnerOperations(),
      hydrateLearnerSessions(),
    ])
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [access.status]);

  if (access.status === "checking") return null;
  if (access.status === "redirect") return <Redirect href={access.href} />;
  if (!hydrated) return null;

  return (
    <>
      <LearnerLocationPublisher />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
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
