import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { fontFamily } from "@/constants/fonts";
import { useUserLocation } from "@/features/location";
import { FilterChip, SchoolCard } from "@/features/school-discovery";
import { useDiscoverSchools } from "@/features/school-discovery/use-discover-schools";
import { useAppTheme } from "@/hooks/use-app-theme";

type ExploreScreenProps = {
  publicMarketplace?: boolean;
};

export function ExploreScreen({
  publicMarketplace = false,
}: ExploreScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const {
    coordinates,
    isChecking: isCheckingLocation,
    isGranted: isLocationGranted,
    isLocating,
    error: locationError,
    placeName,
    requestLocation,
  } = useUserLocation();
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(false);
  const [priceFilter, setPriceFilter] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isCheckingLocation || !isLocationGranted) {
        return;
      }

      void requestLocation();
    }, [isCheckingLocation, isLocationGranted, requestLocation]),
  );

  const discoverQuery = useMemo(() => {
    const base = {
      page: 1,
      limit: 20,
      search: query.trim() || undefined,
      minRating: ratingFilter ? 4.5 : undefined,
    };

    if (coordinates) {
      return {
        ...base,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radiusKm: 50,
        sort: "distance" as const,
      };
    }

    return {
      ...base,
      sort: "rating" as const,
    };
  }, [coordinates, query, ratingFilter]);

  const { schools, loading, error, refetch } = useDiscoverSchools(discoverQuery);

  const filteredSchools = useMemo(() => {
    let result = schools;

    if (distanceFilter && coordinates) {
      result = result.filter(
        (school) => school.distanceKm > 0 && school.distanceKm <= 5,
      );
    }

    if (priceFilter) {
      result = result.filter((school) => school.startingPrice < 50000);
    }

    return result;
  }, [coordinates, distanceFilter, priceFilter, schools]);

  const resetFilters = () => {
    setQuery("");
    setRatingFilter(false);
    setPriceFilter(false);
    setDistanceFilter(false);
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
    >
      <View className="px-6 pb-2 pt-4">
        <View className="mb-4 flex-row items-center justify-between">
          <AppLogo height={44} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={publicMarketplace ? "Sign in" : "Open profile"}
            onPress={() =>
              publicMarketplace
                ? router.push("/login")
                : router.push("/student/profile")
            }
            className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={24}
              color={colors.text}
            />
          </Pressable>
        </View>
        <View className="mb-6">
          <View className="pr-3">
            <Text
              className="mb-1 text-[10px] uppercase tracking-[2px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              FRSC Verified
            </Text>
            <Text
              accessibilityRole="header"
              className="text-[24px] leading-7 tracking-[-0.7px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              Top Rated Schools{" "}
              <Text style={{ color: colors.primary }}>Near You</Text>
            </Text>
          </View>
        </View>

        {coordinates ? (
          <Pressable
            accessibilityRole="button"
            disabled={isLocating}
            onPress={() => void requestLocation()}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={22}
              color={colors.primary}
            />
            <Text
              className="flex-1 text-[12px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {isLocating
                ? "Updating your current location…"
                : placeName
                  ? `Showing schools within 50 km of ${placeName}`
                  : "Showing schools within 50 km of your current location"}
            </Text>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : !isCheckingLocation ? (
          <Pressable
            accessibilityRole="button"
            disabled={isLocating}
            onPress={() => {
              if (isLocationGranted) {
                void requestLocation();
                return;
              }

              router.push(
                publicMarketplace ? "/location" : "/student/profile/location",
              );
            }}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={22}
              color={colors.primary}
            />
            <Text
              className="flex-1 text-[12px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {isLocating
                ? "Finding your current location…"
                : (locationError ??
                  "Enable location to sort schools by distance from you.")}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : null}

        <View
          className="h-13 flex-row items-center rounded-2xl border px-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textSubtle}
          />
          <TextInput
            accessibilityLabel="Search driving schools"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            onChangeText={setQuery}
            placeholder="Search driving schools..."
            placeholderTextColor={colors.textFaint}
            returnKeyType="search"
            value={query}
            className="ml-3 flex-1 py-3 text-[13px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeMedium }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 py-3"
          keyboardShouldPersistTaps="handled"
        >
          <FilterChip
            icon="star"
            label="Rating 4.5+"
            selected={ratingFilter}
            onPress={() => setRatingFilter((current) => !current)}
          />
          <FilterChip
            icon="cash-multiple"
            label="Under ₦50k"
            selected={priceFilter}
            onPress={() => setPriceFilter((current) => !current)}
          />
          <FilterChip
            icon="map-marker-distance"
            label="Within 5km"
            selected={distanceFilter}
            disabled={!coordinates}
            onPress={() => setDistanceFilter((current) => !current)}
          />
          <FilterChip
            icon="tune-variant"
            accessibilityLabel="Reset all filters"
            onPress={resetFilters}
          />
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-8 pt-2"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-4 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Loading schools near you...
            </Text>
          </View>
        ) : null}

        {!loading && error ? (
          <ContentEmptyState
            icon="cloud-off-outline"
            title="Could not load schools"
            description={error.message}
            actionLabel="Try again"
            onActionPress={refetch}
          />
        ) : null}

        {!loading && !error && filteredSchools.length === 0 ? (
          <ContentEmptyState
            icon={
              schools.length === 0 ? "school-outline" : "filter-remove-outline"
            }
            title={
              schools.length === 0
                ? "No schools available yet"
                : "No schools match"
            }
            description={
              schools.length === 0
                ? coordinates
                  ? "No verified schools within 50 km of this location. If you're testing on a simulator, set a custom location near Lagos (or Basky), then refresh GPS."
                  : "There are no verified schools listed yet, or enable location for distance-based results."
                : "Try another search or clear your current filters."
            }
            actionLabel={
              schools.length === 0 && coordinates
                ? "Refresh location"
                : "Clear filters"
            }
            onActionPress={
              schools.length === 0 && coordinates
                ? () => void requestLocation()
                : resetFilters
            }
          />
        ) : null}

        {!loading && !error
          ? filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                onPress={() =>
                  router.push({
                    pathname: publicMarketplace
                      ? "/explore/[schoolId]"
                      : "/student/explore/[schoolId]",
                    params: {
                      schoolId: school.id,
                      distanceKm: String(school.distanceKm),
                    },
                  })
                }
              />
            ))
          : null}
      </ScrollView>
    </View>
  );
}
