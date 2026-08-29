import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { SessionLocationHistory } from "@/types";
import { GuardianLiveLocationMap } from "./guardian-live-location-map";
import type { GuardianMapLocation } from "./guardian-live-location-map.types";

type SessionRouteHistoryProps = {
  title?: string;
  loadHistory: () => Promise<SessionLocationHistory>;
};

function toMapPoint(
  point: SessionLocationHistory["instructor"][number],
): GuardianMapLocation {
  return {
    latitude: point.latitude,
    longitude: point.longitude,
    heading: point.heading,
    accuracyInMeters: point.accuracyInMeters,
  };
}

function auditStatusLabel(history: SessionLocationHistory) {
  const { audit } = history;
  if (!audit.pairedSampleCount) {
    return "Not enough paired GPS samples to verify co-location yet.";
  }
  if (
    audit.withinThresholdPercent != null &&
    audit.withinThresholdPercent >= 95 &&
    audit.divergentSampleCount === 0
  ) {
    return "Instructor and learner GPS trails tally — both devices tracked the same vehicle.";
  }
  if (
    audit.withinThresholdPercent != null &&
    audit.withinThresholdPercent >= 80
  ) {
    return "GPS trails mostly tally, with a few samples outside the expected in-vehicle range.";
  }
  return "GPS trails diverge more than expected. Review the lesson for possible device separation.";
}

export function SessionRouteHistory({
  title = "Lesson route",
  loadHistory,
}: SessionRouteHistoryProps) {
  const { colors } = useAppTheme();
  const [history, setHistory] = useState<SessionLocationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    void loadHistory()
      .then((result) => {
        if (active) setHistory(result);
      })
      .catch(() => {
        if (active) {
          setError("We could not load the stored route for this lesson.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadHistory]);

  const vehiclePath = useMemo(
    () => history?.instructor.map(toMapPoint) ?? [],
    [history?.instructor],
  );
  const latestVehicle = vehiclePath.at(-1) ?? null;
  const hasRoute = vehiclePath.length > 0;

  if (isLoading) {
    return (
      <View className="mt-6 items-center py-10">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-6">
        <ContentEmptyState
          icon="map-marker-off-outline"
          title="Route unavailable"
          description={error}
        />
      </View>
    );
  }

  if (!history || !hasRoute) {
    return (
      <View className="mt-6">
        <ContentEmptyState
          icon="map-marker-path"
          title="No route recorded"
          description="GPS coordinates were not stored for this lesson."
        />
      </View>
    );
  }

  const auditMatches =
    history.audit.divergentSampleCount === 0 &&
    history.audit.withinThresholdPercent != null &&
    history.audit.withinThresholdPercent >= 95;

  return (
    <View className="mt-6 gap-4">
      <View>
        <Text
          className="font-figtree-bold text-[16px]"
          style={{ color: colors.text }}
        >
          {title}
        </Text>
        <Text
          className="mt-2 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          The map shows the training vehicle route. Instructor and learner GPS
          are both stored in the database for audit and should tally while the
          lesson is active.
        </Text>
      </View>

      <GuardianLiveLocationMap
        vehicle={latestVehicle}
        vehicleLabel="Training vehicle"
        path={vehiclePath}
      />

      <View
        className="rounded-3xl border p-4"
        style={{
          backgroundColor: auditMatches ? colors.successSoft : colors.surface,
          borderColor: auditMatches ? colors.success : colors.border,
        }}
      >
        <Text
          className="font-figtree-bold text-[13px]"
          style={{ color: colors.text }}
        >
          GPS audit
        </Text>
        <Text
          className="mt-2 font-figtree text-[12px] leading-5"
          style={{ color: colors.textMuted }}
        >
          {auditStatusLabel(history)}
        </Text>
        <Text
          className="mt-3 font-figtree-medium text-[12px]"
          style={{ color: colors.textMuted }}
        >
          Instructor pings: {history.audit.instructorPingCount} · Learner pings:{" "}
          {history.audit.learnerPingCount}
        </Text>
        {history.audit.pairedSampleCount ? (
          <>
            <Text
              className="mt-2 font-figtree-medium text-[12px]"
              style={{ color: colors.textMuted }}
            >
              Paired samples: {history.audit.pairedSampleCount} · Within{" "}
              {history.audit.proximityThresholdMeters} m:{" "}
              {history.audit.withinThresholdPercent ?? 0}%
            </Text>
            {history.audit.averageProximityMeters != null ? (
              <Text
                className="mt-2 font-figtree-medium text-[12px]"
                style={{ color: colors.textMuted }}
              >
                Average separation:{" "}
                {Math.round(history.audit.averageProximityMeters)} m · Max:{" "}
                {history.audit.maxProximityMeters != null
                  ? Math.round(history.audit.maxProximityMeters)
                  : "—"}{" "}
                m
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}
