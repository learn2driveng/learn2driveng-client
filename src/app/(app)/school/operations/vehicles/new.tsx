import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useToast } from "@/components/common/toast";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { createSchoolVehicle } from "@/lib/api";
import { formatTransmissionLabel } from "@/lib/school/format";
import { vehicleToSchoolVehicle } from "@/lib/school/map-api";
import { parseVehicleDisplayName } from "@/lib/school/vehicle-input";
import { uploadVehiclePhoto } from "@/lib/school/upload-vehicle-photo";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, VehicleTransmissionType } from "@/types";

const transmissionOptions: VehicleTransmissionType[] = ["automatic", "manual"];

export default function NewSchoolVehicleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const upsertVehicle = useSchoolOperationsStore(
    (state) => state.upsertVehicle,
  );
  const [name, setName] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [color, setColor] = useState("");
  const [photo, setPhoto] = useState<{
    uri: string;
    fileName: string;
    mimeType: string | null;
    size: number | null;
  } | null>(null);
  const [transmissionType, setTransmissionType] =
    useState<VehicleTransmissionType>("automatic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const canAddVehicle = useMemo(
    () => name.trim().length >= 2 && plateNumber.trim().length >= 4 && true,
    [name, plateNumber],
  );

  const saveVehicle = async () => {
    if (!canAddVehicle || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const { make, model, year } = parseVehicleDisplayName(name);
      let vehicle = await createSchoolVehicle({
        make,
        model,
        year,
        plateNumber: plateNumber.trim().toUpperCase(),
        color: color.trim() || undefined,
        transmissionType,
        isActive: true,
      });
      if (photo) {
        vehicle = await uploadVehiclePhoto({ vehicleId: vehicle.id, ...photo });
      }
      upsertVehicle(vehicleToSchoolVehicle(vehicle));
      showToast("Vehicle added to your fleet.");
      router.replace("/school/operations/vehicles");
    } catch (caught) {
      const error = caught as ApiError;
      setSubmitError(error.message || "We could not add this vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const choosePhoto = async (source: "camera" | "library") => {
    const result =
      source === "camera"
        ? await (async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted)
              throw new Error(
                "Camera access is required to take a vehicle photograph.",
              );
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
        <View>
          <Text
            className="mb-2 text-[11px] uppercase tracking-[1.4px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Vehicle photograph
          </Text>
          <View
            className="flex-row items-center gap-4 rounded-2xl"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <View
              className="h-20 w-28 items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: colors.surfaceMuted }}
            >
              {photo ? (
                <Image
                  source={{ uri: photo.uri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons
                  name="car-hatchback"
                  size={32}
                  color={colors.textSubtle}
                />
              )}
            </View>
            <View className="flex-1 gap-2 pr-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  photo
                    ? "Change vehicle photograph"
                    : "Choose vehicle photograph"
                }
                onPress={() => void choosePhoto("library")}
                className="h-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="text-[11px]"
                  style={{
                    color: colors.onPrimary,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {photo ? "Change photograph" : "Choose photograph"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Take vehicle photograph"
                onPress={() => void choosePhoto("camera")}
                className="h-9 flex-row items-center justify-center gap-1.5 rounded-xl"
                style={{ backgroundColor: colors.surface }}
              >
                <MaterialCommunityIcons
                  name="camera-outline"
                  size={16}
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
            label: "Colour",
            value: color,
            onChangeText: setColor,
            placeholder: "e.g. Silver",
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
              autoCapitalize={
                field.label === "Plate number" ? "characters" : "words"
              }
              onChangeText={(value) =>
                field.onChangeText(
                  field.label === "Plate number" ? value.toUpperCase() : value,
                )
              }
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
        accessibilityState={{ disabled: !canAddVehicle || isSubmitting }}
        disabled={!canAddVehicle || isSubmitting}
        onPress={saveVehicle}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor:
            canAddVehicle && !isSubmitting
              ? colors.primary
              : colors.surfaceStrong,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
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
          </>
        )}
      </Pressable>
      {submitError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {submitError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
