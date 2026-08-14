import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { ThemeSelector } from "@/components/common/theme-selector";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { SchoolAvatar } from "@/components/school/school-avatar";
import { DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useLogout } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

type Destination = {
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  description: string;
  href: Href;
};

const operationsDestinations: Destination[] = [
  {
    icon: "map-marker-path" as const,
    title: "Session monitoring",
    description: "See active lessons and sharing status",
    href: "/school/monitoring" as const,
  },
  {
    icon: "car-hatchback" as const,
    title: "Fleet and packages",
    description: "Manage training vehicles and package availability",
    href: "/school/operations" as const,
  },
];

const setupDestinations: Destination[] = [
  {
    icon: "file-certificate-outline" as const,
    title: "Verification documents",
    description: "Review or replace the evidence used for approval",
    href: "/school/verification-documents" as const,
  },
  {
    icon: "shield-check-outline" as const,
    title: "School profile",
    description: "Manage marketplace and verification information",
    href: "/school/profile" as const,
  },
];

export default function SchoolMoreScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const { logout } = useLogout();

  const renderDestinations = (destinations: Destination[]) =>
    destinations.map((destination) => (
      <Pressable
        key={destination.title}
        accessibilityRole="button"
        accessibilityLabel={destination.title}
        onPress={() => router.push(destination.href)}
        className="flex-row items-center gap-4 rounded-3xl border p-4 active:opacity-80"
        style={surfaces.card}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={destination.icon}
            size={24}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="text-[14px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {destination.title}
          </Text>
          <Text
            className="mt-1 text-[11px] leading-4"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {destination.description}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color={colors.textSubtle}
        />
      </Pressable>
    ));

  return (
    <DashboardScreen>
      <Text
        accessibilityRole="header"
        className="text-[28px] leading-8 tracking-[-0.8px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        More
      </Text>
      <Text
        className="mt-2 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Operations, school setup, verification, and display preferences.
      </Text>

      <HeroSurface className="mt-7 flex-row items-center gap-4 overflow-hidden rounded-[28px] p-5">
        <SchoolAvatar
          name={profile.name}
          logoUrl={profile.logoUrl}
          size={56}
          inverse
        />
        <View className="flex-1">
          <Text
            className="text-[17px]"
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {profile.name}
          </Text>
          <Text
            className="mt-1 text-[11px]"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            FRSC verified · {profile.primaryLocation}
          </Text>
        </View>
      </HeroSurface>

      <View className="mt-8">
        <SectionHeader title="Operations" />
        <View className="mt-4 gap-3">
          {renderDestinations(operationsDestinations)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="School setup" />
        <View className="mt-4 gap-3">
          {renderDestinations(setupDestinations)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Appearance" />
        <Text
          className="mt-2 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Use your device setting or choose a fixed app theme.
        </Text>
        <View className="mt-4">
          <ThemeSelector />
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Account" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={() => void logout()}
          className="mt-4 flex-row items-center gap-4 rounded-3xl border p-4 active:opacity-80"
          style={surfaces.card}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="logout"
              size={23}
              color={colors.error}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[14px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Log out
            </Text>
            <Text
              className="mt-1 text-[11px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Return to the public welcome screen
            </Text>
          </View>
        </Pressable>
      </View>
    </DashboardScreen>
  );
}
