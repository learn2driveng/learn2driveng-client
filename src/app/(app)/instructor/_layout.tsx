import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";

import { fontFamily } from "@/constants/fonts";
import { useRoleRouteAccess } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { hydrateInstructorOperations } from "@/lib/instructor/hydrate-instructor-operations";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import { InstructorLocationPublisher } from "@/features/location";

export default function InstructorLayout() {
  const { colors } = useAppTheme();
  const access = useRoleRouteAccess("instructor", "/instructor");
  const [hydrated, setHydrated] = useState(false);
  const outstandingReports = useInstructorOperationsStore(
    (state) => state.profile.outstandingReports ?? 0,
  );

  useEffect(() => {
    if (access.status !== "allowed") return;

    let active = true;

    hydrateInstructorOperations()
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
      <InstructorLocationPublisher />
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
          name="schedule"
          options={{
            title: "Schedule",
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
          name="attendance"
          options={{
            title: "Attendance",
            tabBarBadge:
              outstandingReports > 0 ? outstandingReports : undefined,
            tabBarBadgeStyle: {
              backgroundColor: colors.error,
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
              fontSize: 10,
            },
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="clipboard-account-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="availability"
          options={{
            title: "Availability",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="calendar-account"
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
        <Tabs.Screen name="sessions" options={{ href: null }} />
      </Tabs>
    </>
  );
}
