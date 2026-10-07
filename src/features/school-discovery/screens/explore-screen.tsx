import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { fontFamily } from "@/constants/fonts";
import { getPreferredArea } from "@/constants/preferred-areas";
import { useUserLocation } from "@/features/location";
import { FilterChip, SchoolCard } from "@/features/school-discovery";
import { useMarketplaceNavigation } from "@/features/school-discovery/marketplace-navigation";
import { useDiscoverSchools } from "@/features/school-discovery/use-discover-schools";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSettingsStore } from "@/store/settings.store";

export function ExploreScreen() {
  const router = useRouter();
  const marketplaceNavigation = useMarketplaceNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const {
    coordinates,
    isChecking: isCheckingLocation,
    isGranted: isLocationGranted,
    isPrecise: isPreciseLocation,
    canAskAgain,
    isLocating,
    error: locationError,
    placeName,
    requestLocation,
  } = useUserLocation();
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(false);
  const [priceFilter, setPriceFilter] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(false);
  const [preciseRequestAttempted, setPreciseRequestAttempted] = useState(false);
  const requestLocationRef = useRef(requestLocation);
  const autoLocationAttempted = useRef(false);
  const discoveryLocationMode = useSettingsStore(
    (state) => state.discoveryLocationMode,
  );
  const setDiscoveryLocationMode = useSettingsStore(
    (state) => state.setDiscoveryLocationMode,
  );
  const preferredAreaId = useSettingsStore((state) => state.preferredAreaId);
  const preferredArea = getPreferredArea(preferredAreaId);
  const hasPreciseLocation = isPreciseLocation && Boolean(coordinates);
  const hasCurrentLocation =
    discoveryLocationMode === "current" && hasPreciseLocation;
  const locationBlocked =
    !isCheckingLocation && !isLocationGranted && !canAskAgain;
  const needsPrecisePermission =
    !isCheckingLocation && isLocationGranted && !isPreciseLocation;
  const mustUseSettings =
    locationBlocked ||
    (needsPrecisePermission && (!canAskAgain || preciseRequestAttempted));

  useEffect(() => {
    requestLocationRef.current = requestLocation;
  }, [requestLocation]);

  useFocusEffect(
    useCallback(() => {
      if (
        isCheckingLocation ||
        locationBlocked ||
        needsPrecisePermission ||
        hasPreciseLocation ||
        autoLocationAttempted.current
      )
        return;

      autoLocationAttempted.current = true;
      void requestLocationRef.current({ requirePrecise: true });
    }, [
      hasPreciseLocation,
      isCheckingLocation,
      locationBlocked,
      needsPrecisePermission,
    ]),
  );

  useEffect(() => {
    // An area saved before permission was granted must not become the default
    // discovery location when the app is reopened.
    if (!hasPreciseLocation && discoveryLocationMode === "area") {
      setDiscoveryLocationMode("current");
    }
  }, [discoveryLocationMode, hasPreciseLocation, setDiscoveryLocationMode]);

  const requestPreciseLocation = () => {
    if (mustUseSettings) {
      void Linking.openSettings();
      return;
    }

    if (needsPrecisePermission) setPreciseRequestAttempted(true);
    void requestLocation({ requirePrecise: true }).then((nextCoordinates) => {
      if (nextCoordinates) setPreciseRequestAttempted(false);
    });
  };

  const discoverQuery = useMemo(() => {
    const base = {
      page: 1,
      limit: 20,
      search: query.trim() || undefined,
      minRating: ratingFilter ? 4.5 : undefined,
    };

    if (hasCurrentLocation && coordinates) {
      return {
        ...base,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        radiusKm: 5,
        sort: "distance" as const,
      };
    }

    return {
      ...base,
      city: preferredArea.city,
      state: preferredArea.state,
      sort: "rating" as const,
    };
  }, [
    coordinates,
    hasCurrentLocation,
    preferredArea.city,
    preferredArea.state,
    query,
    ratingFilter,
  ]);

  const { schools, loading, error, refetch } = useDiscoverSchools(
    discoverQuery,
    hasPreciseLocation,
  );

  const filteredSchools = useMemo(() => {
    let result = schools;

    if (distanceFilter && hasCurrentLocation) {
      result = result.filter(
        (school) => school.distanceKm > 0 && school.distanceKm <= 5,
      );
    }

    if (priceFilter) {
      result = result.filter((school) => school.startingPrice < 50000);
    }

    return result;
  }, [distanceFilter, hasCurrentLocation, priceFilter, schools]);

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
        <View className="mb-6 flex-row items-start justify-between gap-3">
          <View className="flex-1 pr-3">
            <Text
              className="mb-1 text-[10px] uppercase tracking-[2px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Driving schools
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              marketplaceNavigation.requiresSignIn ? "Log in" : "Open profile"
            }
            onPress={() => router.push(marketplaceNavigation.accountHref)}
            className="min-h-10 flex-row items-center justify-center gap-1.5 rounded-full border px-3 active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name={
                marketplaceNavigation.requiresSignIn
                  ? "login"
                  : "account-circle-outline"
              }
              size={19}
              color={colors.text}
            />
            <Text
              className="text-[12px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {marketplaceNavigation.requiresSignIn ? "Log in" : "Profile"}
            </Text>
          </Pressable>
        </View>

        {hasPreciseLocation && discoveryLocationMode === "area" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(marketplaceNavigation.locationHref)}
            className="mb-4 flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
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
              Showing schools in {preferredArea.label}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : hasCurrentLocation ? (
          <Pressable
            accessibilityRole="button"
            disabled={isLocating}
            onPress={requestPreciseLocation}
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
                  ? `Showing schools within 5 km of ${placeName}`
                  : "Showing schools within 5 km of your current location"}
            </Text>
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : null}

        {hasPreciseLocation ? (
          <>
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
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeMedium,
                }}
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
                selected={distanceFilter && hasCurrentLocation}
                disabled={!hasCurrentLocation}
                onPress={() => setDistanceFilter((current) => !current)}
              />
              <FilterChip
                icon="tune-variant"
                accessibilityLabel="Reset all filters"
                onPress={resetFilters}
              />
            </ScrollView>
          </>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-6 pb-8 pt-2"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={hasPreciseLocation ? loading : isLocating}
            onRefresh={() => {
              if (hasPreciseLocation) refetch();
              else if (!mustUseSettings) requestPreciseLocation();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        }
      >
        {!hasPreciseLocation && (isCheckingLocation || isLocating) ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-4 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {isCheckingLocation
                ? "Checking location permission…"
                : "Finding your current location…"}
            </Text>
          </View>
        ) : null}

        {!hasPreciseLocation && !isCheckingLocation && !isLocating ? (
          <ContentEmptyState
            icon={locationBlocked ? "map-marker-off-outline" : "crosshairs-gps"}
            title={
              locationBlocked
                ? "Location access is off"
                : needsPrecisePermission
                  ? "Precise location is off"
                  : isLocationGranted
                    ? "Current location unavailable"
                    : "Allow location to explore schools"
            }
            description={
              locationBlocked
                ? "Enable location permission for Learn2Drive in device settings to see schools near you."
                : needsPrecisePermission
                  ? mustUseSettings
                    ? "Precise access was not granted in-app. Turn on Precise Location for Learn2Drive in device settings."
                    : "Allow precise location in the system prompt to see nearby schools."
                  : (locationError ??
                    (isLocationGranted
                      ? "We could not get your current position. Check that device location is on, then try again."
                      : "Allow device location to see nearby driving schools. Your saved area will not load schools without it."))
            }
            actionLabel={
              mustUseSettings
                ? "Open device settings"
                : needsPrecisePermission
                  ? "Request precise location"
                  : isLocationGranted
                    ? "Try again"
                    : "Allow location"
            }
            onActionPress={requestPreciseLocation}
          />
        ) : null}

        {hasPreciseLocation && loading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="mt-4 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Loading driving schools...
            </Text>
          </View>
        ) : null}

        {hasPreciseLocation && !loading && error ? (
          <ContentEmptyState
            icon="cloud-off-outline"
            title="Could not load schools"
            description={error.message}
            actionLabel="Try again"
            onActionPress={refetch}
          />
        ) : null}

        {hasPreciseLocation &&
        !loading &&
        !error &&
        filteredSchools.length === 0 ? (
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
                ? hasCurrentLocation
                  ? "No verified schools within 5 km of this location. If you're testing on a simulator, set a custom location near Lagos (or Basky), then refresh GPS."
                  : `No verified schools are listed in ${preferredArea.label} yet.`
                : "Try another search or clear your current filters."
            }
            actionLabel={
              schools.length === 0 && hasCurrentLocation
                ? "Refresh location"
                : "Clear filters"
            }
            onActionPress={
              schools.length === 0 && hasCurrentLocation
                ? requestPreciseLocation
                : resetFilters
            }
          />
        ) : null}

        {hasPreciseLocation && !loading && !error
          ? filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                onPress={() =>
                  router.push(
                    marketplaceNavigation.schoolHref(
                      school.id,
                      school.distanceKm,
                    ),
                  )
                }
              />
            ))
          : null}
      </ScrollView>
    </View>
  );
}
