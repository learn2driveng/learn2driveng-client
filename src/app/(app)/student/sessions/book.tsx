import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardScreen,
} from "@/components/dashboard";
import {
  BookingOptionCard,
  BookingStepIndicator,
} from "@/features/session-booking";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchAvailableTrainingSessions,
  joinTrainingSession,
} from "@/lib/api";
import {
  availableSessionInstructorLabel,
  availableSessionTimeLabel,
  groupAvailableSessionsByDate,
} from "@/lib/learner/map-sessions";
import {
  refreshLearnerBookings,
} from "@/lib/learner/hydrate-learner-operations";
import { refreshLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import {
  selectActiveLearnerPackages,
  useLearnerOperationsStore,
} from "@/store/learner-operations.store";
import type { ApiError } from "@/types";
import type { AvailableTrainingSession } from "@/types/training-session";

const steps = ["Schedule", "Review"] as const;

export default function BookSessionScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { packageName, schoolName, bookingId } = useLocalSearchParams<{
    packageName?: string;
    schoolName?: string;
    bookingId?: string;
  }>();
  const activePackages = useLearnerOperationsStore(selectActiveLearnerPackages);
  const selectedPackage = activePackages.find(
    (item) => item.bookingId === bookingId,
  );
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSessions, setAvailableSessions] = useState<
    AvailableTrainingSession[]
  >([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    let active = true;

    fetchAvailableTrainingSessions(bookingId, { limit: 50 })
      .then((result) => {
        if (!active) return;
        setAvailableSessions(result.items);
        setSelectedSessionId(result.items[0]?.id ?? null);
      })
      .catch((caught: ApiError) => {
        if (!active) return;
        setError(
          caught?.message ??
            "We could not load available sessions. Please try again.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingId]);

  const groupedDates = useMemo(
    () => groupAvailableSessionsByDate(availableSessions),
    [availableSessions],
  );
  const selectedSession = availableSessions.find(
    (item) => item.id === selectedSessionId,
  );
  const selectedDateGroup = groupedDates.find((group) =>
    group.sessions.some((item) => item.id === selectedSessionId),
  );
  const selectedPackageName =
    packageName ?? selectedPackage?.name ?? "Selected package";
  const selectedSchoolName =
    schoolName ?? selectedPackage?.schoolName ?? "Driving school";
  const remainingCredits = selectedPackage?.remainingSessions ?? 0;
  const isReview = step === steps.length - 1;
  const canContinue = Boolean(selectedSession && bookingId);

  const handleConfirm = async () => {
    if (!selectedSession || !bookingId || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const participant = await joinTrainingSession(
        selectedSession.id,
        bookingId,
      );
      await Promise.all([
        refreshLearnerBookings().catch(() => undefined),
        refreshLearnerSessions().catch(() => undefined),
      ]);

      router.replace({
        pathname: "/student/sessions/confirmation",
        params: {
          participantId: participant.id,
          packageName: selectedPackageName,
          schoolName: selectedSchoolName,
          date: selectedDateGroup?.label ?? "",
          time: availableSessionTimeLabel(selectedSession),
          instructor: availableSessionInstructorLabel(selectedSession),
          sessionTitle: selectedSession.title,
        },
      });
    } catch (caught) {
      setError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError).message
          : "We could not book this session. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingId) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Book a session" />
        <View className="mt-8">
          <DashboardEmptyState
            icon="package-variant-remove"
            title="No package selected"
            description="Choose a training package from your sessions tab before booking a lesson."
            actionLabel="Back to sessions"
            onActionPress={() => router.replace("/student/sessions")}
          />
        </View>
      </DashboardScreen>
    );
  }

  if (loading) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Book a session" />
        <View className="mt-16 items-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Book a session" />
      <View className="mt-8">
        <BookingStepIndicator steps={[...steps]} currentStep={step} />
      </View>

      <View
        className="mt-7 flex-row items-center gap-3 rounded-2xl border p-4"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={21}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree text-[11px] tracking-[0.8px]"
            style={{ color: colors.textSubtle }}
          >
            BOOKING FROM
          </Text>
          <Text
            className="mt-1 font-figtree-semibold text-[14px]"
            style={{ color: colors.text }}
          >
            {selectedPackageName}
          </Text>
          <Text
            className="mt-1 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {selectedSchoolName} · {remainingCredits} credits left
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

      <View className="mt-8">
        {step === 0 ? (
          groupedDates.length === 0 ? (
            <DashboardEmptyState
              icon="calendar-remove-outline"
              title="No sessions available"
              description="This school has not published any open lesson slots for your package yet. Check back later or contact the school."
              actionLabel="Back to sessions"
              onActionPress={() => router.replace("/student/sessions")}
            />
          ) : (
            <View>
              <Text
                accessibilityRole="header"
                className="font-figtree-bold text-[24px]"
                style={{ color: colors.text }}
              >
                Choose a session
              </Text>
              <Text
                className="mt-2 font-figtree text-[14px]"
                style={{ color: colors.textMuted }}
              >
                Pick from the lesson slots published by your driving school.
              </Text>

              <View className="mt-7 gap-6">
                {groupedDates.map((group) => (
                  <View key={group.id}>
                    <Text
                      className="mb-3 font-figtree-bold text-[12px] tracking-[1.2px]"
                      style={{ color: colors.textSubtle }}
                    >
                      {group.label.toUpperCase()}
                    </Text>
                    <View className="gap-3">
                      {group.sessions.map((session) => (
                        <BookingOptionCard
                          key={session.id}
                          icon="calendar-clock"
                          title={session.title}
                          description={`${availableSessionTimeLabel(session)} · ${availableSessionInstructorLabel(session)}`}
                          meta={`${session.participantCount}/${session.capacity} booked`}
                          selected={selectedSessionId === session.id}
                          onPress={() => setSelectedSessionId(session.id)}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )
        ) : null}

        {step === 1 && selectedSession ? (
          <View>
            <Text
              accessibilityRole="header"
              className="font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Review your booking
            </Text>
            <Text
              className="mt-2 font-figtree text-[14px]"
              style={{ color: colors.textMuted }}
            >
              One session credit will be reserved after confirmation.
            </Text>
            <View
              className="mt-6 overflow-hidden rounded-3xl border p-5"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              {[
                ["School", selectedSchoolName],
                ["Package", selectedPackageName],
                ["Session", selectedSession.title],
                ["Date", selectedDateGroup?.label ?? "Selected date"],
                ["Time", availableSessionTimeLabel(selectedSession)],
                ["Instructor", availableSessionInstructorLabel(selectedSession)],
                [
                  "Credit balance",
                  `${remainingCredits} → ${Math.max(remainingCredits - 1, 0)} sessions`,
                ],
              ].map(([label, value], index, values) => (
                <View key={label}>
                  <View className="flex-row items-start justify-between gap-5 py-3">
                    <Text
                      className="font-figtree text-[13px]"
                      style={{ color: colors.textMuted }}
                    >
                      {label}
                    </Text>
                    <Text
                      className="max-w-[62%] text-right font-figtree-semibold text-[13px]"
                      style={{ color: colors.text }}
                    >
                      {value}
                    </Text>
                  </View>
                  {index < values.length - 1 ? (
                    <View
                      className="h-px"
                      style={{ backgroundColor: colors.border }}
                    />
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      {groupedDates.length > 0 ? (
        <View className="mt-10 flex-row gap-3">
          {step > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep((current) => current - 1)}
              className="h-14 flex-1 items-center justify-center rounded-2xl border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text
                className="font-figtree-bold text-[15px]"
                style={{ color: colors.text }}
              >
                Back
              </Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue || submitting }}
            disabled={!canContinue || submitting}
            onPress={() => {
              if (!isReview) {
                setStep(1);
                return;
              }
              void handleConfirm();
            }}
            className="h-14 flex-[2] flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
            style={{
              backgroundColor: canContinue
                ? colors.primary
                : colors.surfaceStrong,
              opacity: submitting ? 0.8 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <>
                <Text
                  className="font-figtree-bold text-[15px]"
                  style={{
                    color: canContinue ? colors.onPrimary : colors.textSubtle,
                  }}
                >
                  {isReview ? "Confirm booking" : "Continue"}
                </Text>
                <MaterialCommunityIcons
                  name={isReview ? "check" : "arrow-right"}
                  size={20}
                  color={canContinue ? colors.onPrimary : colors.textSubtle}
                />
              </>
            )}
          </Pressable>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
