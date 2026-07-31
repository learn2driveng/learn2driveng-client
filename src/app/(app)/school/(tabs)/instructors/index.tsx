import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { useSurfaceStyles } from "@/components/common/surface";
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
  pending: { label: "Profile pending", icon: "account-clock-outline" },
  active: { label: "Active", icon: "check-circle-outline" },
  suspended: { label: "Suspended", icon: "account-cancel-outline" },
};

export default function SchoolInstructorsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const instructors = useSchoolOperationsStore((state) => state.instructors);

  return (
    <DashboardScreen>
      <AppLogo height={52} className="mb-6" />
      <DashboardPageHeader title="Instructors" showBack={false} />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Instructors are school-affiliated. Invite, review, activate, or suspend
        them before assigning learner bookings.
      </Text>

      <View className="mt-7 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/school/instructors/invite")}
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={20}
            color={colors.onPrimary}
          />
          <Text
            className="text-[14px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Invite instructor
          </Text>
        </Pressable>
      </View>

      <View className="mt-8">
        <SectionHeader title={`Roster · ${instructors.length}`} />
        <View className="mt-4 gap-4">
          {instructors.map((instructor) => {
            const meta = statusMeta[instructor.status];
            const active = instructor.status === "active";

            return (
              <Pressable
                key={instructor.id}
                accessibilityRole="button"
                accessibilityLabel={`View ${instructor.name}`}
                onPress={() =>
                  router.push({
                    pathname: "/school/instructors/[instructorId]",
                    params: { instructorId: instructor.id },
                  })
                }
                className="rounded-3xl border p-4"
                style={surfaces.card}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {instructor.initials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {instructor.name}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {instructor.assignedLocation}
                    </Text>
                  </View>
                  <View
                    className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: active
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon}
                      size={14}
                      color={active ? colors.success : colors.textMuted}
                    />
                    <Text
                      className="text-[10px]"
                      style={{
                        color: active ? colors.success : colors.textMuted,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {meta.label}
                    </Text>
                  </View>
                </View>

                <View
                  className="my-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />

                <View className="flex-row">
                  {[
                    [
                      (instructor.lessonsThisWeek ?? 0).toString(),
                      "Lessons this week",
                    ],
                    [
                      instructor.allowedTransmissions?.join(" / ") ?? "Not set",
                      "Vehicles",
                    ],
                  ].map(([value, label], index) => (
                    <View
                      key={label}
                      className="flex-1"
                      style={
                        index
                          ? {
                              borderLeftWidth: 1,
                              borderLeftColor: colors.border,
                              paddingLeft: 14,
                            }
                          : { paddingRight: 14 }
                      }
                    >
                      <Text
                        className="text-[13px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {value}
                      </Text>
                      <Text
                        className="mt-1 text-[10px] uppercase tracking-[0.6px]"
                        style={{
                          color: colors.textSubtle,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </DashboardScreen>
  );
}
