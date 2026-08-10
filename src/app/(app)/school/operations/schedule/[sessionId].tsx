import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { useSurfaceStyles } from "@/components/common/surface";
import { useToast } from "@/components/common/toast";
import { DashboardPageHeader, DashboardScreen, SectionHeader } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { cancelSchoolTrainingSession, fetchSchoolTrainingSession } from "@/lib/api/training-sessions";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, TrainingSession } from "@/types";

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function InstructorAvatar({ name, initials, photoUrl }: { name: string; initials: string; photoUrl?: string | null }) {
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(Boolean(photoUrl));
  const [failed, setFailed] = useState(false);
  return (
    <View
      accessibilityLabel={`${name} photograph`}
      className="items-center justify-center overflow-hidden rounded-full"
      style={{ width: 58, height: 58, backgroundColor: colors.surfaceStrong }}
    >
      {!photoUrl || failed ? (
        <Text className="text-[15px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>
          {initials || "IN"}
        </Text>
      ) : (
        <Image
          source={{ uri: photoUrl }}
          className="h-full w-full"
          resizeMode="cover"
          onLoadEnd={() => setLoading(false)}
          onError={() => { setFailed(true); setLoading(false); }}
        />
      )}
      {loading && !failed ? (
        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: colors.surfaceStrong }}>
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : null}
    </View>
  );
}

export default function SchoolLessonDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const { showToast } = useToast();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const packages = useSchoolOperationsStore((state) => state.packages);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!sessionId) return;
    setError(null);
    try {
      setSession(await fetchSchoolTrainingSession(sessionId));
    } catch (caught) {
      setError((caught as ApiError).message || "We could not load this lesson.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const cancel = () => {
    if (!session || cancelling) return;
    Alert.alert("Cancel lesson", "Existing learner bookings will be cancelled for this lesson.", [
      { text: "Keep lesson", style: "cancel" },
      {
        text: "Cancel lesson",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            setSession(await cancelSchoolTrainingSession(session.id));
            showToast("Lesson cancelled.");
          } catch (caught) {
            setError((caught as ApiError).message || "We could not cancel this lesson.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) return <DashboardScreen><DashboardPageHeader title="Lesson" /><View className="mt-10 items-center"><ActivityIndicator color={colors.primary} /></View></DashboardScreen>;
  if (!session) return <DashboardScreen><DashboardPageHeader title="Lesson" /><View className="mt-8"><ContentEmptyState icon="calendar-remove-outline" title="Lesson not found" description={error ?? "This lesson is no longer available."} /></View></DashboardScreen>;

  const instructor = instructors.find((item) => item.id === session.instructorId);
  const vehicle = vehicles.find((item) => item.id === session.vehicleId);
  const lessonPackages = packages.filter((item) => session.eligiblePackageIds.includes(item.id));
  const seatsLeft = Math.max(0, session.capacity - session.participantCount);
  const fillPercentage = session.capacity ? Math.min(100, (session.participantCount / session.capacity) * 100) : 0;

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Lesson details" />

      <View className="mt-7 p-5" style={{ backgroundColor: colors.contrastSurface, borderRadius: 28 }}>
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center" style={{ backgroundColor: colors.primary, borderRadius: 16 }}>
            <MaterialCommunityIcons name={session.sessionType === "practical" ? "car" : "book-open-variant"} size={24} color={colors.onPrimary} />
          </View>
          <View className="flex-1">
            <View className="flex-row items-start justify-between gap-3">
              <Text className="flex-1 text-[20px]" style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}>
                {session.title}
              </Text>
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: session.status === "cancelled" ? "rgba(239,68,68,0.18)" : "rgba(52,211,153,0.16)" }}>
                <Text className="text-[9px] uppercase" style={{ color: session.status === "cancelled" ? colors.error : colors.success, fontFamily: fontFamily.figtreeBold }}>
                  {session.status.replace("_", " ")}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-[12px] capitalize" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}>
              {session.sessionType.replace("_", " ")}
            </Text>
          </View>
        </View>
        <Text className="mt-5 text-[13px] leading-5" style={{ color: colors.contrastText, fontFamily: fontFamily.figtreeBold }}>
          {formatWhen(session.scheduledStartTime)}
        </Text>
        <Text className="mt-1 text-[11px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}>
          Ends {new Intl.DateTimeFormat("en-NG", { hour: "numeric", minute: "2-digit" }).format(new Date(session.scheduledEndTime))}
        </Text>
        <View className="mt-5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: colors.contrastSurfaceStrong }}>
          <View className="h-full rounded-full" style={{ width: `${fillPercentage}%`, backgroundColor: seatsLeft ? colors.primary : colors.error }} />
        </View>
        <View className="mt-2 flex-row justify-between">
          <Text className="text-[10px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}>{session.participantCount} booked</Text>
          <Text className="text-[10px]" style={{ color: colors.contrastMuted, fontFamily: fontFamily.figtreeMedium }}>{seatsLeft} seat{seatsLeft === 1 ? "" : "s"} left</Text>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Instructor" />
        <Pressable
          disabled={!instructor}
          onPress={() => instructor && router.push({ pathname: "/school/instructors/[instructorId]", params: { instructorId: instructor.id } })}
          className="mt-4 flex-row items-center gap-4 border active:opacity-80"
          style={[surfaces.card, { borderRadius: 24, padding: 16 }]}
        >
          <InstructorAvatar name={instructor?.name ?? "Instructor"} initials={instructor?.initials ?? "IN"} photoUrl={instructor?.profilePhoto} />
          <View className="flex-1">
            <Text className="text-[15px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>
              {instructor?.name ?? "Instructor assigned"}
            </Text>
            <Text className="mt-1 text-[11px]" style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>
              {instructor?.email ?? "View assigned instructor"}
            </Text>
          </View>
          {instructor ? <MaterialCommunityIcons name="chevron-right" size={21} color={colors.textSubtle} /> : null}
        </Pressable>
      </View>

      <View className="mt-8">
        <SectionHeader title="Lesson setup" />
        <View className="mt-4 overflow-hidden border" style={[surfaces.card, { borderRadius: 24 }]}>
          {session.vehicleId ? (
            <View className="flex-row items-center gap-3 p-4">
              <View className="h-11 w-11 items-center justify-center overflow-hidden" style={{ backgroundColor: colors.surfaceStrong, borderRadius: 15 }}>
                {vehicle?.photoUrl ? <Image source={{ uri: vehicle.photoUrl }} className="h-full w-full" resizeMode="cover" /> : <MaterialCommunityIcons name="car" size={21} color={colors.primary} />}
              </View>
              <View className="flex-1">
                <Text className="text-[11px] uppercase tracking-[1px]" style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}>Training car</Text>
                <Text className="mt-1 text-[14px]" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>{vehicle ? `${vehicle.name} · ${vehicle.plateNumber}` : "Vehicle assigned"}</Text>
              </View>
            </View>
          ) : null}
          <View className="p-4" style={session.vehicleId ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined}>
            <Text className="text-[11px] uppercase tracking-[1px]" style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}>Packages</Text>
            <Text className="mt-2 text-[14px] leading-5" style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}>
              {lessonPackages.map((item) => item.name).join(" · ") || "Selected packages"}
            </Text>
          </View>
        </View>
      </View>

      {session.notes ? <View className="mt-8"><SectionHeader title="Notes" /><Text className="mt-3 text-[13px] leading-5" style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>{session.notes}</Text></View> : null}
      {error ? <Text className="mt-6 text-[13px]" style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}>{error}</Text> : null}

      {session.status === "scheduled" ? (
        <View className="mt-8">
          <SectionHeader title="Lesson actions" />
          <Pressable
            disabled={cancelling}
            onPress={cancel}
            className="mt-3 flex-row items-center gap-3 active:opacity-75"
            style={{ minHeight: 60, paddingHorizontal: 16, backgroundColor: colors.surfaceMuted, borderRadius: 18 }}
          >
            <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
              <MaterialCommunityIcons name="calendar-remove-outline" size={19} color={colors.error} />
            </View>
            <View className="flex-1">
              <Text className="text-[13px]" style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}>
                {cancelling ? "Cancelling…" : "Cancel lesson"}
              </Text>
              <Text className="mt-0.5 text-[10px]" style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>
                Existing learner bookings will be affected
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSubtle} />
          </Pressable>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
