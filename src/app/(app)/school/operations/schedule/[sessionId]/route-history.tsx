import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { SessionRouteHistory } from "@/features/live-location";
import { fetchSchoolLocationHistory } from "@/lib/api/training-sessions";

export default function SchoolRouteHistoryScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const loadHistory = useCallback(async () => {
    if (!sessionId) {
      throw new Error("Lesson not found.");
    }
    return fetchSchoolLocationHistory(sessionId);
  }, [sessionId]);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Lesson route" />
      <SessionRouteHistory loadHistory={loadHistory} />
    </DashboardScreen>
  );
}
