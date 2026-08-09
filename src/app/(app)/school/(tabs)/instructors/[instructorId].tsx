import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateSchoolInstructor } from "@/lib/api";
import { instructorUserToRosterItem } from "@/lib/school/map-api";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, SchoolInstructorStatus } from "@/types";

const statusMeta: Record<
  SchoolInstructorStatus,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  invited: { label: "Invited", icon: "email-fast-outline" },
  pending: { label: "Profile pending", icon: "account-clock-outline" },
  active: { label: "Active", icon: "check-circle-outline" },
  suspended: { label: "Suspended", icon: "account-cancel-outline" },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not yet";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function SchoolInstructorDetailScreen() {
  const { colors } = useAppTheme();
  const { instructorId } = useLocalSearchParams<{ instructorId?: string }>();
  const instructor = useSchoolOperationsStore((state) =>
    state.instructors.find((item) => item.id === instructorId),
  );
  const upsertInstructor = useSchoolOperationsStore(
    (state) => state.upsertInstructor,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateStatus = async (status: "active" | "suspended") => {
    if (!instructor || isUpdating) return;

    setUpdateError(null);
    setIsUpdating(true);

    try {
      const updated = await updateSchoolInstructor(instructor.id, { status });
      upsertInstructor(instructorUserToRosterItem(updated));
    } catch (caught) {
      const error = caught as ApiError;
      setUpdateError(error.message || "We could not update this instructor.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!instructor) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Instructor" />
        <View className="mt-8">
          <ContentEmptyState
            icon="account-question-outline"
            title="Instructor not found"
            description="This instructor is not on the school roster."
          />
        </View>
      </DashboardScreen>
    );
  }

  const meta = statusMeta[instructor.status];
  const active = instructor.status === "active";
  const canActivate =
    instructor.status === "pending" || instructor.status === "suspended";
  const canSuspend = instructor.status === "active";
  const canResend = instructor.status === "invited";

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Instructor details" />

      <View
        className="mt-7 rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-16 w-16 items-center justify-center overflow-hidden rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            {instructor.profilePhoto ? (
              <Image source={{ uri: instructor.profilePhoto }} className="h-full w-full" resizeMode="cover" />
            ) : (
            <Text
              className="text-[18px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {instructor.initials}
            </Text>
            )}
          </View>
          <View className="flex-1">
            <Text
              accessibilityRole="header"
              className="text-[23px] leading-7 tracking-[-0.5px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {instructor.name}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <MaterialCommunityIcons
                name={meta.icon}
                size={15}
                color={active ? colors.success : colors.primary}
              />
              <Text
                className="text-[11px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {meta.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Onboarding state" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {[
            ["Invite sent", formatDate(instructor.invitedAt)],
            ["Activated", formatDate(instructor.activatedAt)],
            ["Assigned location", instructor.assignedLocation],
            [
              "Vehicle types",
              instructor.allowedTransmissions?.join(" / ") ?? "Not set",
            ],
            ["Lessons this week", String(instructor.lessonsThisWeek ?? 0)],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-row items-center justify-between gap-4 py-3"
            >
              <Text
                className="text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
              <Text
                className="flex-1 text-right text-[12px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Contact" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {[
            ["Email", instructor.email],
            ["Phone", instructor.phone],
          ].map(([label, value]) => (
            <View
              key={label}
              className="flex-row items-center justify-between gap-4 py-3"
            >
              <Text
                className="text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
              <Text
                className="flex-1 text-right text-[12px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className="mt-8 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="text-[14px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          School assignment control
        </Text>
        <Text
          className="mt-2 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Activating an instructor makes them eligible for school-controlled
          booking assignment. Suspended instructors remain on the roster but
          cannot receive new learner sessions.
        </Text>
      </View>

      <View className="mt-7 gap-3">
        {canActivate ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => updateStatus("active")}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={colors.onPrimary}
            />
            <Text
              className="text-[15px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Activate instructor
            </Text>
          </Pressable>
        ) : null}

        {canResend ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => updateStatus("active")}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="email-fast-outline"
              size={20}
              color={colors.onPrimary}
            />
            <Text
              className="text-[15px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Resend invite
            </Text>
          </Pressable>
        ) : null}

        {canSuspend ? (
          <Pressable
            accessibilityRole="button"
            disabled={isUpdating}
            onPress={() => updateStatus("suspended")}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.error,
            }}
          >
            <MaterialCommunityIcons
              name="account-cancel-outline"
              size={20}
              color={colors.error}
            />
            <Text
              className="text-[15px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Suspend instructor
            </Text>
          </Pressable>
        ) : null}
      </View>
      {isUpdating ? (
        <ActivityIndicator className="mt-4" color={colors.primary} />
      ) : null}
      {updateError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {updateError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
