import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { SessionRouteHistory } from "@/features/live-location";
import { fetchLearnerLocationHistory } from "@/lib/api/training-sessions";

export default function LearnerRouteHistoryScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const loadHistory = useCallback(async () => {
    if (!bookingId) {
      throw new Error("Lesson not found.");
    }
    return fetchLearnerLocationHistory(bookingId);
  }, [bookingId]);

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Lesson route" />
      <SessionRouteHistory loadHistory={loadHistory} />
    </DashboardScreen>
  );
}
