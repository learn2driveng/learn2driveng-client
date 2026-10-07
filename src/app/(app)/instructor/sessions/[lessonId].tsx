import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { toInstructorLessonStatus } from "@/features/instructor";
import { requestInstructorLocationPermissions } from "@/features/location";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  extendInstructorTrainingSession,
  startInstructorTrainingSession,
} from "@/lib/api/training-sessions";
import { refreshInstructorOperations } from "@/lib/instructor/hydrate-instructor-operations";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";
import { useSettingsStore } from "@/store/settings.store";
import { useTrainingSessionStore } from "@/store/training-session.store";
import type { ApiError } from "@/types";

type SessionStage = "ready" | "active" | "completed" | "unavailable";
type ChecklistKey = "learner" | "vehicle" | "brief";

const checklistItems: {
  key: ChecklistKey;
  title: string;
  description: string;
}[] = [
  {
    key: "learner",
    title: "Learners confirmed",
    description: "Every learner present matches the lesson roster.",
  },
  {
    key: "vehicle",
    title: "Vehicle checked",
    description: "The assigned vehicle is safe and ready for training.",
  },
  {
    key: "brief",
    title: "Lesson brief reviewed",
    description: "Package focus and learner objectives are clear.",
  },
];

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function formatRemaining(totalSeconds: number) {
  const boundedSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(boundedSeconds / 60);
  const seconds = boundedSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDeadline(value?: string | null) {
  if (!value) return "the scheduled end time";
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function InstructorSessionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const getLessonContext = useInstructorOperationsStore(
    (state) => state.getLessonContext,
  );
  const context = getLessonContext(lessonId);
  const session = useTrainingSessionStore(
    (state) => state.sessions[context?.lesson.sessionId ?? ""],
  );
  const activeSessionId = useTrainingSessionStore(
    (state) => state.activeSessionId,
  );
  const lessonStatus = context
    ? toInstructorLessonStatus(session?.status, context.lesson.status)
    : "scheduled";
  const stage: SessionStage =
    lessonStatus === "completed"
      ? "completed"
      : lessonStatus === "in_progress"
        ? "active"
        : lessonStatus === "scheduled"
          ? "ready"
          : "unavailable";
  const [checks, setChecks] = useState<Record<ChecklistKey, boolean>>({
    learner: false,
    vehicle: false,
    brief: false,
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [endConfirmationVisible, setEndConfirmationVisible] = useState(false);
  const [extensionPromptVisible, setExtensionPromptVisible] = useState(false);
  const [dismissedDeadline, setDismissedDeadline] = useState<string | null>(
    null,
  );
  const [isStarting, setIsStarting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [isPreparingLocation, setIsPreparingLocation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const locationSharingEnabled = useSettingsStore(
    (state) => state.instructorLocationSharingEnabled,
  );
  const setLocationSharingEnabled = useSettingsStore(
    (state) => state.setInstructorLocationSharingEnabled,
  );

  useEffect(() => {
    if (stage !== "active") return;

    const startedAt = session?.actualStartTime
      ? Date.parse(session.actualStartTime)
      : null;
    const updateElapsed = () => {
      if (startedAt === null) {
        setElapsedSeconds((current) => current + 1);
        return;
      }
      setElapsedSeconds(
        Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      );
    };

    if (startedAt !== null) updateElapsed();
    const timer = setInterval(updateElapsed, 1000);

    return () => clearInterval(timer);
  }, [session?.actualStartTime, stage]);

  useEffect(() => {
    if (stage !== "active" || !session?.activeUntil) {
      return;
    }

    const deadline = Date.parse(session.activeUntil);
    if (!Number.isFinite(deadline)) return;

    const updateRemaining = () => {
      const nextRemaining = Math.ceil((deadline - Date.now()) / 1000);
      setRemainingSeconds(nextRemaining);
      if (
        nextRemaining <= 5 * 60 &&
        nextRemaining > -60 &&
        dismissedDeadline !== session.activeUntil
      ) {
        setExtensionPromptVisible(true);
      }
    };

    updateRemaining();
    const timer = setInterval(updateRemaining, 1000);
    return () => clearInterval(timer);
  }, [dismissedDeadline, session?.activeUntil, stage]);

  useEffect(() => {
    if (stage !== "active") return;

    const refresh = () => {
      void refreshInstructorOperations().catch(() => {
        // The local timer remains useful while a transient refresh fails.
      });
    };
    const timer = setInterval(refresh, 10_000);
    return () => clearInterval(timer);
  }, [stage]);

  if (!context) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Conduct lesson" />
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-remove-outline"
            title="Lesson not found"
            description="This lesson is not available in the current instructor schedule."
          />
        </View>
      </DashboardScreen>
    );
  }

  const { lesson, day } = context;
  const completedElapsedSeconds = (() => {
    if (!session?.actualStartTime || !session.actualEndTime) return 0;
    const startedAt = Date.parse(session.actualStartTime);
    const endedAt = Date.parse(session.actualEndTime);
    const deadline = session.activeUntil
      ? Date.parse(session.activeUntil)
      : endedAt;
    if (![startedAt, endedAt, deadline].every(Number.isFinite)) return 0;
    return Math.max(
      0,
      Math.floor((Math.min(endedAt, deadline) - startedAt) / 1000),
    );
  })();
  const anotherSessionIsActive =
    activeSessionId !== null && activeSessionId !== lesson.sessionId;
  const canStart =
    checklistItems.every((item) => checks[item.key]) &&
    locationSharingEnabled &&
    !anotherSessionIsActive;
  const toggleCheck = (key: ChecklistKey) =>
    setChecks((current) => ({ ...current, [key]: !current[key] }));
  const prepareLiveTracking = () => {
    Alert.alert(
      "Enable live lesson tracking",
      "Learn2Drive will share the training vehicle’s location only while this lesson is active. Background access keeps the map updating if you leave the app.",
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            setIsPreparingLocation(true);
            setActionError(null);
            void requestInstructorLocationPermissions()
              .then((permission) => {
                if (!permission.servicesEnabled) {
                  setActionError(
                    "Turn on device location services before starting this lesson.",
                  );
                  return;
                }
                if (!permission.foregroundGranted) {
                  setActionError(
                    "Location access is required for live lesson tracking.",
                  );
                  return;
                }
                setLocationSharingEnabled(true);
                setLocationNotice(
                  permission.backgroundGranted
                    ? "Live tracking is ready, including while the app is in the background."
                    : "Live tracking is ready while Learn2Drive remains open. Enable Always allow in device settings for background tracking.",
                );
              })
              .catch(() => {
                setActionError(
                  "Location access could not be prepared. Check device settings and try again.",
                );
              })
              .finally(() => setIsPreparingLocation(false));
          },
        },
      ],
    );
  };
  const extendSession = () => {
    setActionError(null);
    setIsExtending(true);
    void extendInstructorTrainingSession(lesson.sessionId)
      .then(() => refreshInstructorOperations())
      .then(() => {
        setDismissedDeadline(session?.activeUntil ?? null);
        setExtensionPromptVisible(false);
      })
      .catch((caught) => {
        const error = caught as ApiError | Error;
        setActionError(
          error.message || "We could not extend this lesson. Please try again.",
        );
      })
      .finally(() => setIsExtending(false));
  };

  if (stage === "unavailable") {
    const missed = lessonStatus === "missed";
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Lesson unavailable" />
        <View className="mt-8">
          <ContentEmptyState
            icon={missed ? "calendar-alert" : "calendar-remove-outline"}
            title={missed ? "Lesson time has passed" : "Lesson cancelled"}
            description={
              missed
                ? "This lesson was not started before its scheduled end time and is now recorded as missed."
                : "This lesson has been cancelled and can no longer be started."
            }
            actionLabel="Back to schedule"
            onActionPress={() => router.replace("/instructor/schedule")}
          />
        </View>
      </DashboardScreen>
    );
  }

  if (stage === "completed") {
    return (
      <DashboardScreen>
        <DashboardPageHeader
          title={
            session?.endedAutomatically
              ? "Lesson automatically ended"
              : "Lesson completed"
          }
        />
        <View className="items-center pt-10">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.successSoft }}
          >
            <View
              className="h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons
                name="check"
                size={34}
                color={colors.contrastText}
              />
            </View>
          </View>
          <Text
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
            className="mt-7 text-center font-figtree-bold text-[28px]"
            style={{ color: colors.text }}
          >
            {session?.endedAutomatically
              ? "Scheduled time completed"
              : "Session ended safely"}
          </Text>
          <Text
            className="mt-3 max-w-[310px] text-center font-figtree text-[14px] leading-6"
            style={{ color: colors.textMuted }}
          >
            {session?.endedAutomatically
              ? "The lesson reached its time limit and was closed automatically. Record attendance for each learner next."
              : "This driving lesson is complete. Record attendance for each learner next."}
          </Text>

          <View
            className="mt-8 w-full rounded-3xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <SessionSummary lessonName={lesson.learnerName} />
            <View
              className="my-4 h-px"
              style={{ backgroundColor: colors.border }}
            />
            <View className="flex-row items-center justify-between">
              <Text
                className="font-figtree text-[12px]"
                style={{ color: colors.textMuted }}
              >
                Recorded duration
              </Text>
              <Text
                className="font-figtree-bold text-[16px]"
                style={{ color: colors.text }}
              >
                {completedElapsedSeconds > 0
                  ? formatElapsed(completedElapsedSeconds)
                  : lesson.duration}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace({
              pathname: "/instructor/sessions/[lessonId]/report",
              params: { lessonId: lesson.id },
            })
          }
          className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.onPrimary }}
          >
            Record attendance
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/instructor/schedule")}
          className="mt-3 h-14 items-center justify-center rounded-full border active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="font-figtree-bold text-[14px]"
            style={{ color: colors.text }}
          >
            Back to schedule
          </Text>
        </Pressable>
      </DashboardScreen>
    );
  }

  return (
    <>
      <DashboardScreen>
        <DashboardPageHeader
          title={stage === "active" ? "Lesson in progress" : "Start lesson"}
        />

        <View
          className="mt-7 overflow-hidden rounded-[28px] p-6"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor:
                    stage === "active" ? colors.success : colors.primary,
                }}
              />
              <Text
                className="font-figtree-bold text-[10px] uppercase tracking-[1.2px]"
                style={{
                  color: stage === "active" ? colors.success : colors.primary,
                }}
              >
                {stage === "active" ? "Session active" : "Ready to begin"}
              </Text>
            </View>
            <Text
              className="font-figtree text-[11px]"
              style={{ color: colors.contrastMuted }}
            >
              {day.fullLabel}
            </Text>
          </View>

          {stage === "active" ? (
            <View className="items-center py-8">
              <Text
                accessible
                accessibilityLabel={`Elapsed time ${formatElapsed(elapsedSeconds)}`}
                className="font-figtree-bold text-[48px] tracking-[-1.5px]"
                style={{ color: colors.contrastText }}
              >
                {formatElapsed(elapsedSeconds)}
              </Text>
              <Text
                className="mt-2 font-figtree text-[11px] uppercase tracking-[1px]"
                style={{ color: colors.contrastMuted }}
              >
                Elapsed time
              </Text>
              {remainingSeconds !== null && session?.activeUntil ? (
                <View
                  className="mt-5 rounded-full px-4 py-2"
                  style={{
                    backgroundColor:
                      remainingSeconds >= 0
                        ? colors.contrastBorder
                        : colors.error,
                  }}
                >
                  <Text
                    accessibilityLiveRegion="polite"
                    className="font-figtree-bold text-[12px]"
                    style={{ color: colors.contrastText }}
                  >
                    {remainingSeconds >= 0
                      ? `${formatRemaining(remainingSeconds)} remaining`
                      : `Auto-ending in ${formatRemaining(60 + remainingSeconds)}`}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View className="py-6">
              <Text
                className="font-figtree-bold text-[38px] tracking-[-1px]"
                style={{ color: colors.contrastText }}
              >
                {lesson.time}
              </Text>
              <Text
                className="mt-2 font-figtree text-[13px]"
                style={{ color: colors.contrastMuted }}
              >
                Scheduled for {lesson.duration}
              </Text>
            </View>
          )}

          <View
            className="flex-row items-center border-t pt-5"
            style={{ borderTopColor: colors.contrastBorder }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.onPrimary }}
              >
                {lesson.learnerInitials}
              </Text>
            </View>
            <View className="ml-3 flex-1">
              <Text
                className="font-figtree-bold text-[17px]"
                style={{ color: colors.contrastText }}
              >
                {lesson.learnerName}
              </Text>
              <Text
                className="mt-1 font-figtree text-[12px]"
                style={{ color: colors.contrastMuted }}
              >
                {lesson.packageName}
              </Text>
            </View>
          </View>
        </View>

        {stage === "ready" ? (
          <>
            <View className="mt-9">
              <SectionHeader title="Pre-lesson checks" />
              <Text
                className="mt-2 font-figtree text-[13px] leading-5"
                style={{ color: colors.textMuted }}
              >
                Complete all checks before starting the session.
              </Text>
              <View className="mt-4 gap-3">
                {checklistItems.map((item) => {
                  const checked = checks[item.key];

                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked }}
                      onPress={() => toggleCheck(item.key)}
                      className="flex-row items-center rounded-3xl border p-4 active:opacity-75"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: checked ? colors.success : colors.border,
                      }}
                    >
                      <View
                        className="h-11 w-11 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: checked
                            ? colors.successSoft
                            : colors.surfaceStrong,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={
                            checked
                              ? "check-circle"
                              : "checkbox-blank-circle-outline"
                          }
                          size={22}
                          color={checked ? colors.success : colors.textSubtle}
                        />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className="font-figtree-bold text-[14px]"
                          style={{ color: colors.text }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="mt-1 font-figtree text-[11px] leading-4"
                          style={{ color: colors.textMuted }}
                        >
                          {item.description}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    disabled: isPreparingLocation,
                  }}
                  disabled={isPreparingLocation}
                  onPress={prepareLiveTracking}
                  className="flex-row items-center rounded-3xl border p-4 active:opacity-75"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: locationSharingEnabled
                      ? colors.success
                      : colors.border,
                  }}
                >
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: locationSharingEnabled
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={
                        locationSharingEnabled
                          ? "map-marker-check"
                          : "map-marker-radius-outline"
                      }
                      size={22}
                      color={
                        locationSharingEnabled
                          ? colors.success
                          : colors.textSubtle
                      }
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="font-figtree-bold text-[14px]"
                      style={{ color: colors.text }}
                    >
                      Live location ready
                    </Text>
                    <Text
                      className="mt-1 font-figtree text-[11px] leading-4"
                      style={{ color: colors.textMuted }}
                    >
                      {isPreparingLocation
                        ? "Preparing location access…"
                        : locationSharingEnabled
                          ? (locationNotice ??
                            "Location will be shared only during the active lesson.")
                          : "Tap to allow location sharing for this lesson."}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {anotherSessionIsActive ? (
              <View
                className="mt-5 flex-row items-start gap-3 rounded-2xl p-4"
                style={{ backgroundColor: colors.verifiedSoft }}
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={colors.verified}
                />
                <Text
                  className="flex-1 font-figtree-medium text-[12px] leading-5"
                  style={{ color: colors.verified }}
                >
                  Finish your active lesson before starting another one.
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canStart || isStarting }}
              accessibilityHint={
                canStart
                  ? "Starts the lesson timer"
                  : anotherSessionIsActive
                    ? "Finish the active lesson before starting another"
                    : "Complete all pre-lesson checks before starting"
              }
              disabled={!canStart || isStarting}
              onPress={() => {
                void (async () => {
                  setActionError(null);
                  setIsStarting(true);
                  try {
                    const permission =
                      await Location.getForegroundPermissionsAsync();
                    if (!permission.granted) {
                      setLocationSharingEnabled(false);
                      throw new Error(
                        "Location access is required for live lesson tracking.",
                      );
                    }
                    await startInstructorTrainingSession(lesson.sessionId);
                    await refreshInstructorOperations();
                    setElapsedSeconds(0);
                  } catch (caught) {
                    const error = caught as ApiError | Error;
                    setActionError(
                      error.message ||
                        "We could not start this lesson. Please try again.",
                    );
                  } finally {
                    setIsStarting(false);
                  }
                })();
              }}
              className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
              style={{
                backgroundColor: canStart
                  ? colors.primary
                  : colors.surfaceStrong,
              }}
            >
              <MaterialCommunityIcons
                name="play"
                size={21}
                color={canStart ? colors.onPrimary : colors.textSubtle}
              />
              <Text
                className="font-figtree-bold text-[15px]"
                style={{
                  color: canStart ? colors.onPrimary : colors.textSubtle,
                }}
              >
                {isStarting ? "Starting…" : "Start lesson"}
              </Text>
            </Pressable>
            {actionError ? (
              <Text
                className="mt-3 text-center font-figtree-medium text-[12px]"
                style={{ color: colors.error }}
              >
                {actionError}
              </Text>
            ) : null}
          </>
        ) : (
          <>
            <View className="mt-9">
              <SectionHeader title="Session details" />
              <View
                className="mt-4 rounded-3xl border p-5"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <SessionSummary lessonName={lesson.learnerName} />
                <View
                  className="my-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={21}
                    color={colors.primary}
                  />
                  <View className="flex-1">
                    <Text
                      className="font-figtree-bold text-[13px]"
                      style={{ color: colors.text }}
                    >
                      {lesson.location}
                    </Text>
                    <Text
                      className="mt-1 font-figtree text-[11px]"
                      style={{ color: colors.textMuted }}
                    >
                      {lesson.transmission} training vehicle
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              className="mt-6 flex-row items-start gap-3 rounded-2xl p-4"
              style={{ backgroundColor: colors.verifiedSoft }}
            >
              <MaterialCommunityIcons
                name="shield-account-outline"
                size={20}
                color={colors.verified}
              />
              <Text
                className="flex-1 font-figtree-medium text-[12px] leading-5"
                style={{ color: colors.verified }}
              >
                Live location will be shared only with learners booked into this
                active session.
              </Text>
            </View>

            <View
              className="mt-3 flex-row items-start gap-3 rounded-2xl p-4"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="timer-outline"
                size={20}
                color={colors.primary}
              />
              <Text
                className="flex-1 font-figtree-medium text-[12px] leading-5"
                style={{ color: colors.textMuted }}
              >
                Timed until {formatDeadline(session?.activeUntil)}. You’ll be
                asked before it ends; without an extension, the lesson closes
                automatically after a one-minute grace period.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setEndConfirmationVisible(true)}
              className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.error,
              }}
            >
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={21}
                color={colors.error}
              />
              <Text
                className="font-figtree-bold text-[15px]"
                style={{ color: colors.error }}
              >
                End lesson
              </Text>
            </Pressable>
          </>
        )}
      </DashboardScreen>

      <Modal
        animationType="fade"
        onRequestClose={() => setEndConfirmationVisible(false)}
        statusBarTranslucent
        transparent
        visible={endConfirmationVisible}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close end lesson confirmation"
            onPress={() => setEndConfirmationVisible(false)}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(4, 19, 32, 0.58)" },
            ]}
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-[32px] px-6 pt-3"
            style={{
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View
              className="h-1 w-12 self-center rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <View
              className="mt-6 h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="stop-circle-outline"
                size={28}
                color={colors.error}
              />
            </View>
            <Text
              accessibilityRole="header"
              className="mt-5 font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              End this lesson?
            </Text>
            <Text
              className="mt-2 font-figtree text-[13px] leading-5"
              style={{ color: colors.textMuted }}
            >
              This stops the session timer. You’ll record each learner’s
              attendance immediately afterward.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setEndConfirmationVisible(false);
                router.push({
                  pathname: "/instructor/sessions/[lessonId]/report",
                  params: { lessonId: lesson.id },
                });
              }}
              className="mt-6 h-14 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: colors.error }}
            >
              <Text
                className="font-figtree-bold text-[15px]"
                style={{ color: colors.contrastText }}
              >
                End lesson
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setEndConfirmationVisible(false)}
              className="mt-3 h-14 items-center justify-center rounded-full border active:opacity-70"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-figtree-bold text-[14px]"
                style={{ color: colors.text }}
              >
                Continue lesson
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          setDismissedDeadline(session?.activeUntil ?? null);
          setExtensionPromptVisible(false);
        }}
        statusBarTranslucent
        transparent
        visible={extensionPromptVisible && stage === "active"}
      >
        <View className="flex-1 justify-end">
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(4, 19, 32, 0.58)" },
            ]}
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-[32px] px-6 pt-3"
            style={{
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View
              className="h-1 w-12 self-center rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <View
              className="mt-6 h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="timer-plus-outline"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text
              accessibilityRole="header"
              className="mt-5 font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Keep this lesson running?
            </Text>
            <Text
              className="mt-2 font-figtree text-[13px] leading-5"
              style={{ color: colors.textMuted }}
            >
              The current lesson time ends at{" "}
              {formatDeadline(session?.activeUntil)}. Add 15 minutes now, or it
              will close automatically after the one-minute grace period.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isExtending }}
              disabled={isExtending}
              onPress={extendSession}
              className="mt-6 h-14 items-center justify-center rounded-full active:opacity-80"
              style={{
                backgroundColor: isExtending
                  ? colors.surfaceStrong
                  : colors.primary,
              }}
            >
              <Text
                className="font-figtree-bold text-[15px]"
                style={{
                  color: isExtending ? colors.textSubtle : colors.onPrimary,
                }}
              >
                {isExtending ? "Extending…" : "Add 15 minutes"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setDismissedDeadline(session?.activeUntil ?? null);
                setExtensionPromptVisible(false);
              }}
              className="mt-3 h-14 items-center justify-center rounded-full border active:opacity-70"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text
                className="font-figtree-bold text-[14px]"
                style={{ color: colors.text }}
              >
                Finish on time
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function SessionSummary({ lessonName }: { lessonName: string }) {
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-3">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name="account-outline"
          size={20}
          color={colors.primary}
        />
      </View>
      <View className="flex-1">
        <Text
          className="font-figtree text-[11px]"
          style={{ color: colors.textMuted }}
        >
          Learners
        </Text>
        <Text
          className="mt-1 font-figtree-bold text-[14px]"
          style={{ color: colors.text }}
        >
          {lessonName}
        </Text>
      </View>
    </View>
  );
}
