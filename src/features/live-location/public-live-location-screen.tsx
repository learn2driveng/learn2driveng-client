import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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
import type { SessionLocationSnapshot } from "@/types";
import type { ApiError } from "@/types";
import {
  haversineMeters,
  PROXIMITY_WARNING_METERS,
} from "./geo-utils";
import { GuardianLiveLocationMap } from "./guardian-live-location-map";
import type { GuardianMapLocation } from "./guardian-live-location-map.types";

type PublicLiveLocationScreenProps = { shareToken?: string };

function mapSnapshot(
  snapshot: SessionLocationSnapshot | null | undefined,
): GuardianMapLocation | null {
  if (!snapshot) return null;
  return {
    latitude: snapshot.latitude,
    longitude: snapshot.longitude,
    accuracyInMeters: snapshot.accuracyInMeters,
    heading: snapshot.heading,
  };
}

function appendPathPoint(
  path: GuardianMapLocation[],
  point: GuardianMapLocation,
  maxPoints = 200,
) {
  const last = path[path.length - 1];
  if (
    last &&
    last.latitude === point.latitude &&
    last.longitude === point.longitude
  ) {
    return path;
  }
  return [...path, point].slice(-maxPoints);
}

export function PublicLiveLocationScreen({
  shareToken,
}: PublicLiveLocationScreenProps) {
  const { colors } = useAppTheme();
  const [share, setShare] = useState<PublicLessonLocationShare | null>(null);
  const [instructorPath, setInstructorPath] = useState<GuardianMapLocation[]>(
    [],
  );
  const [unavailableReason, setUnavailableReason] = useState<
    "expired" | "connection" | null
  >(null);

  const instructorLocation = mapSnapshot(share?.locations.instructor ?? null);
  const learnerLocation = mapSnapshot(share?.locations.learner ?? null);

  const proximityMeters = useMemo(() => {
    if (share?.proximityMeters != null) return share.proximityMeters;
    if (!instructorLocation || !learnerLocation) return null;
    return haversineMeters(
      instructorLocation.latitude,
      instructorLocation.longitude,
      learnerLocation.latitude,
      learnerLocation.longitude,
    );
  }, [instructorLocation, learnerLocation, share?.proximityMeters]);

  const learnerDisplayName =
    share?.learnerFirstNames?.[0] != null
      ? share.learnerFirstNames[0]
      : "Learner";
  const instructorDisplayName =
    share?.instructorFirstName != null
      ? share.instructorFirstName
      : "Instructor";

  const showProximityWarning =
    proximityMeters != null && proximityMeters > PROXIMITY_WARNING_METERS;

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

        const initialInstructor = mapSnapshot(initial.locations.instructor);
        if (initialInstructor) {
          setInstructorPath([initialInstructor]);
        }

        socket = io(`${getRealtimeBaseUrl()}/session-location`, {
          auth: { shareToken },
          transports: ["websocket"],
        });
        socket.on("connect", () => {
          socket?.emit("session:subscribe", { sessionId: initial.sessionId });
        });
        socket.on("location:updated", (location: SessionLocationSnapshot) => {
          setShare((current) => {
            if (!current) return current;
            const role = location.sourceRole;
            return {
              ...current,
              locations: {
                ...current.locations,
                [role]: location,
              },
            };
          });

          if (location.sourceRole === "instructor") {
            const point = mapSnapshot(location);
            if (point) {
              setInstructorPath((current) => appendPathPoint(current, point));
            }
          }
        });
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

  const latestUpdate =
    instructorLocation?.latitude != null
      ? share?.locations.instructor?.recordedAt
      : learnerLocation?.latitude != null
        ? share?.locations.learner?.recordedAt
        : null;

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

      {share ? (
        <View
          className="mt-8 rounded-3xl border p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text
            accessibilityRole="header"
            className="font-figtree-bold text-[22px] leading-8"
            style={{ color: colors.text }}
          >
            {share.title}
          </Text>
          <Text
            className="mt-2 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            {instructorDisplayName} is conducting a lesson with {learnerDisplayName}.
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-3">
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: colors.successSoft }}
            >
              <Text
                className="font-figtree-bold text-[11px]"
                style={{ color: colors.success }}
              >
                Learner: {learnerDisplayName}
              </Text>
            </View>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "#FFF7E6" }}
            >
              <Text
                className="font-figtree-bold text-[11px]"
                style={{ color: colors.primary }}
              >
                Instructor: {instructorDisplayName}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Text
          accessibilityRole="header"
          className="mt-8 font-figtree-bold text-[28px] leading-9"
          style={{ color: colors.text }}
        >
          Live driving lesson
        </Text>
      )}

      {showProximityWarning ? (
        <View
          className="mt-4 flex-row items-start gap-3 rounded-3xl border p-4"
          style={{
            backgroundColor: "#FFF7ED",
            borderColor: "#FB923C",
          }}
        >
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={22}
            color="#EA580C"
          />
          <View className="flex-1">
            <Text
              className="font-figtree-bold text-[13px]"
              style={{ color: "#9A3412" }}
            >
              Positions look far apart
            </Text>
            <Text
              className="mt-1 font-figtree text-[12px] leading-5"
              style={{ color: "#C2410C" }}
            >
              The learner and instructor are about {Math.round(proximityMeters!)}{" "}
              m apart. Confirm both devices are in the same vehicle before
              relying on this view.
            </Text>
          </View>
        </View>
      ) : null}

      <View className="mt-6">
        {instructorLocation || learnerLocation ? (
          <GuardianLiveLocationMap
            instructor={instructorLocation}
            learner={learnerLocation}
            instructorLabel={`${instructorDisplayName} (vehicle)`}
            learnerLabel={learnerDisplayName}
            path={instructorPath}
          />
        ) : (
          <View
            className="h-80 items-center justify-center rounded-[28px] border"
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
            <Text
              className="mt-2 px-8 text-center font-figtree text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              The map will appear once the instructor or learner shares a GPS
              update.
            </Text>
          </View>
        )}
      </View>

      <View className="mt-4 flex-row items-center justify-center gap-5">
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "#FFB800" }}
          />
          <Text
            className="font-figtree-medium text-[11px]"
            style={{ color: colors.textMuted }}
          >
            Instructor
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: "#059669" }}
          />
          <Text
            className="font-figtree-medium text-[11px]"
            style={{ color: colors.textMuted }}
          >
            Learner
          </Text>
        </View>
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
            className="font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {latestUpdate
              ? `Last update ${new Intl.DateTimeFormat("en-NG", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                }).format(new Date(latestUpdate))}`
              : "Connecting to live location updates…"}
          </Text>
          {proximityMeters != null && !showProximityWarning ? (
            <Text
              className="mt-2 font-figtree text-[11px]"
              style={{ color: colors.textMuted }}
            >
              Learner and instructor are about {Math.round(proximityMeters)} m
              apart
            </Text>
          ) : null}
          <Text
            className="mt-3 font-figtree text-[11px] leading-5"
            style={{ color: colors.textSubtle }}
          >
            This private link closes automatically when the lesson ends.
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
