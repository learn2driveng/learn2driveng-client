import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

function formatSchedule(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SchoolBookingAssignmentDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useSchoolOperationsStore((state) =>
    state.bookings.find((item) => item.id === bookingId),
  );
  const instructors = useSchoolOperationsStore((state) => state.instructors);
  const vehicles = useSchoolOperationsStore((state) => state.vehicles);
  const assignBooking = useSchoolOperationsStore(
    (state) => state.assignBooking,
  );
  const confirmBookingAssignment = useSchoolOperationsStore(
    (state) => state.confirmBookingAssignment,
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(() => booking?.instructorId ?? null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    () => booking?.vehicleId ?? null,
  );

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Assignment" />
        <View className="mt-8">
          <ContentEmptyState
            icon="calendar-remove-outline"
            title="Booking not found"
            description="This lesson is not available in the school assignment queue."
          />
        </View>
      </DashboardScreen>
    );
  }

  const eligibleInstructors = instructors.filter(
    (instructor) =>
      instructor.status === "active" &&
      instructor.allowedTransmissions?.includes(booking.transmission),
  );
  const eligibleVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.isActive && vehicle.transmissionType === booking.transmission,
  );
  const hasSelection =
    selectedInstructorId !== null && selectedVehicleId !== null;
  const selectionChanged =
    selectedInstructorId !== booking.instructorId ||
    selectedVehicleId !== booking.vehicleId;
  const isCancelled = booking.status === "cancelled";

  const saveAssignment = () => {
    if (!selectedInstructorId || !selectedVehicleId) return;
    assignBooking(booking.id, selectedInstructorId, selectedVehicleId);
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Assign lesson" />

      <View
        className="mt-7 rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-center gap-4">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[14px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {booking.learnerInitials}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              className="text-[20px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {booking.learnerName}
            </Text>
            <Text
              className="mt-1 text-[12px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {booking.packageName} · Lesson {booking.lessonNumber} of{" "}
              {booking.totalLessons}
            </Text>
          </View>
        </View>

        <View className="mt-5 gap-2">
          <Text
            className="text-[12px]"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {formatSchedule(booking.scheduledAt)}
          </Text>
          <Text
            className="text-[12px]"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {booking.location} · {booking.transmission}
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Eligible instructor" />
        {booking.instructorPreferenceId ? (
          <Text
            className="mt-2 text-[11px] leading-4"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            The learner’s preference is marked below. The school still makes the
            final assignment.
          </Text>
        ) : null}
        <View className="mt-4 gap-3">
          {eligibleInstructors.map((instructor) => {
            const selected = instructor.id === selectedInstructorId;
            const preferred = instructor.id === booking.instructorPreferenceId;
            return (
              <Pressable
                key={instructor.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                disabled={isCancelled}
                onPress={() => setSelectedInstructorId(instructor.id)}
                className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
                style={{
                  backgroundColor: selected
                    ? colors.verifiedSoft
                    : colors.surface,
                  borderColor: selected ? colors.verified : colors.border,
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <Text
                    className="text-[12px]"
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
                    className="text-[14px]"
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
                    {instructor.lessonsThisWeek} lessons this week
                    {preferred ? " · Preferred" : ""}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={22}
                  color={selected ? colors.verified : colors.textSubtle}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Eligible vehicle" />
        <View className="mt-4 gap-3">
          {eligibleVehicles.map((vehicle) => {
            const selected = vehicle.id === selectedVehicleId;
            return (
              <Pressable
                key={vehicle.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                disabled={isCancelled}
                onPress={() => setSelectedVehicleId(vehicle.id)}
                className="flex-row items-center gap-3 rounded-3xl border p-4 active:opacity-80"
                style={{
                  backgroundColor: selected
                    ? colors.verifiedSoft
                    : colors.surface,
                  borderColor: selected ? colors.verified : colors.border,
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="car-hatchback"
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
                    {vehicle.name}
                  </Text>
                  <Text
                    className="mt-1 text-[11px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtreeMedium,
                    }}
                  >
                    {vehicle.plateNumber} · {vehicle.lessonsThisWeek} lessons
                    this week
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={22}
                  color={selected ? colors.verified : colors.textSubtle}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-8 gap-3">
        {!isCancelled ? (
          <View className="flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/school/bookings/[bookingId]/reschedule",
                  params: { bookingId: booking.id },
                })
              }
              className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-full border active:opacity-80"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-edit"
                size={19}
                color={colors.text}
              />
              <Text
                className="text-[13px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Reschedule
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/school/bookings/[bookingId]/cancel",
                  params: { bookingId: booking.id },
                })
              }
              className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-full border active:opacity-80"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.error,
              }}
            >
              <MaterialCommunityIcons
                name="calendar-remove"
                size={19}
                color={colors.error}
              />
              <Text
                className="text-[13px]"
                style={{
                  color: colors.error,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        ) : null}

        {isCancelled ? (
          <View
            className="rounded-3xl border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.error,
            }}
          >
            <Text
              className="text-[13px]"
              style={{
                color: colors.error,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Lesson cancelled
            </Text>
            <Text
              className="mt-2 text-[12px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {booking.cancellationReason}
            </Text>
          </View>
        ) : null}

        {!isCancelled && booking.status !== "confirmed" && selectionChanged ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasSelection }}
            disabled={!hasSelection}
            onPress={saveAssignment}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{
              backgroundColor: hasSelection
                ? colors.primary
                : colors.surfaceStrong,
              opacity: hasSelection ? 1 : 0.65,
            }}
          >
            <MaterialCommunityIcons
              name="account-check-outline"
              size={20}
              color={hasSelection ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="text-[15px]"
              style={{
                color: hasSelection ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Save assignment
            </Text>
          </Pressable>
        ) : null}

        {!isCancelled && booking.status === "assigned" && !selectionChanged ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => confirmBookingAssignment(booking.id)}
            className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="calendar-check"
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
              Confirm lesson
            </Text>
          </Pressable>
        ) : null}

        {booking.status === "confirmed" ? (
          <View
            className="flex-row items-center justify-center gap-2 rounded-3xl border p-4"
            style={{
              backgroundColor: colors.successSoft,
              borderColor: colors.success,
            }}
          >
            <MaterialCommunityIcons
              name="check-decagram"
              size={20}
              color={colors.success}
            />
            <Text
              className="text-[13px]"
              style={{
                color: colors.success,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Lesson assignment confirmed
            </Text>
          </View>
        ) : null}
      </View>
    </DashboardScreen>
  );
}
