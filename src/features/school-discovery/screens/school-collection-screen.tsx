import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { MarketplaceImage } from "@/features/school-discovery/marketplace-image";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchDiscoverSchoolInstructors,
  fetchDiscoverSchoolVehicles,
} from "@/lib/api/discover";
import {
  formatTransmissionLabel,
  vehicleDisplayName,
} from "@/lib/school/format";
import type {
  PublicDrivingSchoolInstructor,
  PublicDrivingSchoolVehicle,
} from "@/types/school";

type SchoolCollectionScreenProps = {
  collection: "instructors" | "vehicles";
};

type CollectionItem =
  | PublicDrivingSchoolInstructor
  | PublicDrivingSchoolVehicle;

export function SchoolCollectionScreen({
  collection,
}: SchoolCollectionScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { schoolId, schoolName } = useLocalSearchParams<{
    schoolId?: string;
    schoolName?: string;
  }>();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(
    async (nextPage: number, replace = false) => {
      if (!schoolId || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const result =
          collection === "instructors"
            ? await fetchDiscoverSchoolInstructors(schoolId, nextPage)
            : await fetchDiscoverSchoolVehicles(schoolId, nextPage);
        setItems((current) =>
          replace ? result.items : [...current, ...result.items],
        );
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (caught) {
        setError(
          caught && typeof caught === "object" && "message" in caught
            ? String(caught.message)
            : "We could not load this list.",
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [collection, schoolId],
  );

  useEffect(() => {
    if (!schoolId) return;
    let active = true;
    loadingRef.current = true;

    const loadInitialPage = async () => {
      try {
        const result =
          collection === "instructors"
            ? await fetchDiscoverSchoolInstructors(schoolId, 1)
            : await fetchDiscoverSchoolVehicles(schoolId, 1);
        if (!active) return;
        setItems(result.items);
        setPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
      } catch (caught) {
        if (!active) return;
        setError(
          caught && typeof caught === "object" && "message" in caught
            ? String(caught.message)
            : "We could not load this list.",
        );
      } finally {
        if (active) {
          loadingRef.current = false;
          setLoading(false);
        }
      }
    };

    void loadInitialPage();
    return () => {
      active = false;
      loadingRef.current = false;
    };
  }, [collection, schoolId]);

  const renderItem = ({ item }: { item: CollectionItem }) => {
    if (collection === "instructors") {
      const instructor = item as PublicDrivingSchoolInstructor;
      return (
        <View
          className="mb-3 flex-row items-center gap-4 rounded-3xl border p-4"
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
            style={{ width: 64, height: 64 }}
          />
          <View className="flex-1">
            <Text
              className="text-[16px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {instructor.name}
            </Text>
            <Text
              className="mt-1 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Driving instructor
            </Text>
          </View>
        </View>
      );
    }

    const vehicle = item as PublicDrivingSchoolVehicle;
    return (
      <View
        className="mb-4 overflow-hidden rounded-[28px] border"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <MarketplaceImage
          uri={vehicle.photoUrl}
          accessibilityLabel={`${vehicleDisplayName(vehicle)} photograph`}
          fallbackIcon="car-hatchback"
          style={{ width: "100%", height: 190, borderRadius: 0 }}
        />
        <View className="p-5">
          <Text
            className="text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {vehicleDisplayName(vehicle)}
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {[
              formatTransmissionLabel(vehicle.transmissionType),
              vehicle.color,
              vehicle.plateNumber,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Text>
        </View>
      </View>
    );
  };

  const title =
    collection === "instructors" ? "Instructors" : "Training vehicles";

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View
        className="flex-row items-center gap-4 px-5 pb-4"
        style={{ paddingTop: insets.top + 10 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color={colors.text}
          />
        </Pressable>
        <View className="min-w-0 flex-1">
          <Text
            accessibilityRole="header"
            className="text-[22px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 text-[12px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {schoolName ?? "Driving school"}
            {total > 0 ? ` · ${total}` : ""}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && page < totalPages) void loadPage(page + 1);
        }}
        ListEmptyComponent={
          !loading ? (
            <View className="mt-20 items-center px-8">
              <MaterialCommunityIcons
                name={
                  collection === "instructors"
                    ? "account-group-outline"
                    : "car-multiple"
                }
                size={42}
                color={colors.textSubtle}
              />
              <Text
                className="mt-4 text-center text-[14px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {error ?? `No ${title.toLowerCase()} are listed yet.`}
              </Text>
              {error ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Try loading ${title.toLowerCase()} again`}
                  onPress={() => void loadPage(1, true)}
                  className="mt-5 rounded-full px-5 py-3"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text
                    style={{
                      color: colors.onPrimary,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    Try again
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
