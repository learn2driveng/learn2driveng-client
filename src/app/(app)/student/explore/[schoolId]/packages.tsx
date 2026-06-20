import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import {
  getSchoolById,
} from "@/features/school-discovery";
import { useAppTheme } from "@/hooks/use-app-theme";
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
      style={{ backgroundColor: colors.surfaceMuted, borderColor: colors.border }}
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
    <View className="flex-1 items-center rounded-2xl px-2 py-3" style={{ backgroundColor: colors.surfaceMuted }}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.text} />
      <Text
        className="mt-1 text-center text-[10px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
      >
        {label}
      </Text>
    </View>
  );
}

type PackageCardProps = {
  item: TrainingPackage;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onContinue: () => void;
};

function PackageCard({
  item,
  index,
  selected,
  onSelect,
  onContinue,
}: PackageCardProps) {
  const { colors } = useAppTheme();
  const verified = index !== 1;
  const statLabels = [
    `${Math.max(item.sessions, 5)} Hours`,
    index === 0 ? "Senior Level" : index === 1 ? "Standard" : "Lead Expert",
    index === 1 ? "Auto Only" : index === 2 ? "All Types" : "Manual/Auto",
  ];
  const features =
    index === 0
      ? ["Defensive driving techniques", "Licence application assistance"]
      : index === 1
        ? ["City driving confidence", "Night driving session (1hr)"]
        : ["Advanced road mastery", "Highway and fleet readiness"];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onSelect}
      className="rounded-3xl border p-5 active:opacity-90"
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
      <View className="flex-row items-start justify-between gap-3">
        <View
          className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ backgroundColor: verified ? colors.successSoft : colors.surfaceMuted }}
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
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {formatPrice(item.price)}
          </Text>
          <Text
            className="mt-1 text-[10px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            {formatPrice(Math.round(item.price / item.sessions))} / session
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
        <PackageStat icon={index === 2 ? "medal-outline" : "account-outline"} label={statLabels[1]} />
        <PackageStat icon={index === 2 ? "truck-outline" : "car-outline"} label={statLabels[2]} />
      </View>

      <View className="mt-5 gap-3">
        {features.map((feature) => (
          <View key={feature} className="flex-row items-center gap-2.5">
            <MaterialCommunityIcons name="check-circle" size={17} color={colors.primary} />
            <Text
              className="flex-1 text-[12px]"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={selected ? onContinue : onSelect}
        className="mt-5 items-center justify-center rounded-2xl border-2 active:opacity-80"
        style={{
          backgroundColor: selected ? colors.primary : colors.surface,
          borderColor: colors.primary,
          paddingHorizontal: 20,
          paddingVertical: 14,
          shadowColor: selected ? colors.primary : "transparent",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: selected ? 0.24 : 0,
          shadowRadius: 14,
          elevation: selected ? 3 : 0,
        }}
      >
        <Text
          className="text-[13px]"
          style={{
            color: selected ? colors.onPrimary : colors.text,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          {selected ? "Continue with package" : "Select Package"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export default function PackageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { schoolId } = useLocalSearchParams<{ schoolId?: string }>();
  const school = getSchoolById(schoolId);

  const packages = useMemo<TrainingPackage[]>(() => {
    if (!school) return [];
    if (school.packages.length >= 3) return school.packages;

    return [
      ...school.packages,
      {
        id: `${school.id}-professional`,
        name: "Professional Plan",
        description: "Advanced training for confident, work-ready driving.",
        price: 85000,
        sessions: 20,
        duration: "8 weeks",
        featured: true,
      },
    ];
  }, [school]);

  const [selectedId, setSelectedId] = useState<string | undefined>(packages[0]?.id);

  if (!school) return null;

  const continueWithPackage = (item: TrainingPackage) => {
    router.push({
      pathname: "/student/explore/[schoolId]/checkout/payment",
      params: { schoolId: school.id, packageId: item.id },
    });
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.surface, paddingTop: insets.top }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-row items-center justify-between px-6 py-4">
        <HeaderButton icon="chevron-left" label="Go back" onPress={() => router.back()} />
        <View className="flex-1 items-center px-3">
          <Text
            className="text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Select Package
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[9px] uppercase tracking-[1px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
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
          className="mt-2 text-[24px] tracking-[-0.5px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Training Programs
        </Text>
        <Text
          className="mt-1 text-[13px]"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Choose a plan that fits your schedule
        </Text>

        <View className="mt-7 gap-6">
          {packages.map((item, index) => (
            <PackageCard
              key={item.id}
              item={item}
              index={index}
              selected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onContinue={() => continueWithPackage(item)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        className="px-6 pt-3"
        style={{
          backgroundColor: colors.surface,
          paddingBottom: Math.max(insets.bottom, 14),
        }}
      >
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center rounded-2xl p-4 active:opacity-80"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: colors.primary }}>
            <MaterialCommunityIcons name="help-circle" size={22} color={colors.onPrimary} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[12px]" style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}>
              Not sure which to pick?
            </Text>
            <Text className="mt-0.5 text-[10px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtree }}>
              Take our 1-min driving quiz
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.contrastText} />
        </Pressable>
      </View>
    </View>
  );
}
