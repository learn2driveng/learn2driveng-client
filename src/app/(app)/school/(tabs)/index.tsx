import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { HeroSurface, useSurfaceStyles } from "@/components/common/surface";
import { SchoolAvatar } from "@/components/school/school-avatar";
import {
  DashboardScreen,
  QuickAction,
  SectionHeader,
  StatCard,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

function formatPolicy(policy: string) {
  if (policy === "learner_preference") return "Learner preference";
  if (policy === "school_assigned") return "School assigned";
  return "Learner selected";
}

function formatSchedule(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SchoolDashboardScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const profile = useSchoolOperationsStore((state) => state.profile);
  const activeInstructors = instructors.filter(
    (item) => item.status === "active",
  );
  const pendingInstructors = instructors.filter(
    (item) => item.status !== "active",
  );
  const bookings = useSchoolOperationsStore((state) => state.bookings);
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const packages = useSchoolOperationsStore((state) => state.packages);
  const unassignedBookings = bookings.filter(
    (booking) => booking.status === "unassigned",
  );
  const activeVehicles = vehicles.filter((vehicle) => vehicle.isActive);
  const maintenanceVehicles = vehicles.filter((vehicle) => !vehicle.isActive);
  const activePackages = packages.filter((item) => item.isActive);
  const upcomingBookings = [...bookings]
    .sort(
      (left, right) =>
        new Date(left.scheduledAt).getTime() -
        new Date(right.scheduledAt).getTime(),
    )
    .slice(0, 2);

  return (
    <DashboardScreen>
      <AppLogo height={52} className="mb-6" />
      <View className="flex-row items-center gap-3">
        <SchoolAvatar name={profile.name} logoUrl={profile.logoUrl} size={52} />
        <View className="flex-1">
          <Text
            className="text-[13px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            Welcome back, {profile.adminName}
          </Text>
          <Text
            accessibilityRole="header"
            className="mt-1 text-[25px] leading-7 tracking-[-0.7px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {profile.name}
          </Text>
        </View>
      </View>
      <Text
        className="mt-4 text-[13px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
      >
        Manage school-owned instructors, fleet, packages, and lesson operations
        from one place.
      </Text>

      <HeroSurface className="mt-7 overflow-hidden rounded-[28px] p-5">
        <View className="flex-row items-center justify-between gap-4">
          <View>
            <Text
              className="text-[12px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Needs attention
            </Text>
            <Text
              className="mt-1 text-[30px] leading-9"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {unassignedBookings.length + pendingInstructors.length}
            </Text>
          </View>
          <View
            className="flex-row items-center gap-2 rounded-full px-3 py-2"
            style={{ backgroundColor: colors.contrastBorder }}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={16}
              color={colors.primary}
            />
            <Text
              className="text-[11px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              FRSC verified
            </Text>
          </View>
        </View>
        <Text
          className="mt-3 text-[12px] leading-5"
          style={{
            color: colors.contrastMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          {unassignedBookings.length} lessons need assignment ·{" "}
          {pendingInstructors.length} instructors need review
        </Text>
      </HeroSurface>

      <View className="mt-7 flex-row gap-3">
        <StatCard
          icon="account-tie"
          label="Active instructors"
          value={String(activeInstructors.length)}
          style={surfaces.card}
        />
        <StatCard
          icon="calendar-check"
          label="Upcoming lessons"
          value={String(bookings.length)}
          style={surfaces.card}
        />
      </View>

      <View className="mt-3 flex-row gap-3">
        <StatCard
          icon="car-hatchback"
          label="Active vehicles"
          value={String(activeVehicles.length)}
          style={surfaces.card}
        />
        <StatCard
          icon="package-variant"
          label="Live packages"
          value={String(activePackages.length)}
          style={surfaces.card}
        />
      </View>

      <View className="mt-8">
        <SectionHeader title="Needs attention" />
        <View className="mt-4 gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/school/bookings")}
            className="flex-row items-center gap-4 rounded-3xl border p-4 active:opacity-80"
            style={{
              backgroundColor: colors.verifiedSoft,
              borderColor: colors.verified,
              ...surfaces.floating,
            }}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surface }}
            >
              <MaterialCommunityIcons
                name="calendar-alert"
                size={22}
                color={colors.verified}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[14px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {unassignedBookings.length} lessons need assignment
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                Match instructors and vehicles before lesson time
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.verified}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/school/instructors")}
            className="flex-row items-center gap-4 rounded-3xl border p-4 active:opacity-80"
            style={surfaces.card}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="account-clock-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[14px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {pendingInstructors.length} instructors need review
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {maintenanceVehicles.length} vehicle
                {maintenanceVehicles.length === 1 ? "" : "s"} in maintenance
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={colors.textSubtle}
            />
          </Pressable>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader
          title="Upcoming lessons"
          actionLabel="View all"
          onActionPress={() => router.push("/school/bookings")}
        />
        <View className="mt-4 gap-3">
          {upcomingBookings.map((booking) => (
            <Pressable
              key={booking.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/school/bookings/[bookingId]",
                  params: { bookingId: booking.id },
                })
              }
              className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
              style={surfaces.card}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceStrong }}
              >
                <Text
                  className="text-[12px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {booking.learnerInitials}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {booking.learnerName}
                </Text>
                <Text
                  className="mt-1 text-[11px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {formatSchedule(booking.scheduledAt)} · {booking.transmission}
                </Text>
              </View>
              <Text
                className="text-[10px] capitalize"
                style={{
                  color:
                    booking.status === "confirmed"
                      ? colors.success
                      : colors.verified,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {booking.status}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Quick actions" />
        <View className="mt-4 flex-row gap-3">
          <QuickAction
            icon="account-plus"
            label="Invite instructor"
            onPress={() => router.push("/school/instructors/invite")}
            style={surfaces.card}
          />
          <QuickAction
            icon="car-hatchback"
            label="Fleet"
            onPress={() => router.push("/school/operations/vehicles")}
            style={surfaces.card}
          />
        </View>
        <View className="mt-3 flex-row gap-3">
          <QuickAction
            icon="package-variant"
            label="Packages"
            onPress={() => router.push("/school/operations/packages")}
            style={surfaces.card}
          />
          <QuickAction
            icon="account-school-outline"
            label="Learners"
            onPress={() => router.push("/school/learners")}
            style={surfaces.card}
          />
        </View>
      </View>

      <Text
        className="mt-8 text-center text-[11px]"
        style={{
          color: colors.textSubtle,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Assignment policy · {formatPolicy(profile.assignmentPolicy)}
      </Text>
    </DashboardScreen>
  );
}
