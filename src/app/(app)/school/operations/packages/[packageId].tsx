import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

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
import { updateSchoolPackage } from "@/lib/api";
import { packageToSchoolPackage } from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`;
}

export default function SchoolPackageDetailScreen() {
  const { colors } = useAppTheme();
  const { packageId } = useLocalSearchParams<{ packageId?: string }>();
  const packageDefinition = useSchoolOperationsStore((state) =>
    state.packages.find((item) => item.id === packageId),
  );
  const upsertPackage = useSchoolOperationsStore((state) => state.upsertPackage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

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

  return (
    <DashboardScreen>
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
        <SectionHeader title="Package rules" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {[
            ["Price", formatPrice(packageDefinition.price)],
            ["Lessons", String(packageDefinition.numberOfLessons)],
            ["Duration", packageDurationLabel(packageDefinition)],
            [
              "Eligible vehicles",
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
          Active packages (`isActive`) appear in public discovery. Inactive
          packages stay in school operations but are hidden from learners.
        </Text>
      </View>

      <View className="mt-7 gap-3">
        {!packageDefinition.isActive ? (
          <Pressable
            accessibilityRole="button"
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
              Publish package
            </Text>
          </Pressable>
        ) : null}

        {packageDefinition.isActive ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setActiveState(false)}
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
