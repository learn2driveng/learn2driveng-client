import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolOperationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const packages = useSchoolOperationsStore((state) => state.packages);
  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive).length;
  const activePackages = packages.filter((item) => item.isActive).length;

  const areas = [
    {
      icon: "car-multiple" as const,
      title: "Fleet",
      description:
        "Training vehicles, transmission, locations, and maintenance status",
      count: `${activeVehicles} active · ${vehicles.length} total`,
      href: "/school/operations/vehicles" as const,
    },
    {
      icon: "package-variant-closed" as const,
      title: "Packages",
      description:
        "Learner offers, pricing, session credits, and publication status",
      count: `${activePackages} published · ${packages.length} total`,
      href: "/school/operations/packages" as const,
    },
  ];

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Fleet and packages" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Choose what you want to manage. Booking assignments are handled
        separately from inventory setup.
      </Text>

      <View className="mt-8">
        <SectionHeader title="School inventory" />
        <View className="mt-4 gap-4">
          {areas.map((area) => (
            <Pressable
              key={area.title}
              accessibilityRole="button"
              accessibilityLabel={`Manage ${area.title}`}
              onPress={() => router.push(area.href)}
              className="rounded-[28px] border p-5 active:opacity-80"
              style={surfaces.card}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name={area.icon}
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[18px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {area.title}
                  </Text>
                  <Text
                    className="mt-1 text-[12px] leading-5"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {area.description}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={23}
                  color={colors.textSubtle}
                />
              </View>
              <View
                className="mt-5 border-t pt-4"
                style={{ borderTopColor: colors.border }}
              >
                <Text
                  className="text-[11px] uppercase tracking-[1px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {area.count}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View
        className="mt-8 rounded-3xl border p-4"
        style={{
          backgroundColor: colors.surfaceMuted,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row items-start gap-3">
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.verified}
          />
          <Text
            className="flex-1 text-[12px] leading-5"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            A vehicle must be active before assignment. A package must be
            published before learners can buy it.
          </Text>
        </View>
      </View>
    </DashboardScreen>
  );
}
