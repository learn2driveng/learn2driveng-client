import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { SchoolSummary } from "@/types";

type SchoolCardProps = {
  school: SchoolSummary;
  onPress?: () => void;
};

function formatPrice(price: number) {
  return `₦${price.toLocaleString("en-NG")}`;
}

export function SchoolCard({ school, onPress }: SchoolCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${school.name}`}
      accessibilityHint="Opens the driving school profile"
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      className="rounded-3xl border p-5 active:opacity-80"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View className="mb-1 flex-row items-center gap-2">
            {school.premium ? (
              <View
                className="rounded px-2 py-0.5"
                style={{ backgroundColor: colors.contrastSurface }}
              >
                <Text
                  className="text-[9px] uppercase tracking-[-0.2px]"
                  style={{
                    color: colors.contrastText,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  Premium
                </Text>
              </View>
            ) : null}
            <View className="flex-row items-center gap-0.5">
              <MaterialCommunityIcons
                name="check-decagram"
                size={15}
                color={colors.verified}
              />
              <Text
                className="text-[9px] uppercase"
                style={{
                  color: colors.verified,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {school.premium ? "Verified" : "FRSC Verified"}
              </Text>
            </View>
          </View>

          <Text
            className="text-[19px] leading-6 tracking-[-0.35px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {school.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <MaterialCommunityIcons
              name="map-marker"
              size={13}
              color={colors.textMuted}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="flex-1 text-[12px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {school.location}
            </Text>
          </View>
        </View>

        <View
          className="min-w-10 items-center rounded-xl px-2.5 py-1.5"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[12px] leading-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {school.rating.toFixed(1)}
          </Text>
          <MaterialCommunityIcons
            name="star"
            size={10}
            color={colors.onPrimary}
          />
        </View>
      </View>

      <View
        className="mt-5 flex-row items-center justify-between border-t pt-4"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row gap-5">
          <View>
            <Text
              className="text-[9px] uppercase tracking-[0.7px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Distance
            </Text>
            <Text
              className="mt-0.5 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {school.distanceKm.toFixed(1)} km
            </Text>
          </View>
          <View>
            <Text
              className="text-[9px] uppercase tracking-[0.7px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Starts from
            </Text>
            <Text
              className="mt-0.5 text-[13px]"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {formatPrice(school.startingPrice)}
            </Text>
          </View>
        </View>

        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors.contrastText}
          />
        </View>
      </View>
    </Pressable>
  );
}
