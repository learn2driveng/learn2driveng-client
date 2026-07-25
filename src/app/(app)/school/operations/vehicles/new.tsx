import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { formatTransmissionLabel } from "@/lib/school/format";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { VehicleTransmissionType } from "@/types";

const transmissionOptions: VehicleTransmissionType[] = ["automatic", "manual"];

export default function NewSchoolVehicleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const addVehicle = useSchoolOperationsStore((state) => state.addVehicle);
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [assignedLocation, setAssignedLocation] = useState(
    "Wuse II Training Yard",
  );
  const [transmissionType, setTransmissionType] =
    useState<VehicleTransmissionType>("automatic");

  const canAddVehicle = useMemo(
    () =>
      name.trim().length >= 2 &&
      plateNumber.trim().length >= 4 &&
      assignedLocation.trim().length >= 2,
    [assignedLocation, name, plateNumber],
  );

  const saveVehicle = () => {
    if (!canAddVehicle) return;

    addVehicle({
      name,
      plateNumber,
      assignedLocation,
      transmissionType,
    });
    router.replace("/school/operations/vehicles");
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Add vehicle" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Add vehicles the school can use for lesson assignment. Transmission and
        location determine which bookings each vehicle can support.
      </Text>

      <View className="mt-8">
        <SectionHeader title="Vehicle details" />
      </View>
      <View
        className="mt-4 gap-5 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {[
          {
            label: "Vehicle name",
            value: name,
            onChangeText: setName,
            placeholder: "e.g. Toyota Corolla",
          },
          {
            label: "Plate number",
            value: plateNumber,
            onChangeText: setPlateNumber,
            placeholder: "e.g. ABJ-000-AAA",
          },
          {
            label: "Assigned location",
            value: assignedLocation,
            onChangeText: setAssignedLocation,
            placeholder: "Training yard or route",
          },
        ].map((field) => (
          <View key={field.label}>
            <Text
              className="mb-2 text-[11px] uppercase tracking-[1.4px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {field.label}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize="words"
              onChangeText={field.onChangeText}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textFaint}
              value={field.value}
              className="h-14 rounded-2xl border px-4 text-[15px]"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
                fontFamily: fontFamily.figtreeMedium,
              }}
            />
          </View>
        ))}
      </View>

      <View className="mt-8">
        <SectionHeader title="Assignment setup" />
        <Text
          className="mb-3 mt-4 text-[11px] uppercase tracking-[1.4px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Transmission
        </Text>
        <View className="flex-row gap-3">
          {transmissionOptions.map((item) => {
            const selected = transmissionType === item;

            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setTransmissionType(item)}
                className="h-14 flex-1 flex-row items-center gap-2 rounded-2xl border px-4 active:opacity-75"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={20}
                  color={selected ? colors.onPrimary : colors.textSubtle}
                />
                <Text
                  className="text-[13px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {formatTransmissionLabel(item)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canAddVehicle }}
        disabled={!canAddVehicle}
        onPress={saveVehicle}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor: canAddVehicle
            ? colors.primary
            : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: canAddVehicle ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Add vehicle to fleet
        </Text>
        <MaterialCommunityIcons
          name="check"
          size={20}
          color={canAddVehicle ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
