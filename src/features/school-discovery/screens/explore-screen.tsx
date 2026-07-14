import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { fontFamily } from "@/constants/fonts";
import { FilterChip, SchoolCard } from "@/features/school-discovery";
import { useAppTheme } from "@/hooks/use-app-theme";
import { schoolCatalog } from "@/sample_data";

type ExploreScreenProps = {
  publicMarketplace?: boolean;
};

export function ExploreScreen({
  publicMarketplace = false,
}: ExploreScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(true);
  const [priceFilter, setPriceFilter] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState(false);

  const filteredSchools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return schoolCatalog.filter((school) => {
      const matchesQuery =
        !normalizedQuery ||
        school.name.toLowerCase().includes(normalizedQuery) ||
        school.location.toLowerCase().includes(normalizedQuery);
      const matchesRating = !ratingFilter || school.rating >= 4.5;
      const matchesPrice = !priceFilter || school.startingPrice < 50000;
      const matchesDistance = !distanceFilter || school.distanceKm <= 5;

      return matchesQuery && matchesRating && matchesPrice && matchesDistance;
    });
  }, [distanceFilter, priceFilter, query, ratingFilter]);

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
        {schoolCatalog.length === 0 ? (
          <ContentEmptyState
            icon="school-outline"
            title="No schools available yet"
            description="There are no verified schools serving this location right now."
            actionLabel="Change location"
            onActionPress={() =>
              router.push(
                publicMarketplace ? "/location" : "/student/profile/location",
              )
            }
          />
        ) : null}

        {schoolCatalog.length > 0 ? (
          <>
            {filteredSchools.map((school) => (
              <SchoolCard
                key={school.id}
                school={school}
                onPress={() =>
                  router.push({
                    pathname: publicMarketplace
                      ? "/explore/[schoolId]"
                      : "/student/explore/[schoolId]",
                    params: { schoolId: school.id },
                  })
                }
              />
            ))}

            {filteredSchools.length === 0 ? (
              <ContentEmptyState
                icon="filter-remove-outline"
                title="No schools match"
                description="Try another search or clear your current filters."
                actionLabel="Clear filters"
                onActionPress={resetFilters}
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
