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
import { formatTransmissionLabel } from "@/lib/school/format";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { VehicleTransmissionType } from "@/types";

const transmissionOptions: VehicleTransmissionType[] = ["automatic", "manual"];

export default function NewSchoolPackageScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const addPackage = useSchoolOperationsStore((state) => state.addPackage);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [numberOfLessons, setNumberOfLessons] = useState("6");
  const [durationInDays, setDurationInDays] = useState("21");
  const [eligibleTransmissions, setEligibleTransmissions] = useState<
    VehicleTransmissionType[]
  >(["automatic", "manual"]);

  const canSavePackage = useMemo(() => {
    const parsedPrice = Number(price);
    const parsedLessons = Number(numberOfLessons);
    const parsedDuration = Number(durationInDays);

    return (
      name.trim().length >= 2 &&
      description.trim().length >= 8 &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0 &&
      Number.isInteger(parsedLessons) &&
      parsedLessons > 0 &&
      Number.isInteger(parsedDuration) &&
      parsedDuration > 0 &&
      eligibleTransmissions.length > 0
    );
  }, [
    description,
    durationInDays,
    eligibleTransmissions.length,
    name,
    numberOfLessons,
    price,
  ]);

  const toggleTransmission = (transmission: VehicleTransmissionType) => {
    setEligibleTransmissions((current) =>
      current.includes(transmission)
        ? current.filter((item) => item !== transmission)
        : [...current, transmission],
    );
  };

  const savePackage = () => {
    if (!canSavePackage) return;

    addPackage({
      name,
      description,
      price: Number(price),
      numberOfLessons: Number(numberOfLessons),
      durationInDays: Number(durationInDays),
      eligibleTransmissions,
    });
    router.replace("/school/operations/packages");
  };

  const fields = [
    {
      label: "Package name",
      value: name,
      onChangeText: setName,
      placeholder: "e.g. City Confidence",
      keyboardType: "default" as const,
      multiline: false,
    },
    {
      label: "Description",
      value: description,
      onChangeText: setDescription,
      placeholder: "What learners get from this package",
      keyboardType: "default" as const,
      multiline: true,
    },
    {
      label: "Price (₦)",
      value: price,
      onChangeText: setPrice,
      placeholder: "45000",
      keyboardType: "number-pad" as const,
      multiline: false,
    },
    {
      label: "Number of lessons",
      value: numberOfLessons,
      onChangeText: setNumberOfLessons,
      placeholder: "6",
      keyboardType: "number-pad" as const,
      multiline: false,
    },
    {
      label: "Completion window (days)",
      value: durationInDays,
      onChangeText: setDurationInDays,
      placeholder: "21",
      keyboardType: "number-pad" as const,
      multiline: false,
    },
  ];

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Add package" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Packages define what learners purchase. Lesson count and duration must
        match what you configure on the server.
      </Text>

      <View className="mt-8">
        <SectionHeader title="Package details" />
      </View>
      <View
        className="mt-4 gap-5 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {fields.map((field) => (
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
              value={field.value}
              onChangeText={field.onChangeText}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textSubtle}
              keyboardType={field.keyboardType}
              multiline={field.multiline}
              className="min-h-[52px] rounded-2xl border px-4 py-3 text-[14px]"
              style={{
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surfaceMuted,
                fontFamily: fontFamily.figtree,
                textAlignVertical: field.multiline ? "top" : "center",
              }}
            />
          </View>
        ))}

        <View>
          <Text
            className="mb-2 text-[11px] uppercase tracking-[1.4px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Eligible transmissions
          </Text>
          <View className="flex-row gap-3">
            {transmissionOptions.map((item) => {
              const selected = eligibleTransmissions.includes(item);

              return (
                <Pressable
                  key={item}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                  onPress={() => toggleTransmission(item)}
                  className="h-14 flex-1 flex-row items-center gap-2 rounded-2xl border px-4 active:opacity-75"
                  style={{
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                  }}
                >
                  <MaterialCommunityIcons
                    name={selected ? "checkbox-marked" : "checkbox-blank-outline"}
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
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSavePackage }}
        disabled={!canSavePackage}
        onPress={savePackage}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor: canSavePackage ? colors.primary : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: canSavePackage ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Save package
        </Text>
        <MaterialCommunityIcons
          name="check"
          size={20}
          color={canSavePackage ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
