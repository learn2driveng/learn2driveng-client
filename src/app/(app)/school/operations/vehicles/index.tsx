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
import { formatTransmissionLabel } from "@/lib/school/format";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolFleetScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Fleet" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Vehicles available for training and lesson assignment.
      </Text>
      <View className="mt-7">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/school/operations/vehicles/new")}
          className="h-12 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="text-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Add vehicle
          </Text>
        </Pressable>
      </View>
      <View className="mt-8">
        <SectionHeader title={`${vehicles.length} vehicles`} />
        <View className="mt-4 gap-3">
          {vehicles.map((vehicle) => (
            <Pressable
              key={vehicle.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/school/operations/vehicles/[vehicleId]",
                  params: { vehicleId: vehicle.id },
                })
              }
              className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
              style={surfaces.card}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="car-hatchback"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {vehicle.name}
                </Text>
                <Text
                  className="mt-1 text-[11px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {vehicle.plateNumber} ·{" "}
                  {formatTransmissionLabel(vehicle.transmissionType)}
                </Text>
                <Text
                  numberOfLines={1}
                  className="mt-1 text-[10px]"
                  style={{
                    color: colors.textSubtle,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {vehicle.assignedLocation}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-[10px] capitalize"
                  style={{
                    color: vehicle.isActive ? colors.success : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {vehicle.isActive ? "active" : "inactive"}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSubtle}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </DashboardScreen>
  );
}
