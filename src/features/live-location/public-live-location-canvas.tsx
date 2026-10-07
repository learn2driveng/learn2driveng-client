import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/common/app-logo";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { PublicLessonLocationShare } from "@/lib/api/training-sessions";
import { formatLiveLocation } from "./format-live-location";
import { LiveLocationMap } from "./live-location-map";
import {
  formatTrackedVehicle,
  formatTrackedVehicleMarker,
} from "./tracked-vehicle";

type TrackingStatus =
  | "loading"
  | "connecting"
  | "waiting"
  | "live"
  | "reconnecting"
  | "unavailable";

type PublicLiveLocationCanvasProps = {
  share: PublicLessonLocationShare | null;
  status: TrackingStatus;
  connectionError: string | null;
  onReconnect: () => void;
};

export function PublicLiveLocationCanvas({
  share,
  status,
  connectionError,
  onReconnect,
}: PublicLiveLocationCanvasProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const panelWidth = Math.min(width - 32, 460);
  const panelLeft = (width - panelWidth) / 2;
  const location = share?.location;
  const isLive = status === "live";
  const statusLabel = isLive
    ? "Live lesson"
    : status === "reconnecting"
      ? "Reconnecting"
      : status === "unavailable"
        ? "Connection lost"
        : "Connecting";

  return (
    <View className="flex-1" style={{ backgroundColor: colors.surfaceStrong }}>
      {location ? (
        <LiveLocationMap
          coordinates={location}
          vehicleLabel={formatTrackedVehicleMarker(share.vehicle)}
          fill
        />
      ) : (
        <View className="absolute inset-0 items-center justify-center px-8">
          <MaterialCommunityIcons
            name="map-marker-radius-outline"
            size={48}
            color={colors.primary}
          />
          <Text
            className="mt-4 text-center font-figtree-bold text-[18px]"
            style={{ color: colors.text }}
          >
            Waiting for the vehicle’s location
          </Text>
          <Text
            className="mt-2 text-center font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            The map will appear as soon as the instructor shares an update.
          </Text>
        </View>
      )}

      <View
        className="absolute flex-row items-center justify-between gap-3 rounded-[24px] border px-4 py-3"
        style={{
          top: insets.top + 12,
          left: panelLeft,
          width: panelWidth,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <AppLogo height={30} />
        <View
          className="flex-row items-center gap-2 rounded-full px-3 py-2"
          style={{ backgroundColor: isLive ? colors.successSoft : colors.surfaceStrong }}
        >
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: status === "unavailable" ? colors.error : colors.success }}
          />
          <Text
            className="font-figtree-bold text-[10px] uppercase"
            style={{ color: status === "unavailable" ? colors.error : colors.success }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      {share ? (
        <View
          className="absolute overflow-hidden rounded-[28px] border"
          style={{
            bottom: insets.bottom + 12,
            left: panelLeft,
            width: panelWidth,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            maxHeight: Math.max(220, Math.min(360, height * 0.43)),
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20 }}
          >
            <Text
              className="font-figtree-bold text-[19px] leading-6"
              style={{ color: colors.text }}
            >
              {share.title}
            </Text>
            <Text
              className="mt-1 font-figtree-medium text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              {formatTrackedVehicle(share.vehicle)}
            </Text>
            <View className="mt-4 flex-row items-start gap-3">
              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="font-figtree-bold text-[10px] uppercase tracking-wide"
                  style={{ color: colors.textSubtle }}
                >
                  Current location
                </Text>
                <Text
                  className="mt-1 font-figtree-medium text-[13px] leading-5"
                  style={{ color: colors.text }}
                >
                  {location
                    ? formatLiveLocation(location)
                    : "Waiting for the instructor’s location…"}
                </Text>
              </View>
            </View>
            <Text
              className="mt-3 font-figtree text-[11px]"
              style={{ color: colors.textMuted }}
            >
              {location
                ? `Updated ${new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(location.recordedAt))}`
                : "Connecting to the instructor’s location…"}
            </Text>
            {connectionError && !isLive ? (
              <Text
                className="mt-2 font-figtree-medium text-[11px] leading-4"
                style={{ color: colors.error }}
              >
                {connectionError}
              </Text>
            ) : null}
            {status === "unavailable" ? (
              <Pressable
                accessibilityRole="button"
                onPress={onReconnect}
                className="mt-4 h-11 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                <Text
                  className="font-figtree-bold text-[12px]"
                  style={{ color: colors.onPrimary }}
                >
                  Reconnect
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
