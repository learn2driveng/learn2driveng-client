import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { formatTransmissionLabel } from "@/lib/school/format";
import { packageDurationLabel } from "@/lib/school/mappers";
import { useAppTheme } from "@/hooks/use-app-theme";
import { deleteSchoolPackage, updateSchoolPackage } from "@/lib/api";
import { packageToSchoolPackage } from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, VehicleTransmissionType } from "@/types";

function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`;
}

const transmissionOptions: VehicleTransmissionType[] = ["automatic", "manual"];

export default function SchoolPackageDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { packageId } = useLocalSearchParams<{ packageId?: string }>();
  const packageDefinition = useSchoolOperationsStore((state) =>
    state.packages.find((item) => item.id === packageId),
  );
  const upsertPackage = useSchoolOperationsStore((state) => state.upsertPackage);
  const removePackage = useSchoolOperationsStore((state) => state.removePackage);
  const [name, setName] = useState(packageDefinition?.name ?? "");
  const [description, setDescription] = useState(
    packageDefinition?.description ?? "",
  );
  const [price, setPrice] = useState(
    packageDefinition ? String(packageDefinition.price) : "",
  );
  const [numberOfLessons, setNumberOfLessons] = useState(
    packageDefinition ? String(packageDefinition.numberOfLessons) : "",
  );
  const [durationInDays, setDurationInDays] = useState(
    packageDefinition ? String(packageDefinition.durationInDays) : "",
  );
  const [eligibleTransmissions, setEligibleTransmissions] = useState<
    VehicleTransmissionType[]
  >(packageDefinition?.eligibleTransmissions ?? ["automatic", "manual"]);
  const [saved, setSaved] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const canSave = useMemo(() => {
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
  }, [description, durationInDays, eligibleTransmissions.length, name, numberOfLessons, price]);

  const toggleTransmission = (transmission: VehicleTransmissionType) => {
    setEligibleTransmissions((current) =>
      current.includes(transmission)
        ? current.filter((item) => item !== transmission)
        : [...current, transmission],
    );
    setSaved(false);
  };

  const savePackage = async () => {
    if (!packageDefinition || !canSave || isUpdating) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      const updated = await updateSchoolPackage(packageDefinition.id, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        numberOfLessons: Number(numberOfLessons),
        durationInDays: Number(durationInDays),
        eligibleTransmissions,
      });
      upsertPackage({
        ...packageToSchoolPackage(updated),
        purchasesThisMonth: packageDefinition.purchasesThisMonth,
      });
      setSaved(true);
    } catch (caught) {
      const error = caught as ApiError;
      setUpdateError(error.message || "We could not save this package.");
    } finally {
      setIsUpdating(false);
    }
  };

  const setActiveState = async (isActive: boolean) => {
    if (!packageDefinition || isUpdating) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      const updated = await updateSchoolPackage(packageDefinition.id, {
        isActive,
      });
      upsertPackage({
        ...packageToSchoolPackage(updated),
        eligibleTransmissions: packageDefinition.eligibleTransmissions,
        purchasesThisMonth: packageDefinition.purchasesThisMonth,
      });
    } catch (caught) {
      const error = caught as ApiError;
      setUpdateError(error.message || "We could not update this package.");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmDelete = () => {
    if (!packageDefinition) return;

    Alert.alert(
      "Delete package",
      `Remove "${packageDefinition.name}" permanently? This only works if no learner has booked it.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void deletePackage(),
        },
      ],
    );
  };

  const deletePackage = async () => {
    if (!packageDefinition || isUpdating) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      await deleteSchoolPackage(packageDefinition.id);
      removePackage(packageDefinition.id);
      router.replace("/school/operations/packages");
    } catch (caught) {
      const error = caught as ApiError;
      setUpdateError(error.message || "We could not delete this package.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!packageDefinition) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Package" />
        <View className="mt-8">
          <ContentEmptyState
            icon="package-variant-closed-remove"
            title="Package not found"
            description="This package definition is not available for this school."
          />
        </View>
      </DashboardScreen>
    );
  }

  const field = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    keyboardType: "default" | "number-pad" = "default",
    multiline = false,
  ) => (
    <View>
      <Text
        className="mb-2 text-[11px] uppercase tracking-[1.4px]"
        style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={(nextValue) => {
          onChangeText(nextValue);
          setSaved(false);
        }}
        className={`rounded-2xl border px-4 text-[15px] ${multiline ? "min-h-28 py-4" : "h-14"}`}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );

  return (
    <DashboardScreen key={packageDefinition.id}>
      <DashboardPageHeader title="Package details" />

      <View
        className="mt-7 rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-16 w-16 items-center justify-center rounded-3xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="package-variant"
              size={32}
              color={colors.onPrimary}
            />
          </View>
          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="text-[23px] leading-7 tracking-[-0.5px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {packageDefinition.name}
            </Text>
            <Text
              className="mt-2 text-[12px] capitalize"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {packageDefinition.isActive ? "active" : "inactive"} ·{" "}
              {formatPrice(packageDefinition.price)}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Edit package" />
        <View
          className="mt-4 gap-5 rounded-3xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {field("Package name", name, setName)}
          {field("Description", description, setDescription, "default", true)}
          {field("Price (₦)", price, setPrice, "number-pad")}
          {field("Number of lessons", numberOfLessons, setNumberOfLessons, "number-pad")}
          {field(
            "Completion window (days)",
            durationInDays,
            setDurationInDays,
            "number-pad",
          )}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Available car types" />
        <View className="mt-4 flex-row gap-3">
          {transmissionOptions.map((item) => {
            const selected = eligibleTransmissions.includes(item);
            return (
              <Pressable
                key={item}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggleTransmission(item)}
                className="flex-1 rounded-2xl border p-4 active:opacity-75"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
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

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave || saved || isUpdating }}
        disabled={!canSave || saved || isUpdating}
        onPress={() => void savePackage()}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
        style={{
          backgroundColor:
            canSave && !saved && !isUpdating
              ? colors.primary
              : colors.surfaceStrong,
        }}
      >
        {isUpdating && saved ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <MaterialCommunityIcons
              name={saved ? "check" : "content-save-outline"}
              size={20}
              color={canSave && !saved ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="text-[15px]"
              style={{
                color: canSave && !saved ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {saved ? "Package up to date" : "Save changes"}
            </Text>
          </>
        )}
      </Pressable>

      <View className="mt-8">
        <SectionHeader title="Current rules" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {[
            ["Duration", packageDurationLabel(packageDefinition)],
            [
              "Available car types",
              (packageDefinition.eligibleTransmissions ?? [])
                .map(formatTransmissionLabel)
                .join(" / "),
            ],
            ["Purchases this month", String(packageDefinition.purchasesThisMonth)],
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
                className="flex-1 text-right text-[12px]"
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
          Marketplace visibility
        </Text>
        <Text
          className="mt-2 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Active packages appear in public discovery. Inactive packages stay in
          school operations but are hidden from learners.
        </Text>
      </View>

      <View className="mt-7 gap-3">
        {!packageDefinition.isActive ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => void setActiveState(true)}
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
              Publish package
            </Text>
          </Pressable>
        ) : null}

        {packageDefinition.isActive ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => void setActiveState(false)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="pause-circle-outline"
              size={20}
              color={colors.text}
            />
            <Text
              className="text-[15px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              Pause package
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isUpdating}
          onPress={confirmDelete}
          className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.error,
          }}
        >
          <MaterialCommunityIcons name="delete-outline" size={20} color={colors.error} />
          <Text
            className="text-[15px]"
            style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
          >
            Delete package
          </Text>
        </Pressable>
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
