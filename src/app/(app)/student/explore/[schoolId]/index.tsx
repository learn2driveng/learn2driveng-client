import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { getSchoolById } from "@/features/school-discovery";
import { useAppTheme } from "@/hooks/use-app-theme";

function SectionTitle({ children }: { children: string }) {
  const { colors } = useAppTheme();

  return (
    <Text
      className="text-[18px] tracking-[-0.25px]"
      style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
    >
      {children}
    </Text>
  );
}

function IconButton({
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
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <MaterialCommunityIcons name={icon} size={21} color={colors.text} />
    </Pressable>
  );
}

export default function SchoolDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { schoolId } = useLocalSearchParams<{ schoolId?: string }>();
  const school = getSchoolById(schoolId);

  if (!school) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <MaterialCommunityIcons name="school-outline" size={44} color={colors.textSubtle} />
        <Text
          className="mt-4 text-[20px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          School not found
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="mt-6 rounded-full px-6 py-3 active:opacity-75"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}>
            Back to Explore
          </Text>
        </Pressable>
      </View>
    );
  }

  const openPackages = () => {
    router.push({
      pathname: "/student/explore/[schoolId]/packages",
      params: { schoolId: school.id },
    });
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-row items-center justify-between px-5 py-3">
        <IconButton icon="arrow-left" label="Go back" onPress={() => router.back()} />
        <Text
          className="text-[13px]"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeSemibold }}
        >
          School details
        </Text>
        <IconButton icon="bookmark-outline" label="Save school" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        <View
          className="rounded-[28px] border p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <View className="flex-row items-start justify-between gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.primary }}>
              <MaterialCommunityIcons name="steering" size={31} color={colors.onPrimary} />
            </View>
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
              style={{ backgroundColor: colors.verifiedSoft }}
            >
              <MaterialCommunityIcons name="check-decagram" size={15} color={colors.verified} />
              <Text
                className="text-[10px] uppercase tracking-[0.6px]"
                style={{ color: colors.verified, fontFamily: fontFamily.figtreeBold }}
              >
                FRSC verified
              </Text>
            </View>
          </View>

          <Text
            className="mt-5 text-[27px] leading-8 tracking-[-0.7px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {school.name}
          </Text>
          <View className="mt-2 flex-row items-start gap-1.5">
            <MaterialCommunityIcons name="map-marker-outline" size={17} color={colors.textMuted} />
            <Text
              className="flex-1 text-[13px] leading-5"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
            >
              {school.address}
            </Text>
          </View>

          <View className="mt-5 flex-row items-center gap-2">
            <View className="flex-row items-center gap-1.5 rounded-full px-3 py-2" style={{ backgroundColor: colors.primary }}>
              <MaterialCommunityIcons name="star" size={15} color={colors.onPrimary} />
              <Text
                className="text-[13px]"
                style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
              >
                {school.rating.toFixed(1)}
              </Text>
              <Text
                className="text-[11px]"
                style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeMedium }}
              >
                {school.reviewCount} reviews
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons name="map-marker-distance" size={15} color={colors.textMuted} />
              <Text
                className="text-[12px]"
                style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeSemibold }}
              >
                {school.distanceKm.toFixed(1)} km away
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-7">
          <SectionTitle>About this school</SectionTitle>
          <Text
            className="mt-2 text-[14px] leading-6"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            {school.description}
          </Text>
        </View>

        <View className="mt-8">
          <View className="flex-row items-end justify-between">
            <SectionTitle>Instructors</SectionTitle>
            <Text
              className="text-[12px]"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
            >
              {school.instructors.length} available
            </Text>
          </View>
          <View
            className="mt-3 overflow-hidden rounded-3xl border"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            {school.instructors.map((instructor, index) => (
              <View key={instructor.id}>
                <View className="flex-row items-center p-4">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons name="account-outline" size={23} color={colors.text} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="text-[14px]"
                      style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}
                    >
                      {instructor.name}
                    </Text>
                    <Text
                      className="mt-0.5 text-[12px]"
                      style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
                    >
                      {instructor.experience}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
                  <Text
                    className="ml-1 text-[12px]"
                    style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}
                  >
                    {instructor.rating.toFixed(1)}
                  </Text>
                </View>
                {index < school.instructors.length - 1 ? (
                  <View className="ml-[70px] h-px" style={{ backgroundColor: colors.border }} />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <SectionTitle>Training vehicles</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 pt-3"
          >
            {school.vehicles.map((vehicle) => (
              <View
                key={vehicle.id}
                className="w-44 flex-row items-center rounded-2xl border p-4"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons name="car-hatchback" size={22} color={colors.primary} />
                </View>
                <View className="ml-3 flex-1">
                  <Text
                    numberOfLines={1}
                    className="text-[13px]"
                    style={{ color: colors.text, fontFamily: fontFamily.figtreeSemibold }}
                  >
                    {vehicle.name}
                  </Text>
                  <Text
                    className="mt-0.5 text-[11px]"
                    style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
                  >
                    {vehicle.transmission}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View
        className="border-t px-5 pt-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 14),
        }}
      >
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <Text
              className="text-[11px]"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
            >
              Packages from
            </Text>
            <Text
              className="mt-0.5 text-[20px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              ₦{school.startingPrice.toLocaleString("en-NG")}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={openPackages}
            className="flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: colors.primary,
              minWidth: 176,
              paddingHorizontal: 24,
              paddingVertical: 15,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text
              className="text-[14px]"
              style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
            >
              View packages
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
