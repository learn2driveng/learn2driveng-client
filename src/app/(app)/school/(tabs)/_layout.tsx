import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useRouter, type Href } from "expo-router";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

const schoolTabRoots: Readonly<Record<string, Href>> = {
  index: "/school",
  bookings: "/school/bookings",
  learners: "/school/learners",
  instructors: "/school/instructors",
  more: "/school/more",
};

export default function SchoolTabsLayout() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <Tabs
      screenListeners={({ route }) => ({
        tabPress: (event) => {
          const tabRoot = schoolTabRoots[route.name];
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
            <MaterialCommunityIcons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-check"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learners"
        options={{
          title: "Learners",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-school"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="instructors"
        options={{
          title: "Instructors",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-tie"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="dots-grid"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
