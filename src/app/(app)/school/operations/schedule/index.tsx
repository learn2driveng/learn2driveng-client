import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useSurfaceStyles } from "@/components/common/surface";
import { DashboardPageHeader, DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchSchoolTrainingSessions } from "@/lib/api/training-sessions";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { TrainingSession } from "@/types";

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function SchoolLessonScheduleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setSessions(await fetchSchoolTrainingSessions());
    } catch {
      setError("We could not load your lesson schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const upcoming = sessions.filter((item) => item.status === "scheduled");

  return <DashboardScreen>
    <DashboardPageHeader title="Lesson schedule" />
    <View className="mt-6 p-5" style={{ backgroundColor: colors.contrastSurface, borderRadius: 30 }}>
      <Text className="text-[11px] uppercase tracking-[1.3px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeBold }}>Training calendar</Text>
      <View className="mt-3 flex-row items-end justify-between gap-4"><View><Text className="text-[30px]" style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}>{upcoming.length}</Text><Text className="mt-1 text-[12px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}>upcoming lesson{upcoming.length === 1 ? "" : "s"}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/school/operations/schedule/new")} className="h-12 flex-row items-center gap-2 rounded-2xl px-4 active:opacity-80" style={{ backgroundColor: colors.primary }}><MaterialCommunityIcons name="plus" size={20} color={colors.onPrimary} /><Text className="text-[13px]" style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}>Timetable</Text></Pressable></View>
      <Pressable accessibilityRole="button" onPress={() => router.push("/school/operations/schedule/timetables")} className="mt-4 flex-row items-center gap-2 self-start" hitSlop={8}><MaterialCommunityIcons name="calendar" size={17} color={colors.contrastMuted} /><Text className="text-[12px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeBold }}>Manage timetables</Text></Pressable>
    </View>
    <View className="mt-8">
      <SectionHeader title="Your lesson calendar" />
      {loading ? <View className="mt-8 items-center"><ActivityIndicator color={colors.primary} /></View> : error ? <Text className="mt-4 text-[13px]" style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}>{error}</Text> : sessions.length === 0 ? <View className="mt-4"><ContentEmptyState icon="calendar-blank-outline" title="No lessons scheduled" description="Create a timetable to generate lesson slots." /></View> : <View className="mt-4 gap-3">
        {sessions.sort((a, b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime()).map((session) => {
          const instructor = instructors.find((item) => item.id === session.instructorId);
          return <Pressable key={session.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/school/operations/schedule/[sessionId]", params: { sessionId: session.id } })} className="rounded-3xl border p-4 active:opacity-80" style={surfaces.card}>
            <View className="flex-row items-center gap-3"><View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.verifiedSoft }}><Text className="text-[11px] uppercase" style={{ color: colors.verified, fontFamily: fontFamily.figtreeBold }}>{new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short" }).format(new Date(session.scheduledStartTime))}</Text></View><View className="flex-1"><View className="flex-row items-center justify-between gap-2"><Text className="flex-1 text-[15px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>{session.title}</Text><MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSubtle} /></View><Text className="mt-1 text-[12px]" style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>{formatWhen(session.scheduledStartTime)}</Text><Text className="mt-1 text-[11px]" style={{ color: colors.textSubtle, fontFamily: fontFamily.figtree }}>{instructor?.name ?? "Assigned instructor"} · {session.participantCount}/{session.capacity} booked</Text></View></View>
          </Pressable>;
        })}
      </View>}
    </View>
  </DashboardScreen>;
}
