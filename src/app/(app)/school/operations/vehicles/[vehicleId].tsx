import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateSchoolVehicle } from "@/lib/api";
import { formatTransmissionLabel } from "@/lib/school/format";
import { vehicleToSchoolVehicle } from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

export default function SchoolVehicleDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicle = useSchoolOperationsStore((state) =>
    state.vehicles.find((item) => item.id === vehicleId),
  );
  const upsertVehicle = useSchoolOperationsStore((state) => state.upsertVehicle);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const setActiveState = async (isActive: boolean) => {
    if (!vehicle || isUpdating) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      const updated = await updateSchoolVehicle(vehicle.id, { isActive });
      upsertVehicle({
        ...vehicleToSchoolVehicle(updated),
        assignedLocation: vehicle.assignedLocation,
        lastInspectionAt: vehicle.lastInspectionAt,
        lessonsThisWeek: vehicle.lessonsThisWeek,
      });
    } catch (caught) {
      const error = caught as ApiError;
      setUpdateError(error.message || "We could not update this vehicle.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!vehicle) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Vehicle" />
        <View className="mt-8">
          <ContentEmptyState
            icon="car-off"
            title="Vehicle not found"
            description="This vehicle is not in the school fleet."
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Vehicle details" />

      <View
        className="mt-7 rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center gap-4">
          <Pressable
            accessibilityRole={vehicle.photoUrl ? "button" : undefined}
            accessibilityLabel={
              vehicle.photoUrl
                ? `View ${vehicle.name} photograph full screen`
                : undefined
            }
            disabled={!vehicle.photoUrl}
            onPress={() => setIsPhotoOpen(true)}
            className="h-16 w-16 items-center justify-center overflow-hidden rounded-3xl"
            style={{ backgroundColor: colors.primary }}
          >
            {vehicle.photoUrl ? <Image source={{ uri: vehicle.photoUrl }} className="h-full w-full" resizeMode="cover" /> : <MaterialCommunityIcons
              name="car-hatchback"
              size={32}
              color={colors.onPrimary}
            />}
          </Pressable>
          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="text-[23px] leading-7 tracking-[-0.5px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {vehicle.name}
            </Text>
            <Text
              className="mt-2 text-[12px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {vehicle.plateNumber.toUpperCase()} ·{" "}
              {formatTransmissionLabel(vehicle.transmissionType)}
            </Text>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isPhotoOpen}
        onRequestClose={() => setIsPhotoOpen(false)}
      >
        <View className="flex-1 items-center justify-center p-5" style={{ backgroundColor: "rgba(4,19,32,0.96)" }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close vehicle photograph"
            onPress={() => setIsPhotoOpen(false)}
            className="absolute right-5 top-16 z-10 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.16)" }}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.contrastText} />
          </Pressable>
          {vehicle.photoUrl ? (
            <Image
              source={{ uri: vehicle.photoUrl }}
              accessibilityLabel={`${vehicle.name} photograph full screen`}
              className="h-full w-full"
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Modal>

      <View className="mt-8">
        <SectionHeader title="Fleet details" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {[
            ["Status", vehicle.isActive ? "active" : "inactive"],
            ["Plate number", vehicle.plateNumber.toUpperCase()],
            ["Colour", vehicle.color ?? "Not set"],
            ["Transmission", formatTransmissionLabel(vehicle.transmissionType)],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-row items-center justify-between gap-4 py-3"
            >
              <Text
                className="text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
              <Text
                className="flex-1 text-right text-[12px] capitalize"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className="mt-8 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="text-[14px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Assignment eligibility
        </Text>
        <Text
          className="mt-2 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Only active vehicles should be eligible for booking assignment.
          Maintenance or inactive vehicles stay visible for operations but
          should not be matched to learner sessions.
        </Text>
      </View>

      <View className="mt-7 gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/school/operations/vehicles/${vehicle.id}/edit`)}
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons name="pencil-outline" size={20} color={colors.onPrimary} />
          <Text className="text-[15px]" style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>
            Edit vehicle
          </Text>
        </Pressable>
        {!vehicle.isActive ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => setActiveState(true)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={colors.onPrimary}
            />
            <Text
              className="text-[15px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Mark active
            </Text>
          </Pressable>
        ) : null}

        {vehicle.isActive ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => setActiveState(false)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{ backgroundColor: colors.surface, borderColor: colors.error }}
          >
            <MaterialCommunityIcons
              name="car-off"
              size={20}
              color={colors.error}
            />
            <Text
              className="text-[15px]"
              style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
            >
              Mark inactive
            </Text>
          </Pressable>
        ) : null}
      </View>
      {isUpdating ? (
        <ActivityIndicator className="mt-4" color={colors.primary} />
      ) : null}
      {updateError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {updateError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
