import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useToast } from "@/components/common/toast";
import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import {
  AvailableSessionCalendar,
  BookingOptionCard,
} from "@/features/session-booking";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchAvailableTrainingSessions,
  rescheduleLearnerTrainingSession,
} from "@/lib/api";
import {
  availableSessionInstructorLabel,
  availableSessionTimeLabel,
  availableSessionVehicleLabel,
  groupAvailableSessionsByDate,
} from "@/lib/learner/map-sessions";
import { refreshLearnerBookings } from "@/lib/learner/hydrate-learner-operations";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";
import type { ApiError } from "@/types";
import type { AvailableTrainingSession } from "@/types/training-session";

export default function RescheduleBookingScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const lessonCards = useLearnerSessionsStore((state) => state.lessonCards);
  const booking = lessonCards.find((item) => item.id === bookingId);
  const [availableSessions, setAvailableSessions] = useState<
    AvailableTrainingSession[]
  >([]);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;

    let active = true;
    const loadAvailableSessions = async () => {
      try {
        const firstPage = await fetchAvailableTrainingSessions(
          booking.bookingId,
          { page: 1, limit: 50 },
        );
        const sessions = [...firstPage.items];
        for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
          const nextPage = await fetchAvailableTrainingSessions(
            booking.bookingId,
            { page, limit: 50 },
          );
          sessions.push(...nextPage.items);
        }
        if (!active) return;

        const alreadyJoinedSessionIds = new Set(
          lessonCards
            .filter(
              (lesson) =>
                lesson.id !== booking.id && lesson.status !== "cancelled",
            )
            .map((lesson) => lesson.sessionId),
        );
        const alternatives = sessions.filter(
          (session) =>
            session.id !== booking.sessionId &&
            !alreadyJoinedSessionIds.has(session.id),
        );
        const firstDate = groupAvailableSessionsByDate(alternatives)[0];
        setAvailableSessions(alternatives);
        setSelectedDateId(firstDate?.id ?? null);
        setSelectedSessionId(firstDate?.sessions[0]?.id ?? null);
      } catch (caught) {
        if (!active) return;
        setError(
          (caught as ApiError).message ||
            "We could not load alternative lesson times.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAvailableSessions();
    return () => {
      active = false;
    };
  }, [booking, lessonCards]);

  const groupedDates = useMemo(
    () => groupAvailableSessionsByDate(availableSessions),
    [availableSessions],
  );
  const selectedDateGroup = groupedDates.find(
    (group) => group.id === selectedDateId,
  );
  const selectedSession = availableSessions.find(
    (session) => session.id === selectedSessionId,
  );
  const calendarDates = groupedDates.map((group) => ({
    id: group.id,
    label: group.label,
    sessionCount: group.sessions.length,
  }));

  const selectDate = (dateId: string) => {
    const dateGroup = groupedDates.find((group) => group.id === dateId);
    setSelectedDateId(dateId);
    setSelectedSessionId(dateGroup?.sessions[0]?.id ?? null);
  };

  const confirmReschedule = async () => {
    if (!booking || !selectedSession || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const participant = await rescheduleLearnerTrainingSession(
        booking.id,
        selectedSession.id,
      );
      await Promise.all([refreshLearnerBookings(), refreshLearnerSessions()]);
      showToast("Lesson rescheduled successfully.");
      router.replace({
        pathname: "/student/sessions/[bookingId]",
        params: { bookingId: participant.id },
      });
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not reschedule this lesson.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Reschedule lesson" />
        <View className="mt-8">
          <DashboardEmptyState
            icon="calendar-remove-outline"
            title="Lesson not found"
            description="This lesson is no longer available to reschedule."
            actionLabel="View sessions"
            onActionPress={() => router.replace("/student/sessions")}
          />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Reschedule lesson" />

      <View
        className="mt-6 flex-row items-center gap-3 rounded-[24px] border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="calendar-clock"
            size={22}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree-bold text-[10px] uppercase tracking-[0.8px]"
            style={{ color: colors.textSubtle }}
          >
            Current lesson
          </Text>
          <Text
            className="mt-1 font-figtree-bold text-[14px]"
            style={{ color: colors.text }}
          >
            {booking.date} · {booking.time}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-1 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {booking.instructor} · {booking.packageName}
          </Text>
        </View>
      </View>

      {error ? (
        <Text
          className="mt-4 font-figtree-medium text-[13px]"
          style={{ color: colors.error }}
        >
          {error}
        </Text>
      ) : null}

      {loading ? (
        <View className="mt-16 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : groupedDates.length === 0 ? (
        <View className="mt-8">
          <DashboardEmptyState
            icon="calendar-search"
            title="No alternative lessons"
            description="There are no other available school slots for this package right now."
            actionLabel="Keep current lesson"
            onActionPress={() => router.back()}
          />
        </View>
      ) : (
        <>
          <View className="mt-8">
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[22px]"
              style={{ color: colors.text }}
            >
              Choose a new date
            </Text>
            <Text
              className="mt-2 font-figtree text-[13px]"
              style={{ color: colors.textMuted }}
            >
              Your package credit stays reserved while the lesson is moved.
            </Text>
            {selectedDateId ? (
              <View className="mt-5">
                <AvailableSessionCalendar
                  dates={calendarDates}
                  selectedDateId={selectedDateId}
                  onSelectDate={selectDate}
                />
              </View>
            ) : null}
          </View>

          {selectedDateGroup ? (
            <View className="mt-7">
              <View className="mb-3 flex-row items-end justify-between gap-4">
                <View>
                  <Text
                    className="font-figtree-bold text-[17px]"
                    style={{ color: colors.text }}
                  >
                    {selectedDateGroup.label}
                  </Text>
                  <Text
                    className="mt-1 font-figtree text-[12px]"
                    style={{ color: colors.textMuted }}
                  >
                    Choose a new lesson time
                  </Text>
                </View>
                <Text
                  className="font-figtree-bold text-[11px]"
                  style={{ color: colors.primary }}
                >
                  {selectedDateGroup.sessions.length} available
                </Text>
              </View>
              <View className="gap-3">
                {selectedDateGroup.sessions.map((session) => {
                  const seatsLeft = Math.max(
                    session.capacity - session.participantCount,
                    0,
                  );
                  return (
                    <BookingOptionCard
                      key={session.id}
                      icon="clock-outline"
                      title={availableSessionTimeLabel(session)}
                      description={`${session.title} · ${availableSessionInstructorLabel(session)}`}
                      meta={`${availableSessionVehicleLabel(session)} · ${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`}
                      selected={selectedSessionId === session.id}
                      onPress={() => setSelectedSessionId(session.id)}
                    />
                  );
                })}
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedSession || submitting }}
            disabled={!selectedSession || submitting}
            onPress={() => void confirmReschedule()}
            className="mt-9 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: selectedSession
                ? colors.primary
                : colors.surfaceStrong,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text
                  className="font-figtree-bold text-[14px]"
                  style={{
                    color: selectedSession
                      ? colors.onPrimary
                      : colors.textSubtle,
                  }}
                >
                  Confirm new lesson
                </Text>
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={selectedSession ? colors.onPrimary : colors.textSubtle}
                />
              </>
            )}
          </Pressable>
        </>
      )}
    </DashboardScreen>
  );
}
