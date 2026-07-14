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
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { SchoolPackageDefinition } from "@/types";

const transmissionOptions: SchoolPackageDefinition["eligibleTransmissions"] = [
  "Automatic",
  "Manual",
];

export default function NewSchoolPackageScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const addPackage = useSchoolOperationsStore((state) => state.addPackage);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sessions, setSessions] = useState("6");
  const [duration, setDuration] = useState("3 weeks");
  const [eligibleTransmissions, setEligibleTransmissions] = useState<
    SchoolPackageDefinition["eligibleTransmissions"]
  >(["Automatic", "Manual"]);

  const canSavePackage = useMemo(() => {
    const parsedPrice = Number(price);
    const parsedSessions = Number(sessions);

    return (
      name.trim().length >= 2 &&
      description.trim().length >= 8 &&
      Number.isFinite(parsedPrice) &&
      parsedPrice > 0 &&
      Number.isInteger(parsedSessions) &&
      parsedSessions > 0 &&
      duration.trim().length >= 2 &&
      eligibleTransmissions.length > 0
    );
  }, [
    description,
    duration,
    eligibleTransmissions.length,
    name,
    price,
    sessions,
  ]);

  const toggleTransmission = (
    transmission: SchoolPackageDefinition["eligibleTransmissions"][number],
  ) => {
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
      sessions: Number(sessions),
      duration,
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
      label: "Number of sessions",
      value: sessions,
      onChangeText: setSessions,
      placeholder: "6",
      keyboardType: "number-pad" as const,
      multiline: false,
    },
    {
      label: "Completion window",
      value: duration,
      onChangeText: setDuration,
      placeholder: "3 weeks",
      keyboardType: "default" as const,
      multiline: false,
    },
  ];

  const renderField = (field: (typeof fields)[number]) => (
    <View key={field.label}>
      <Text
        className="mb-2 text-[11px] uppercase tracking-[1.4px]"
        style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
      >
        {field.label}
      </Text>
      <TextInput
        accessibilityLabel={field.label}
        keyboardType={field.keyboardType}
        multiline={field.multiline}
        onChangeText={field.onChangeText}
        placeholder={field.placeholder}
        placeholderTextColor={colors.textFaint}
        value={field.value}
        className="rounded-2xl border px-4 text-[15px]"
        style={{
          minHeight: field.multiline ? 96 : 56,
          paddingTop: field.multiline ? 14 : undefined,
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
          textAlignVertical: field.multiline ? "top" : "center",
        }}
      />
    </View>
  );

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
        Define the package learners can browse and buy. New packages start as
        drafts so the school can review before publishing.
      </Text>

      <View className="mt-8">
        <SectionHeader title="Package details" />
        <View
          className="mt-4 gap-5 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {fields.slice(0, 2).map(renderField)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Pricing and delivery" />
        <View
          className="mt-4 gap-5 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {fields.slice(2).map(renderField)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Vehicle eligibility" />
        <Text
          className="mb-3 mt-4 text-[11px] uppercase tracking-[1.4px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Eligible vehicles
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
                  name={selected ? "checkbox-marked-circle" : "circle-outline"}
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
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSavePackage }}
        disabled={!canSavePackage}
        onPress={savePackage}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor: canSavePackage
            ? colors.primary
            : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: canSavePackage ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Save draft package
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
