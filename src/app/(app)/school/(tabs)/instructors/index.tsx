import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { SchoolInstructorStatus } from "@/types";

const statusMeta: Record<
  SchoolInstructorStatus,
  { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  invited: { label: "Invited", icon: "email-fast-outline" },
  pending: { label: "Pending", icon: "account-clock-outline" },
  active: { label: "Active", icon: "check-circle-outline" },
  suspended: { label: "Suspended", icon: "account-cancel-outline" },
};

type RosterFilter = "all" | "active" | "pending" | "suspended";

const filters: { value: RosterFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export default function SchoolInstructorsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RosterFilter>("all");

  const activeCount = instructors.filter(
    (item) => item.status === "active",
  ).length;
  const awaitingCount = instructors.filter(
    (item) => item.status === "invited" || item.status === "pending",
  ).length;

  const visibleInstructors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return instructors.filter((instructor) => {
      const matchesFilter =
        filter === "all" ||
        instructor.status === filter ||
        (filter === "pending" && instructor.status === "invited");
      const matchesQuery =
        !normalizedQuery ||
        `${instructor.name} ${instructor.email} ${instructor.phone} ${instructor.assignedLocation}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, instructors, query]);

  const openInstructor = (instructorId: string) => {
    router.push({
      pathname: "/school/instructors/[instructorId]",
      params: { instructorId },
    });
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Instructors" showBack={false} />

      <HeroSurface
        className="mt-6 overflow-hidden"
        style={{ borderRadius: 30, padding: 20 }}
      >
        <Text
          className="text-[11px] uppercase tracking-[1.3px]"
          style={{
            color: colors.contrastMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Teaching team
        </Text>
        <Text
          className="mt-2 text-[22px]"
          style={{
            color: colors.contrastText,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Your instructor roster
        </Text>

        <View
          className="mt-5 flex-row"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.contrastBorder,
          }}
        >
          {[
            [String(instructors.length), "Total"],
            [String(activeCount), "Active"],
            [String(awaitingCount), "Awaiting setup"],
          ].map(([value, label], index) => (
            <View
              key={label}
              className="flex-1 pt-4"
              style={
                index
                  ? {
                      borderLeftWidth: 1,
                      borderLeftColor: colors.contrastBorder,
                      paddingLeft: 14,
                    }
                  : undefined
              }
            >
              <Text
                className="text-[20px]"
                style={{
                  color: colors.contrastText,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
              <Text
                className="mt-1 text-[10px]"
                style={{
                  color: colors.contrastMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Invite instructor"
          onPress={() => router.push("/school/instructors/invite")}
          className="mt-5 h-12 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{
            backgroundColor: colors.primary,
            borderRadius: borderRadius.button,
          }}
        >
          <MaterialCommunityIcons
            name="account-plus-outline"
            size={19}
            color={colors.onPrimary}
          />
          <Text
            className="text-[13px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Invite instructor
          </Text>
        </Pressable>
      </HeroSurface>

      <View className="mt-8">
        <SectionHeader title={`Roster · ${visibleInstructors.length}`} />

        <View
          className="mt-4 h-13 flex-row items-center border"
          style={{
            paddingHorizontal: 16,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: 18,
          }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textSubtle}
          />
          <TextInput
            accessibilityLabel="Search instructors"
            value={query}
            onChangeText={setQuery}
            placeholder="Search instructors"
            placeholderTextColor={colors.textSubtle}
            className="ml-2 h-full flex-1 text-[14px]"
            style={{
              color: colors.text,
              fontFamily: fontFamily.figtreeMedium,
              paddingHorizontal: 10,
              paddingVertical: 12,
            }}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={10}
              onPress={() => setQuery("")}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          {filters.map((item) => {
            const selected = filter === item.value;
            return (
              <Pressable
                key={item.value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setFilter(item.value)}
                className="h-10 items-center justify-center rounded-full border px-4 active:opacity-75"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: borderRadius.button,
                }}
              >
                <Text
                  className="text-[11px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.textMuted,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {visibleInstructors.length ? (
          <View className="mt-5 gap-4">
            {visibleInstructors.map((instructor) => {
              const meta = statusMeta[instructor.status];
              const active = instructor.status === "active";

              return (
                <Pressable
                  key={instructor.id}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${instructor.name}`}
                  accessibilityHint="Opens the instructor profile"
                  onPress={() => openInstructor(instructor.id)}
                  className="border p-4 active:opacity-80"
                  style={[surfaces.card, { borderRadius: 24 }]}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="h-14 w-14 items-center justify-center overflow-hidden rounded-full"
                      style={{ backgroundColor: colors.surfaceStrong }}
                    >
                      {instructor.profilePhoto ? (
                        <Image
                          source={{ uri: instructor.profilePhoto }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Text
                          className="text-[14px]"
                          style={{
                            color: colors.text,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {instructor.initials}
                        </Text>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className="text-[16px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {instructor.name}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="mt-1 text-[11px]"
                        style={{
                          color: colors.textMuted,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {instructor.email}
                      </Text>
                      <View className="mt-2 flex-row items-center gap-1.5">
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={14}
                          color={colors.textSubtle}
                        />
                        <Text
                          numberOfLines={1}
                          className="flex-1 text-[11px]"
                          style={{
                            color: colors.textSubtle,
                            fontFamily: fontFamily.figtreeMedium,
                          }}
                        >
                          {instructor.assignedLocation || "Location not set"}
                        </Text>
                      </View>
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
                        size={13}
                        color={active ? colors.success : colors.textMuted}
                      />
                      <Text
                        className="text-[9px]"
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
                    className="mt-4 flex-row items-center justify-between gap-3 border-t pt-4"
                    style={{ borderTopColor: colors.border }}
                  >
                    <View className="flex-1">
                      <Text
                        className="text-[12px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {instructor.allowedTransmissions?.join(" / ") ||
                          "Vehicle types not set"}
                      </Text>
                      <Text
                        className="mt-1 text-[10px]"
                        style={{
                          color: colors.textSubtle,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {instructor.lessonsThisWeek ?? 0} lessons this week
                      </Text>
                    </View>

                    <View
                      className="h-10 flex-row items-center justify-center gap-1.5 rounded-full px-4"
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: borderRadius.button,
                      }}
                    >
                      <Text
                        className="text-[11px]"
                        style={{
                          color: colors.onPrimary,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        View profile
                      </Text>
                      <MaterialCommunityIcons
                        name="arrow-right"
                        size={15}
                        color={colors.onPrimary}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View className="mt-5">
            <ContentEmptyState
              icon="account-search-outline"
              title={
                instructors.length
                  ? "No instructors found"
                  : "No instructors yet"
              }
              description={
                instructors.length
                  ? "Try another name or status."
                  : "Invite your first instructor to start building your teaching team."
              }
              actionLabel={instructors.length ? undefined : "Invite instructor"}
              onActionPress={
                instructors.length
                  ? undefined
                  : () => router.push("/school/instructors/invite")
              }
            />
          </View>
        )}
      </View>
    </DashboardScreen>
  );
}
