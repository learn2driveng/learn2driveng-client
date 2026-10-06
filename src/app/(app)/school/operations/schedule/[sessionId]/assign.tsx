import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { useToast } from "@/components/common/toast";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchSchoolLearners } from "@/lib/api/bookings";
import {
  assignLearnerToSchoolTrainingSession,
  fetchSchoolTrainingSession,
  fetchSchoolTrainingSessionParticipants,
} from "@/lib/api/training-sessions";
import type { ApiError, SchoolLearnerListItem, TrainingSession, TrainingSessionParticipant } from "@/types";

export default function AssignLearnerToLessonScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [learners, setLearners] = useState<SchoolLearnerListItem[]>([]);
  const [participants, setParticipants] = useState<TrainingSessionParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const [lesson, roster, assigned] = await Promise.all([
        fetchSchoolTrainingSession(sessionId),
        fetchSchoolLearners(),
        fetchSchoolTrainingSessionParticipants(sessionId),
      ]);
      setSession(lesson);
      setLearners(roster);
      setParticipants(assigned);
    } catch (cause) {
      setError((cause as ApiError).message || "Could not load eligible learners.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const eligible = learners.filter((learner) =>
    learner.status === "active" &&
    learner.bookingId &&
    learner.packageId &&
    session?.eligiblePackageIds.includes(learner.packageId) &&
    (learner.sessionsScheduledCount ?? learner.totalLessons) < learner.totalLessons &&
    !participants.some((participant) => participant.learnerId === learner.id),
  );

  const assign = async (learner: SchoolLearnerListItem) => {
    if (!session || !learner.bookingId || assigningId) return;
    setAssigningId(learner.id);
    setError(null);
    try {
      const participant = await assignLearnerToSchoolTrainingSession(session.id, learner.bookingId);
      setParticipants((current) => [...current, participant]);
      showToast(`${learner.name} assigned to this lesson.`);
      router.replace({ pathname: "/school/operations/schedule/[sessionId]", params: { sessionId: session.id } });
    } catch (cause) {
      setError((cause as ApiError).message || "Could not assign this learner.");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Add learner" />
      {loading ? <ActivityIndicator className="mt-8" color={colors.primary} /> : !session ? (
        <Pressable onPress={() => void load()} className="mt-6 rounded-2xl p-4" style={{ backgroundColor: colors.surface }}>
          <Text style={{ color: colors.error }}>{error ?? "Lesson unavailable."} Tap to retry.</Text>
        </Pressable>
      ) : (
        <>
          <Text className="mt-5 text-[17px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>{session.title}</Text>
          <Text className="mt-2 text-[12px] leading-5" style={{ color: colors.textMuted }}>
            Select a learner with an active eligible package and a remaining lesson credit.
          </Text>
          {eligible.length ? eligible.map((learner) => (
            <Pressable
              key={learner.id}
              accessibilityRole="button"
              accessibilityState={{ disabled: assigningId !== null }}
              disabled={assigningId !== null}
              onPress={() => void assign(learner)}
              className="mt-3 flex-row items-center justify-between rounded-3xl border p-4 active:opacity-75"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <View className="flex-1">
                <Text className="text-[14px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>{learner.name}</Text>
                <Text className="mt-1 text-[11px]" style={{ color: colors.textMuted }}>{learner.packageName} · {learner.totalLessons - (learner.sessionsScheduledCount ?? 0)} credits left</Text>
              </View>
              {assigningId === learner.id ? <ActivityIndicator color={colors.primary} /> : <Text style={{ color: colors.primary, fontFamily: fontFamily.figtreeBold }}>Assign</Text>}
            </Pressable>
          )) : (
            <Text className="mt-8 text-[13px]" style={{ color: colors.textMuted }}>No eligible learners are available for this lesson.</Text>
          )}
          {error ? <Text className="mt-5 text-[12px]" style={{ color: colors.error }}>{error}</Text> : null}
        </>
      )}
    </DashboardScreen>
  );
}
