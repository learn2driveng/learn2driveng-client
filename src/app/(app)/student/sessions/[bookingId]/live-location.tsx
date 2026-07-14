import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getInstructorLessonContextBySessionId } from "@/sample_data/instructor";
import { studentProfile } from "@/sample_data/student";
import { useGuardianAccessStore } from "@/store/guardian-access.store";
import { useTrainingSessionStore } from "@/store/training-session.store";

export default function LearnerLiveLocationScreen() {
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const session = useTrainingSessionStore((state) =>
    Object.values(state.sessions).find((item) => item.bookingId === bookingId),
  );
  const locationShare = useTrainingSessionStore((state) =>
    session ? state.locationShares[session.id] : undefined,
  );
  const requestLocationSharing = useTrainingSessionStore(
    (state) => state.requestLocationSharing,
  );
  const stopLocationSharing = useTrainingSessionStore(
    (state) => state.stopLocationSharing,
  );
  const guardianLinks = useGuardianAccessStore((state) => state.guardianLinks);
  const availableGuardianLinks = guardianLinks.filter(
    (link) => link.learnerId === studentProfile.id && link.status === "active",
  );
  const [selectedGuardianLinkIds, setSelectedGuardianLinkIds] = useState(() =>
    availableGuardianLinks.map((link) => link.id),
  );
  const lessonContext = getInstructorLessonContextBySessionId(session?.id);

  if (!session || !lessonContext) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon="map-marker-question-outline"
            title="Session not found"
            description="This training session is not available for location sharing."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (session.learnerId !== studentProfile.id) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon="shield-lock-outline"
            title="Session unavailable"
            description="Only the learner assigned to this session can control location sharing."
          />
        </View>
      </DashboardScreen>
    );
  }

  if (session.status !== "active") {
    const ended = session.status === "completed";
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Live location" />
        <View className="mt-8">
          <ContentEmptyState
            icon={ended ? "map-marker-check-outline" : "calendar-clock-outline"}
            title={ended ? "Sharing has ended" : "Lesson is not active"}
            description={
              ended
                ? "Location sharing stops automatically when the instructor ends the lesson."
                : "Location sharing becomes available after your instructor starts this lesson."
            }
          />
        </View>
      </DashboardScreen>
    );
  }

  const { lesson, day } = lessonContext;
  const sharingStatus = locationShare?.status ?? "inactive";
  const isRequesting = sharingStatus === "requesting_permission";
  const isSharing = sharingStatus === "sharing";
  const canChooseRecipients = !isRequesting && !isSharing;
  const canStartSharing =
    !isRequesting &&
    selectedGuardianLinkIds.length > 0 &&
    availableGuardianLinks.length > 0;
  const toggleGuardian = (guardianLinkId: string) => {
    if (!canChooseRecipients) return;
    setSelectedGuardianLinkIds((current) =>
      current.includes(guardianLinkId)
        ? current.filter((id) => id !== guardianLinkId)
        : [...current, guardianLinkId],
    );
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Live location" />

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-6"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center gap-2">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: colors.success }}
          />
          <Text
            className="font-figtree-bold text-[10px] uppercase tracking-[1px]"
            style={{ color: colors.success }}
          >
            Lesson in progress
          </Text>
        </View>
        <Text
          className="mt-5 font-figtree-bold text-[24px]"
          style={{ color: colors.contrastText }}
        >
          {lesson.packageName}
        </Text>
        <Text
          className="mt-2 font-figtree text-[13px]"
          style={{ color: colors.contrastMuted }}
        >
          {day.fullLabel} · {lesson.time}
        </Text>
        <View
          className="mt-5 flex-row items-center gap-3 border-t pt-5"
          style={{ borderTopColor: colors.contrastBorder }}
        >
          <MaterialCommunityIcons
            name="account-tie-outline"
            size={20}
            color={colors.primary}
          />
          <Text
            className="flex-1 font-figtree-medium text-[12px]"
            style={{ color: colors.contrastMuted }}
          >
            Instructor John · {lesson.location}
          </Text>
        </View>
      </View>

      {isSharing ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-7 rounded-[28px] border p-5"
          style={{
            backgroundColor: colors.successSoft,
            borderColor: colors.success,
          }}
        >
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.success }}
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={25}
                color={colors.contrastText}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-figtree-bold text-[17px]"
                style={{ color: colors.text }}
              >
                Live location is sharing
              </Text>
              <Text
                className="mt-1 font-figtree text-[12px]"
                style={{ color: colors.textMuted }}
              >
                {locationShare?.guardianLinkIds.length ?? 0}{" "}
                {(locationShare?.guardianLinkIds.length ?? 0) === 1
                  ? "guardian"
                  : "guardians"}{" "}
                can view this active session.
              </Text>
            </View>
          </View>

          <View
            className="mt-5 flex-row items-center justify-between rounded-2xl px-4 py-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Text
              className="font-figtree text-[12px]"
              style={{ color: colors.textMuted }}
            >
              Location accuracy
            </Text>
            <Text
              className="font-figtree-bold text-[12px]"
              style={{ color: colors.text }}
            >
              {locationShare?.lastLocation?.accuracy
                ? `±${Math.round(locationShare.lastLocation.accuracy)} m`
                : "Updating"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => stopLocationSharing(session.id)}
            className="mt-5 h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.error,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-off-outline"
              size={20}
              color={colors.error}
            />
            <Text
              className="font-figtree-bold text-[14px]"
              style={{ color: colors.error }}
            >
              Stop sharing
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View className="mt-9">
            <SectionHeader title="Choose who can view" />
            <Text
              className="mt-2 font-figtree text-[13px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Select the linked guardians who can see your location during this
              active lesson.
            </Text>

            {availableGuardianLinks.length > 0 ? (
              <View className="mt-4 gap-3">
                {availableGuardianLinks.map((link) => {
                  const selected = selectedGuardianLinkIds.includes(link.id);

                  return (
                    <Pressable
                      key={link.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      disabled={!canChooseRecipients}
                      onPress={() => toggleGuardian(link.id)}
                      className="flex-row items-center rounded-3xl border p-4 active:opacity-75"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <View
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: colors.surfaceStrong }}
                      >
                        <Text
                          className="font-figtree-bold text-[13px]"
                          style={{ color: colors.text }}
                        >
                          {link.guardianInitials}
                        </Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text
                          className="font-figtree-bold text-[15px]"
                          style={{ color: colors.text }}
                        >
                          {link.guardianName}
                        </Text>
                        <Text
                          className="mt-1 font-figtree text-[11px]"
                          style={{ color: colors.textMuted }}
                        >
                          Linked guardian
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={
                          selected
                            ? "checkbox-marked-circle"
                            : "checkbox-blank-circle-outline"
                        }
                        size={23}
                        color={selected ? colors.primary : colors.textSubtle}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View className="mt-4">
                <ContentEmptyState
                  icon="account-alert-outline"
                  title="No guardian linked"
                  description="Add a guardian to your account before sharing live location."
                />
              </View>
            )}
          </View>

          <View
            className="mt-7 rounded-3xl border p-5"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            {[
              "Sharing starts only after you approve it",
              "Updates are sent only while Learn2Drive is open",
              "You can stop sharing at any time",
              "Sharing stops automatically when the lesson ends",
            ].map((item, index) => (
              <View
                key={item}
                className={`flex-row items-start gap-3 ${index ? "mt-4" : ""}`}
              >
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={19}
                  color={colors.success}
                />
                <Text
                  className="flex-1 font-figtree-medium text-[12px] leading-5"
                  style={{ color: colors.text }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>

          {sharingStatus === "failed" ? (
            <View
              accessibilityLiveRegion="polite"
              className="mt-5 rounded-2xl p-4"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.error }}
              >
                {locationShare?.failureReason === "permission_denied"
                  ? "Location permission is off"
                  : "Location is currently unavailable"}
              </Text>
              <Text
                className="mt-1 font-figtree text-[12px] leading-5"
                style={{ color: colors.textMuted }}
              >
                {locationShare?.failureReason === "permission_denied"
                  ? "Allow location access in your device settings, then try again."
                  : "Check that location services are enabled, then try again."}
              </Text>
              {locationShare?.failureReason === "permission_denied" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void Linking.openSettings()}
                  className="mt-3 min-h-11 self-start justify-center"
                >
                  <Text
                    className="font-figtree-bold text-[13px]"
                    style={{ color: colors.primary }}
                  >
                    Open settings
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canStartSharing }}
            disabled={!canStartSharing}
            onPress={() =>
              requestLocationSharing(
                session.id,
                studentProfile.id,
                selectedGuardianLinkIds,
              )
            }
            className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: canStartSharing
                ? colors.primary
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-radius-outline"
              size={21}
              color={canStartSharing ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="font-figtree-bold text-[15px]"
              style={{
                color: canStartSharing ? colors.onPrimary : colors.textSubtle,
              }}
            >
              {sharingStatus === "failed"
                ? "Try sharing again"
                : isRequesting
                  ? "Requesting permission"
                  : "Share live location"}
            </Text>
          </Pressable>

          {isRequesting ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => stopLocationSharing(session.id)}
              className="mt-3 h-12 items-center justify-center active:opacity-70"
            >
              <Text
                className="font-figtree-bold text-[13px]"
                style={{ color: colors.textMuted }}
              >
                Cancel request
              </Text>
            </Pressable>
          ) : null}
        </>
      )}
    </DashboardScreen>
  );
}
