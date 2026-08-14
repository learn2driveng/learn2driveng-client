import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SchoolAvatar } from "@/components/school/school-avatar";
import { fontFamily } from "@/constants/fonts";
import { MarketplaceImage } from "@/features/school-discovery/marketplace-image";
import { useDiscoverSchoolDetail } from "@/features/school-discovery/use-discover-school-detail";
import { useAppTheme } from "@/hooks/use-app-theme";
import { transmissionSummaryLabel } from "@/lib/school/mappers";

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
      className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <MaterialCommunityIcons name={icon} size={21} color={colors.text} />
    </Pressable>
  );
}

function SectionHeading({
  title,
  count,
  onViewAll,
}: {
  title: string;
  count?: number;
  onViewAll?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-row items-baseline gap-2">
        <Text
          className="text-[19px] tracking-[-0.3px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {title}
        </Text>
        {count != null ? (
          <Text
            className="text-[12px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {count}
          </Text>
        ) : null}
      </View>
      {onViewAll ? (
        <Pressable
          accessibilityRole="button"
          onPress={onViewAll}
          className="min-h-10 flex-row items-center gap-1 rounded-full px-3 active:opacity-70"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <Text
            className="text-[12px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            View all
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={17}
            color={colors.text}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

type SchoolDetailScreenProps = {
  publicMarketplace?: boolean;
};

export function SchoolDetailScreen({
  publicMarketplace = false,
}: SchoolDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
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
    {
      distanceKm,
    },
  );

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
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
          paddingBottom: insets.bottom,
        }}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <MaterialCommunityIcons
          name={error ? "cloud-off-outline" : "school-outline"}
          size={44}
          color={colors.textSubtle}
        />
        <Text
          className="mt-4 text-center text-[18px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {error?.message ?? "School not found"}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={error ? refetch : () => router.back()}
          className="mt-6 rounded-full px-6 py-3 active:opacity-75"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {error ? "Try again" : "Back to Explore"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const openPackages = () => {
    const params = {
      schoolId: school.id,
      distanceKm: String(school.distanceKm),
    };
    if (publicMarketplace) {
      router.push({ pathname: "/explore/[schoolId]/packages", params });
      return;
    }
    router.push({ pathname: "/student/explore/[schoolId]/packages", params });
  };

  const openCollection = (collection: "instructors" | "vehicles") => {
    const params = { schoolId: school.id, schoolName: school.name };
    if (publicMarketplace) {
      router.push({
        pathname:
          collection === "instructors"
            ? "/explore/[schoolId]/instructors"
            : "/explore/[schoolId]/vehicles",
        params,
      });
      return;
    }
    router.push({
      pathname:
        collection === "instructors"
          ? "/student/explore/[schoolId]/instructors"
          : "/student/explore/[schoolId]/vehicles",
      params,
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        className="flex-row items-center justify-between px-5 pb-3"
        style={{ paddingTop: insets.top + 10 }}
      >
        <IconButton
          icon="arrow-left"
          label="Go back"
          onPress={() => router.back()}
        />
        <Text
          className="text-[13px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeSemibold,
          }}
        >
          School profile
        </Text>
        <IconButton
          icon="bookmark-outline"
          label="Save school"
          onPress={publicMarketplace ? () => router.push("/login") : undefined}
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8"
      >
        <View
          className="rounded-[28px] border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-start gap-4">
            <SchoolAvatar
              name={school.name}
              logoUrl={school.logoUrl}
              size={78}
            />
            <View className="min-w-0 flex-1 pt-1">
              <View
                className="self-start flex-row items-center gap-1.5 rounded-full px-2.5 py-1.5"
                style={{ backgroundColor: colors.verifiedSoft }}
              >
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={14}
                  color={colors.verified}
                />
                <Text
                  className="text-[9px] uppercase tracking-[0.6px]"
                  style={{
                    color: colors.verified,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Verified school
                </Text>
              </View>
              <Text
                accessibilityRole="header"
                className="mt-3 text-[24px] leading-7 tracking-[-0.6px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {school.name}
              </Text>
            </View>
          </View>

          <View
            className="mt-5 flex-row items-start gap-2 border-t pt-4"
            style={{ borderTopColor: colors.border }}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={colors.textMuted}
            />
            <Text
              className="flex-1 text-[13px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {school.address}
            </Text>
          </View>

          <View className="mt-4 flex-row flex-wrap gap-2">
            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
              style={{ backgroundColor: colors.primary }}
            >
              <MaterialCommunityIcons
                name="star"
                size={15}
                color={colors.onPrimary}
              />
              <Text
                className="text-[12px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {school.rating.toFixed(1)} · {school.reviewCount} reviews
              </Text>
            </View>
            {school.distanceKm > 0 ? (
              <View
                className="flex-row items-center gap-1.5 rounded-full px-3 py-2"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={15}
                  color={colors.textMuted}
                />
                <Text
                  className="text-[12px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeSemibold,
                  }}
                >
                  {school.distanceKm.toFixed(1)} km away
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-8">
          <SectionHeading title="About" />
          <Text
            className="mt-3 text-[14px] leading-6"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            {school.description.trim() ||
              "This school has not added a description yet."}
          </Text>
        </View>

        <View className="mt-9">
          <SectionHeading
            title="Instructors"
            count={school.totalInstructors}
            onViewAll={
              school.totalInstructors > 0
                ? () => openCollection("instructors")
                : undefined
            }
          />
          {school.instructors.length > 0 ? (
            <View className="mt-4 gap-3">
              {school.instructors.slice(0, 3).map((instructor) => (
                <View
                  key={instructor.id}
                  className="flex-row items-center gap-4 rounded-3xl border p-3"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <MarketplaceImage
                    uri={instructor.profilePhoto}
                    accessibilityLabel={`${instructor.name} photograph`}
                    fallbackIcon="account-outline"
                    rounded="circle"
                    style={{ width: 56, height: 56 }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {instructor.name}
                    </Text>
                    <Text
                      className="mt-1 text-[12px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      Driving instructor
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text
              className="mt-3 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              No instructors are listed yet.
            </Text>
          )}
        </View>

        <View className="mt-9">
          <SectionHeading
            title="Training vehicles"
            count={school.totalVehicles}
            onViewAll={
              school.totalVehicles > 0
                ? () => openCollection("vehicles")
                : undefined
            }
          />
          {school.vehicles.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-3 pt-4"
            >
              {school.vehicles.slice(0, 3).map((vehicle) => (
                <View
                  key={vehicle.id}
                  className="w-56 overflow-hidden rounded-3xl border"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <MarketplaceImage
                    uri={vehicle.photoUrl}
                    accessibilityLabel={`${vehicle.name} photograph`}
                    fallbackIcon="car-hatchback"
                    style={{ width: "100%", height: 126, borderRadius: 0 }}
                  />
                  <View className="p-4">
                    <Text
                      numberOfLines={1}
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {vehicle.name}
                    </Text>
                    <Text
                      className="mt-1 text-[12px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {[
                        transmissionSummaryLabel(vehicle.transmissionType),
                        vehicle.plateNumber,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text
              className="mt-3 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              No training vehicles are listed yet.
            </Text>
          )}
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
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
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
            className="min-h-14 flex-row items-center justify-center gap-2 rounded-full px-6 active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[14px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              View packages
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={colors.onPrimary}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
