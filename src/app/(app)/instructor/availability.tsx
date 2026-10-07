import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

import { useToast } from "@/components/common/toast";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { AssignmentToggleCard } from "@/features/instructor/assignment-toggle-card";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchInstructorAvailability, updateInstructorAvailability } from "@/lib/api/instructor-availability";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

export default function InstructorAvailabilityScreen() {
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const profile = useInstructorOperationsStore((state) => state.profile);
  const setAvailableToday = useInstructorOperationsStore((state) => state.setAvailableToday);
  const [acceptingAssignments, setAcceptingAssignments] = useState(profile.availableToday ?? true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const settings = await fetchInstructorAvailability();
      setAcceptingAssignments(settings.acceptingAssignments);
      setAvailableToday(settings.acceptingAssignments);
    } catch {
      setLoadError("We could not load your assignment setting.");
    } finally {
      setLoading(false);
    }
  }, [setAvailableToday]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const changeAcceptingAssignments = async (nextValue: boolean) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setAcceptingAssignments(nextValue);
    try {
      const settings = await updateInstructorAvailability({ acceptingAssignments: nextValue });
      setAcceptingAssignments(settings.acceptingAssignments);
      setAvailableToday(settings.acceptingAssignments);
      showToast(settings.acceptingAssignments
        ? "You are accepting new assignments."
        : "New assignments paused.");
    } catch {
      setAcceptingAssignments(!nextValue);
      showToast("Could not update your assignment setting. Please try again.", "error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Assignments" showBack={false} />
      <Text className="mt-3 font-figtree text-[14px] leading-5" style={{ color: colors.textMuted }}>
        Choose whether your school can assign you new lessons.
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-10" color={colors.primary} />
      ) : loadError ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => void load()}
          className="mt-8 rounded-2xl p-5"
          style={{ backgroundColor: colors.surface }}
        >
          <Text style={{ color: colors.error }}>{loadError} Tap to retry.</Text>
        </Pressable>
      ) : (
        <AssignmentToggleCard
          acceptingAssignments={acceptingAssignments}
          saving={saving}
          onChange={(value) => void changeAcceptingAssignments(value)}
        />
      )}
    </DashboardScreen>
  );
}
