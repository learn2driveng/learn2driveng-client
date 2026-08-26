import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";

import { fontFamily } from "@/constants/fonts";
import { RoleRouteGuard } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { hydrateLearnerOperations } from "@/lib/learner/hydrate-learner-operations";
import { hydrateLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { useAuthStore } from "@/store/auth.store";

const studentTabRoots: Readonly<Record<string, Href>> = {
  index: "/student",
  explore: "/student/explore",
  sessions: "/student/sessions",
  progress: "/student/progress",
  profile: "/student/profile",
};

export default function StudentLayout() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);
  const hasAccess = status === "authenticated" && role === "learner";
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hasAccess) return;

    let active = true;

    Promise.all([hydrateLearnerOperations(), hydrateLearnerSessions()])
      .catch(() => undefined)
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <RoleRouteGuard allowedRoles={["learner"]} fallbackReturnTo="/student">
        {null}
      </RoleRouteGuard>
    );
  }
  if (!hydrated) return null;

  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: (event) => {
          const tabRoot = studentTabRoots[route.name];
          if (!tabRoot) return;

          event.preventDefault();
          router.replace(tabRoot);
        },
      })}
      screenOptions={{
        headerShown: false,
        popToTopOnBlur: true,
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
            <MaterialCommunityIcons name="compass" size={size} color={color} />
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
  );
}
