import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { SchoolInstructorStatus } from "@/types";

const statusMeta: Record<
  SchoolInstructorStatus,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  invited: { label: "Invited", icon: "email-fast-outline" },
  profile_pending: { label: "Profile pending", icon: "account-clock-outline" },
  active: { label: "Active", icon: "check-circle-outline" },
  suspended: { label: "Suspended", icon: "account-cancel-outline" },
};

function formatDate(value: string | null) {
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
  const activateInstructor = useSchoolOperationsStore(
    (state) => state.activateInstructor,
  );
  const suspendInstructor = useSchoolOperationsStore(
    (state) => state.suspendInstructor,
  );
  const resendInstructorInvite = useSchoolOperationsStore(
    (state) => state.resendInstructorInvite,
  );

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
    instructor.status === "profile_pending" ||
    instructor.status === "suspended";
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
            className="h-16 w-16 items-center justify-center rounded-3xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[18px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {instructor.initials}
            </Text>
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
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          {[
            ["Invite sent", formatDate(instructor.invitedAt)],
            ["Activated", formatDate(instructor.activatedAt)],
            ["Assigned location", instructor.assignedLocation],
            ["Vehicle types", instructor.allowedTransmissions.join(" / ")],
            ["Lessons this week", String(instructor.lessonsThisWeek)],
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
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
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
            onPress={() => activateInstructor(instructor.id)}
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
            onPress={() => resendInstructorInvite(instructor.id)}
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
            onPress={() => suspendInstructor(instructor.id)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-75"
            style={{ backgroundColor: colors.surface, borderColor: colors.error }}
          >
            <MaterialCommunityIcons
              name="account-cancel-outline"
              size={20}
              color={colors.error}
            />
            <Text
              className="text-[15px]"
              style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
            >
              Suspend instructor
            </Text>
          </Pressable>
        ) : null}
      </View>
    </DashboardScreen>
  );
}
