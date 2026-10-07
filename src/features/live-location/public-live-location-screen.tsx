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
import type { ApiError } from "@/types";
import { PublicLiveLocationCanvas } from "./public-live-location-canvas";
import { createSessionLocationSocket } from "./session-location-socket";

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
      setShare(null);
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
    <PublicLiveLocationCanvas
      share={share}
      status={status}
      connectionError={connectionError}
      onReconnect={() => setConnectionAttempt((attempt) => attempt + 1)}
    />
  );
}
