import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardScreen } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchPublicLessonLocationShare,
  type PublicLessonLocationShare,
} from "@/lib/api/training-sessions";
import { LiveLocationMap } from "./live-location-map";
import { createSessionLocationSocket } from "./session-location-socket";
import { formatLiveLocation } from "./format-live-location";
import {
  formatTrackedVehicle,
  formatTrackedVehicleMarker,
} from "./tracked-vehicle";
import type { ApiError } from "@/types";

type PublicLiveLocationScreenProps = { shareToken?: string };

export function PublicLiveLocationScreen({
  shareToken,
}: PublicLiveLocationScreenProps) {
  const { colors } = useAppTheme();
  const [share, setShare] = useState<PublicLessonLocationShare | null>(null);
  const [status, setStatus] = useState<
    | "loading"
    | "connecting"
    | "waiting"
    | "live"
    | "reconnecting"
    | "unavailable"
    | "expired"
  >("loading");
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempt, setConnectionAttempt] = useState(0);

  useEffect(() => {
    if (!shareToken) {
      const timer = setTimeout(() => setStatus("expired"), 0);
      return () => clearTimeout(timer);
    }
    let active = true;
    let socket: ReturnType<typeof createSessionLocationSocket> | null = null;

    const connect = async () => {
      setConnectionError(null);
      setStatus("loading");
      try {
        const initial = await fetchPublicLessonLocationShare(shareToken);
        if (!active) return;
        setShare(initial);
        setStatus(initial.location ? "live" : "connecting");
        socket = createSessionLocationSocket({ shareToken });
        socket.on("connect", () => {
          socket?.timeout(10_000).emit(
            "session:subscribe",
            { sessionId: initial.sessionId },
            (
              error: Error | null,
              response?: {
                success: boolean;
                message?: string;
                location?: PublicLessonLocationShare["location"];
              },
            ) => {
              if (!active) return;
              if (error || !response) {
                setConnectionError("The live session did not respond.");
                setStatus("unavailable");
                return;
              }
              if (!response.success) {
                setConnectionError(
                  response.message ?? "This tracking link is not active.",
                );
                setStatus("expired");
                socket?.disconnect();
                return;
              }
              if (response.location) {
                setShare((current) =>
                  current
                    ? { ...current, location: response.location ?? null }
                    : current,
                );
                setStatus("live");
              } else {
                setStatus("waiting");
              }
            },
          );
        });
        socket.on(
          "location:updated",
          (location: NonNullable<PublicLessonLocationShare["location"]>) => {
            setShare((current) =>
              current ? { ...current, location } : current,
            );
            setConnectionError(null);
            setStatus("live");
          },
        );
        socket.on("session:ended", () => setStatus("expired"));
        socket.on("connect_error", (error) => {
          setConnectionError(
            error.message || "The realtime service is offline.",
          );
          setStatus("reconnecting");
        });
        socket.on("disconnect", (reason) => {
          if (reason === "io client disconnect") return;
          setStatus(
            reason === "io server disconnect" ? "unavailable" : "reconnecting",
          );
        });
        socket.io.on("reconnect_attempt", () => setStatus("reconnecting"));
        socket.io.on("reconnect_failed", () => {
          setConnectionError("Learn2Drive could not reconnect to this lesson.");
          setStatus("unavailable");
        });
      } catch (caught) {
        if (active) {
          const error = caught as ApiError;
          setConnectionError(error.message);
          setStatus(error.statusCode === 404 ? "expired" : "unavailable");
        }
      }
    };

    void connect();
    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [connectionAttempt, shareToken]);

  if (status === "expired" || (status === "unavailable" && !share)) {
    const expired = status === "expired";
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
                : (connectionError ??
                  "The tracking page cannot reach Learn2Drive right now.")
            }
          />
          {!expired ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setConnectionAttempt((attempt) => attempt + 1)}
              className="mx-auto mt-6 h-12 items-center justify-center rounded-full px-7 active:opacity-75"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.onPrimary }}
              >
                Try again
              </Text>
            </Pressable>
          ) : null}
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
            style={{
              backgroundColor:
                status === "unavailable" ? colors.error : colors.success,
            }}
          />
          <Text
            className="font-figtree-bold text-[10px] uppercase"
            style={{ color: colors.success }}
          >
            {status === "live"
              ? "Live lesson"
              : status === "reconnecting"
                ? "Reconnecting"
                : status === "unavailable"
                  ? "Connection lost"
                  : "Connecting"}
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
            vehicleLabel={formatTrackedVehicleMarker(share.vehicle)}
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
            {formatTrackedVehicle(share.vehicle)}
          </Text>
          <View className="mt-4 flex-row items-start gap-3">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={19}
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
                className="mt-1 font-figtree-medium text-[12px] leading-5"
                style={{ color: colors.text }}
              >
                {share.location
                  ? formatLiveLocation(share.location)
                  : "Waiting for the instructor’s location…"}
              </Text>
            </View>
          </View>
          <Text
            className="mt-3 font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {share.location
              ? `Updated ${new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(share.location.recordedAt))}`
              : "Connecting to the instructor’s location…"}
          </Text>
          {connectionError && status !== "live" ? (
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
              onPress={() => setConnectionAttempt((attempt) => attempt + 1)}
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
        </View>
      ) : null}
    </DashboardScreen>
  );
}
