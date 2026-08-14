import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { io } from "socket.io-client";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardScreen } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getRealtimeBaseUrl } from "@/lib/api/config";
import {
  fetchPublicLessonLocationShare,
  type PublicLessonLocationShare,
} from "@/lib/api/training-sessions";
import { LiveLocationMap } from "./live-location-map";
import type { ApiError } from "@/types";

type PublicLiveLocationScreenProps = { shareToken?: string };

export function PublicLiveLocationScreen({
  shareToken,
}: PublicLiveLocationScreenProps) {
  const { colors } = useAppTheme();
  const [share, setShare] = useState<PublicLessonLocationShare | null>(null);
  const [unavailableReason, setUnavailableReason] = useState<
    "expired" | "connection" | null
  >(null);

  useEffect(() => {
    if (!shareToken) {
      const timer = setTimeout(() => setUnavailableReason("expired"), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    let socket: ReturnType<typeof io> | null = null;

    const connect = async () => {
      try {
        const initial = await fetchPublicLessonLocationShare(shareToken);
        if (!active) return;
        setShare(initial);
        socket = io(`${getRealtimeBaseUrl()}/session-location`, {
          auth: { shareToken },
          transports: ["websocket"],
        });
        socket.on("connect", () => {
          socket?.emit("session:subscribe", { sessionId: initial.sessionId });
        });
        socket.on(
          "location:updated",
          (location: NonNullable<PublicLessonLocationShare["location"]>) => {
            setShare((current) =>
              current ? { ...current, location } : current,
            );
          },
        );
        socket.on("session:ended", () => setUnavailableReason("expired"));
        socket.on("connect_error", () => setUnavailableReason("connection"));
      } catch (caught) {
        if (active) {
          const error = caught as ApiError;
          setUnavailableReason(
            error.statusCode === 404 ? "expired" : "connection",
          );
        }
      }
    };

    void connect();
    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [shareToken]);

  if (unavailableReason) {
    const expired = unavailableReason === "expired";
    return (
      <DashboardScreen>
        <View className="items-center">
          <AppLogo height={48} />
        </View>
        <View className="mt-16">
          <ContentEmptyState
            icon={expired ? "link-variant-off" : "cloud-alert-outline"}
            title={
              expired
                ? "This tracking link is no longer active"
                : "Live tracking is temporarily unavailable"
            }
            description={
              expired
                ? "The lesson may have ended, or the learner may have stopped sharing."
                : "The tracking page cannot reach Learn2Drive right now. Check the connection and try again."
            }
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <View className="flex-row items-center justify-between">
        <AppLogo height={46} />
        <View
          className="flex-row items-center gap-2 rounded-full px-3 py-2"
          style={{ backgroundColor: colors.successSoft }}
        >
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: colors.success }}
          />
          <Text
            className="font-figtree-bold text-[10px] uppercase"
            style={{ color: colors.success }}
          >
            Live lesson
          </Text>
        </View>
      </View>
      <Text
        accessibilityRole="header"
        className="mt-8 font-figtree-bold text-[28px] leading-9"
        style={{ color: colors.text }}
      >
        Live driving lesson
      </Text>
      <Text
        className="mt-2 font-figtree text-[13px] leading-5"
        style={{ color: colors.textMuted }}
      >
        The learner shared this private view with you. It closes automatically
        when the lesson ends.
      </Text>

      <View className="mt-6">
        {share?.location ? (
          <LiveLocationMap
            coordinates={share.location}
            learnerName="Training vehicle"
          />
        ) : (
          <View
            className="h-72 items-center justify-center rounded-[28px] border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={38}
              color={colors.primary}
            />
            <Text
              className="mt-4 font-figtree-bold text-[15px]"
              style={{ color: colors.text }}
            >
              Waiting for location
            </Text>
          </View>
        )}
      </View>

      {share ? (
        <View
          className="mt-6 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="font-figtree-bold text-[16px]"
            style={{ color: colors.text }}
          >
            {share.title}
          </Text>
          <Text
            className="mt-2 font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {share.location
              ? `Updated ${new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(share.location.recordedAt))}`
              : "Connecting to the instructor’s location…"}
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
