import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useDiscoverSchoolDetail } from "@/features/school-discovery/use-discover-school-detail";
import { packageDurationLabel, packageLessonCount } from "@/lib/school/mappers";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  selectActiveLearnerPackages,
  useLearnerOperationsStore,
} from "@/store/learner-operations.store";
import type { TrainingPackage } from "@/types";

function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`;
}

function HeaderButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
      style={{
        backgroundColor: colors.surfaceMuted,
        borderColor: colors.border,
      }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

function PackageStat({
  icon,
  label,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 items-center rounded-2xl px-2 py-3"
      style={{ backgroundColor: colors.surfaceMuted }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
      <Text
        className="mt-1 text-center text-[10px]"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

type PackageCardProps = {
  item: TrainingPackage;
  index: number;
  publicMarketplace: boolean;
  selected: boolean;
  alreadyOwned: boolean;
  onSelect: () => void;
  onContinue: () => void;
};

function PackageCard({
  item,
  index,
  publicMarketplace,
  selected,
  alreadyOwned,
  onSelect,
  onContinue,
}: PackageCardProps) {
  const { colors } = useAppTheme();
  const verified = index !== 1;
  const lessonCount = packageLessonCount(item);
  const statLabels = [
    packageDurationLabel(item),
    `${lessonCount} lessons`,
    index === 1 ? "Auto Only" : index === 2 ? "All Types" : "Manual/Auto",
  ];
  const features = item.description?.trim()
    ? item.description
        .split(/[\n•]/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [`${lessonCount} practical driving lessons`, packageDurationLabel(item)];

  return (
    <View
      className="rounded-3xl border"
      style={{
        backgroundColor: colors.surface,
        borderColor: selected ? colors.primary : colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 2,
      }}
    >
      <Pressable
        accessibilityRole="radio"
        accessibilityLabel={`${item.name}. ${formatPrice(item.price)}. ${lessonCount} lessons.`}
        accessibilityState={{ selected }}
        onPress={onSelect}
        className="p-5 active:opacity-90"
      >
        <View className="flex-row items-start justify-between gap-3">
          <View
            className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{
              backgroundColor: verified
                ? colors.successSoft
                : colors.surfaceMuted,
            }}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={14}
              color={verified ? colors.success : colors.textMuted}
            />
            <Text
              className="text-[9px] uppercase tracking-[0.7px]"
              style={{
                color: verified ? colors.success : colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {verified ? "FRSC Verified" : "Standard"}
            </Text>
          </View>

          <View className="items-end">
            <Text
              className="text-[22px] leading-6"
              style={{
                color: colors.text,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {formatPrice(item.price)}
            </Text>
            <Text
              className="mt-1 text-[10px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              {formatPrice(Math.round(item.price / Math.max(lessonCount, 1)))} /
              lesson
            </Text>
          </View>
        </View>

        <Text
          className="mt-5 text-[19px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {item.name}
        </Text>

        <View className="mt-4 flex-row gap-3">
          <PackageStat icon="clock-outline" label={statLabels[0]} />
          <PackageStat
            icon={index === 2 ? "medal-outline" : "account-outline"}
            label={statLabels[1]}
          />
          <PackageStat
            icon={index === 2 ? "truck-outline" : "car-outline"}
            label={statLabels[2]}
          />
        </View>

        <View className="mt-5 gap-3">
          {features.map((feature) => (
            <View key={feature} className="flex-row items-center gap-2.5">
              <MaterialCommunityIcons
                name="check-circle"
                size={17}
                color={colors.primary}
              />
              <Text
                className="flex-1 text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtree,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          alreadyOwned
            ? `${item.name} is already active`
            : selected
              ? publicMarketplace
                ? `Sign in to book ${item.name}`
                : `Book ${item.name}`
              : `Select ${item.name}`
        }
        accessibilityState={{ disabled: alreadyOwned }}
        disabled={alreadyOwned}
        onPress={selected ? onContinue : onSelect}
        className="mx-5 mb-5 items-center justify-center rounded-2xl border-2 active:opacity-80"
        style={{
          backgroundColor: alreadyOwned
            ? colors.surfaceStrong
            : selected
              ? colors.primary
              : colors.surface,
          borderColor: alreadyOwned ? colors.border : colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 14,
          shadowColor:
            selected && !alreadyOwned ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: selected && !alreadyOwned ? 0.24 : 0,
          shadowRadius: 14,
          elevation: selected && !alreadyOwned ? 3 : 0,
        }}
      >
        <Text
          className="text-center text-[13px]"
          style={{
            color: alreadyOwned
              ? colors.textMuted
              : selected
                ? colors.onPrimary
                : colors.text,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {alreadyOwned
            ? "Package already active"
            : selected
              ? publicMarketplace
                ? "Sign in to book"
                : "Book this package"
              : "Select package"}
        </Text>
      </Pressable>
    </View>
  );
}

type PackageSelectionScreenProps = {
  publicMarketplace?: boolean;
};

export function PackageSelectionScreen({
  publicMarketplace = false,
}: PackageSelectionScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const { schoolId, distanceKm: distanceKmParam } = useLocalSearchParams<{
    schoolId?: string;
    distanceKm?: string;
  }>();
  const parsedDistanceKm = distanceKmParam
    ? Number.parseFloat(distanceKmParam)
    : undefined;
  const distanceKm = Number.isFinite(parsedDistanceKm)
    ? parsedDistanceKm
    : undefined;

  const { school, loading, error, refetch } = useDiscoverSchoolDetail(
    schoolId,
    { distanceKm },
  );

  const packages = useMemo<TrainingPackage[]>(() => {
    if (!school) return [];
    return school.packages.filter((pkg) => pkg.isActive);
  }, [school]);

  const [selectedId, setSelectedId] = useState<string | undefined>();

  const effectiveSelectedId = selectedId ?? packages[0]?.id;

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !school) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text
          className="text-center text-[16px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {error?.message ?? "School not found"}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => (error ? refetch() : router.back())}
          className="mt-6 rounded-full px-6 py-3 active:opacity-75"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {error ? "Try again" : "Go back"}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text
          className="text-center text-[16px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          No packages available
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="mt-6 rounded-full px-6 py-3 active:opacity-75"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const bookPackage = (item: TrainingPackage) => {
    if (publicMarketplace) {
      router.push({
        pathname: "/login",
        params: {
          returnTo: `/checkout/${school.id}/payment?packageId=${item.id}`,
        },
      });
      return;
    }

    router.push({
      pathname: "/checkout/[schoolId]/payment",
      params: { schoolId: school.id, packageId: item.id },
    });
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-row items-center justify-between px-6 py-4">
        <HeaderButton
          icon="chevron-left"
          label="Go back"
          onPress={() => router.back()}
        />
        <View className="flex-1 items-center px-3">
          <Text
            className="text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Packages
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[9px] uppercase tracking-[1px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {school.name}
          </Text>
        </View>
        <HeaderButton icon="information" label="Package information" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
      >
        <Text
          accessibilityRole="header"
          className="mt-2 text-[24px] tracking-[-0.5px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Compare training packages
        </Text>
        <Text
          className="mt-1 text-[13px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Review the lesson count, training focus, and price before creating an
          account or booking.
        </Text>

        <View className="mt-7 gap-6">
          {packages.map((item, index) => (
            <PackageCard
              key={item.id}
              item={item}
              index={index}
              publicMarketplace={publicMarketplace}
              selected={effectiveSelectedId === item.id}
              alreadyOwned={activePackages.some(
                (activePackage) => activePackage.packageId === item.id,
              )}
              onSelect={() => setSelectedId(item.id)}
              onContinue={() => bookPackage(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        className="px-6 pt-3"
        style={{
          backgroundColor: colors.background,
          paddingBottom: Math.max(insets.bottom, 14),
        }}
      >
        <View
          accessible
          accessibilityLabel="Not sure which package to pick? Compare the number of sessions and training focus before continuing."
          className="flex-row items-center rounded-2xl p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
          }}
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="help-circle"
              size={22}
              color={colors.onPrimary}
            />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="text-[12px]"
              style={{
                color: colors.text,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Not sure which to pick?
            </Text>
            <Text
              className="mt-0.5 text-[10px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              Take our 1-min driving quiz
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.text}
          />
        </View>
      </View>
    </View>
  );
}
