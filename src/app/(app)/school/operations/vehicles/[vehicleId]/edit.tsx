import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useToast } from "@/components/common/toast";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateSchoolVehicle } from "@/lib/api";
import { vehicleToSchoolVehicle } from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, VehicleTransmissionType } from "@/types";

export default function EditVehicleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const { vehicleId } = useLocalSearchParams<{ vehicleId?: string }>();
  const vehicle = useSchoolOperationsStore((state) => state.vehicles.find((item) => item.id === vehicleId));
  const upsertVehicle = useSchoolOperationsStore((state) => state.upsertVehicle);
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(String(vehicle?.year ?? ""));
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber ?? "");
  const [color, setColor] = useState(vehicle?.color ?? "");
  const [transmissionType, setTransmissionType] = useState<VehicleTransmissionType>(vehicle?.transmissionType ?? "automatic");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!vehicle) return <DashboardScreen><DashboardPageHeader title="Edit vehicle" /><View className="mt-8"><ContentEmptyState icon="car-off" title="Vehicle not found" description="This vehicle is not in the school fleet." /></View></DashboardScreen>;

  const canSave = make.trim().length >= 2 && model.trim().length >= 1 && Number(year) >= 1980 && plateNumber.trim().length >= 3;
  const fields = [
    ["Make", make, setMake, "e.g. Toyota", "words"],
    ["Model", model, setModel, "e.g. Corolla", "words"],
    ["Year", year, setYear, "e.g. 2020", "none"],
    ["Plate number", plateNumber, setPlateNumber, "e.g. ABJ-000-AAA", "characters"],
    ["Colour", color, setColor, "e.g. Silver", "words"],
  ] as const;

  return <DashboardScreen>
    <DashboardPageHeader title="Edit vehicle" />
    <View className="mt-7 gap-5 rounded-3xl border p-4" style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      {fields.map(([label, value, setValue, placeholder, capitalization]) => <View key={label}>
        <Text className="mb-2 text-[11px] uppercase tracking-[1.2px]" style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}>{label}</Text>
        <TextInput accessibilityLabel={label} value={value} placeholder={placeholder} placeholderTextColor={colors.textFaint} keyboardType={label === "Year" ? "number-pad" : "default"} autoCapitalize={capitalization} onChangeText={(next) => setValue(label === "Plate number" ? next.toUpperCase() : next)} className="h-14 rounded-2xl border px-4 text-[15px]" style={{ backgroundColor: colors.background, borderColor: colors.border, color: colors.text, fontFamily: fontFamily.figtreeMedium }} />
      </View>)}
      <View><Text className="mb-2 text-[11px] uppercase tracking-[1.2px]" style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}>Transmission</Text><View className="flex-row gap-3">{(["automatic", "manual"] as const).map((item) => <Pressable key={item} onPress={() => setTransmissionType(item)} className="h-12 flex-1 items-center justify-center rounded-2xl" style={{ backgroundColor: transmissionType === item ? colors.primary : colors.surfaceStrong }}><Text className="capitalize text-[13px]" style={{ color: transmissionType === item ? colors.onPrimary : colors.text, fontFamily: fontFamily.figtreeBold }}>{item}</Text></Pressable>)}</View></View>
    </View>
    <Pressable accessibilityRole="button" disabled={!canSave || isSaving} onPress={async () => { if (!canSave || isSaving) return; setError(null); setIsSaving(true); try { const updated = await updateSchoolVehicle(vehicle.id, { make: make.trim(), model: model.trim(), year: Number(year), plateNumber: plateNumber.trim(), color: color.trim() || undefined, transmissionType }); upsertVehicle(vehicleToSchoolVehicle(updated)); showToast("Vehicle changes saved."); router.back(); } catch (caught) { setError((caught as ApiError).message || "We could not save this vehicle."); } finally { setIsSaving(false); } }} className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full" style={{ backgroundColor: canSave ? colors.primary : colors.surfaceStrong }}>{isSaving ? <ActivityIndicator color={colors.onPrimary} /> : <><MaterialCommunityIcons name="content-save-outline" size={20} color={canSave ? colors.onPrimary : colors.textSubtle} /><Text className="text-[15px]" style={{ color: canSave ? colors.onPrimary : colors.textSubtle, fontFamily: fontFamily.figtreeBold }}>Save changes</Text></>}</Pressable>
    {error ? <Text className="mt-3 text-center text-[12px]" style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}>{error}</Text> : null}
  </DashboardScreen>;
}
