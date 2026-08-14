import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateSchoolVehicle } from "@/lib/api";
import { formatTransmissionLabel } from "@/lib/school/format";
import { vehicleToSchoolVehicle } from "@/lib/school/map-api";
import { uploadVehiclePhoto } from "@/lib/school/upload-vehicle-photo";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, VehicleTransmissionType } from "@/types";

type SelectedPhoto = {
  uri: string;
  fileName: string;
  mimeType: string | null;
  size: number | null;
};

export default function EditVehicleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicle = useSchoolOperationsStore((state) =>
    state.vehicles.find((item) => item.id === vehicleId),
  );
  const upsertVehicle = useSchoolOperationsStore(
    (state) => state.upsertVehicle,
  );
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(String(vehicle?.year ?? ""));
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber ?? "");
  const [color, setColor] = useState(vehicle?.color ?? "");
  const [transmissionType, setTransmissionType] =
    useState<VehicleTransmissionType>(
      vehicle?.transmissionType ?? "automatic",
    );
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!vehicle) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Edit vehicle" />
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

  const canSave =
    make.trim().length >= 2 &&
    model.trim().length >= 1 &&
    Number(year) >= 1980 &&
    plateNumber.trim().length >= 3;

  const choosePhoto = async (source: "camera" | "library") => {
    setError(null);
    try {
      const result =
        source === "camera"
          ? await (async () => {
              const permission =
                await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                throw new Error(
                  "Camera access is required to take a vehicle photograph.",
                );
              }
              return ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });
            })()
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });

      if (result.canceled) return;
      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? "vehicle.jpg",
        mimeType: asset.mimeType ?? null,
        size: asset.fileSize ?? null,
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not open the photo picker.",
      );
    }
  };

  const save = async () => {
    if (!canSave || isSaving) return;
    setError(null);
    setIsSaving(true);

    try {
      let updated = await updateSchoolVehicle(vehicle.id, {
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        plateNumber: plateNumber.trim().toUpperCase(),
        color: color.trim() || undefined,
        transmissionType,
      });

      if (photo) {
        updated = await uploadVehiclePhoto({
          vehicleId: vehicle.id,
          ...photo,
        });
      }

      upsertVehicle({
        ...vehicleToSchoolVehicle(updated),
        assignedLocation: vehicle.assignedLocation,
        lastInspectionAt: vehicle.lastInspectionAt,
        lessonsThisWeek: vehicle.lessonsThisWeek,
      });
      showToast("Vehicle changes saved.");
      router.back();
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not save this vehicle.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    {
      label: "Make",
      value: make,
      onChangeText: setMake,
      placeholder: "e.g. Toyota",
      keyboardType: "default" as const,
      autoCapitalize: "words" as const,
    },
    {
      label: "Model",
      value: model,
      onChangeText: setModel,
      placeholder: "e.g. Corolla",
      keyboardType: "default" as const,
      autoCapitalize: "words" as const,
    },
    {
      label: "Year",
      value: year,
      onChangeText: setYear,
      placeholder: "e.g. 2020",
      keyboardType: "number-pad" as const,
      autoCapitalize: "none" as const,
    },
    {
      label: "Plate number",
      value: plateNumber,
      onChangeText: (value: string) => setPlateNumber(value.toUpperCase()),
      placeholder: "e.g. ABJ-000-AAA",
      keyboardType: "default" as const,
      autoCapitalize: "characters" as const,
    },
    {
      label: "Colour",
      value: color,
      onChangeText: setColor,
      placeholder: "e.g. Silver",
      keyboardType: "default" as const,
      autoCapitalize: "words" as const,
    },
  ];

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Edit vehicle" />

      <View className="mt-8">
        <SectionHeader title="Vehicle photograph" />
        <View
          className="mt-4 overflow-hidden rounded-3xl border"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <View
            className="h-44 items-center justify-center overflow-hidden"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            {photo?.uri || vehicle.photoUrl ? (
              <Image
                source={{ uri: photo?.uri ?? vehicle.photoUrl ?? "" }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons
                name="car-hatchback"
                size={52}
                color={colors.textSubtle}
              />
            )}
          </View>
          <View className="flex-row gap-3 p-4">
            <Pressable
              accessibilityRole="button"
              onPress={() => void choosePhoto("library")}
              className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
              style={{
                backgroundColor: colors.primary,
                borderRadius: borderRadius.button,
              }}
            >
              <MaterialCommunityIcons
                name="image-plus"
                size={17}
                color={colors.onPrimary}
              />
              <Text
                className="text-[11px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Change photo
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => void choosePhoto("camera")}
              className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full border active:opacity-80"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.button,
              }}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={17}
                color={colors.text}
              />
              <Text
                className="text-[11px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Take photo
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Vehicle details" />
        <View className="mt-4 gap-5">
          {fields.map((field) => (
            <View key={field.label}>
              <Text
                className="mb-2 text-[11px] uppercase tracking-[1.2px]"
                style={{
                  color: colors.textSubtle,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {field.label}
              </Text>
              <TextInput
                accessibilityLabel={field.label}
                value={field.value}
                onChangeText={field.onChangeText}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textFaint}
                keyboardType={field.keyboardType}
                autoCapitalize={field.autoCapitalize}
                className="h-14 rounded-2xl border px-4 text-[15px]"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              />
            </View>
          ))}

          <View>
            <Text
              className="mb-2 text-[11px] uppercase tracking-[1.2px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Transmission
            </Text>
            <View className="flex-row gap-3">
              {(["automatic", "manual"] as const).map((item) => {
                const selected = transmissionType === item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setTransmissionType(item)}
                    className="h-12 flex-1 items-center justify-center rounded-full border active:opacity-75"
                    style={{
                      backgroundColor: selected
                        ? colors.primary
                        : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                      borderRadius: borderRadius.button,
                    }}
                  >
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
        </View>
      </View>

      {error ? (
        <Text
          className="mt-5 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave || isSaving }}
        disabled={!canSave || isSaving}
        onPress={() => void save()}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor:
            canSave && !isSaving ? colors.primary : colors.surfaceStrong,
          borderRadius: borderRadius.button,
        }}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={20}
              color={canSave ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="text-[15px]"
              style={{
                color: canSave ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Save changes
            </Text>
          </>
        )}
      </Pressable>
    </DashboardScreen>
  );
}
