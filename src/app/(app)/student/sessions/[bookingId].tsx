import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useLearnerSessionsStore } from "@/store/learner-sessions.store";

export default function BookingDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const booking = useLearnerSessionsStore((state) =>
    state.lessonCards.find((item) => item.id === bookingId),
  );

  if (!booking) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Booking details" />
        <View
          className="mt-10 items-center rounded-3xl border px-6 py-12"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-remove-outline"
            size={36}
            color={colors.textSubtle}
          />
          <Text
            className="mt-4 text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Booking not found
          </Text>
        </View>
      </DashboardScreen>
    );
  }

  const status = booking.status;
  const statusColor =
    status === "scheduled"
      ? colors.verified
      : status === "completed" || status === "in_progress"
        ? colors.success
        : colors.error;
  const statusBackground =
    status === "scheduled"
      ? colors.verifiedSoft
      : status === "completed" || status === "in_progress"
        ? colors.successSoft
        : colors.surfaceStrong;
  const details = [
    ["Driving school", booking.school],
    ["Package", booking.packageName],
    ["Instructor", booking.instructor],
    ["Location", booking.location],
    ["Booking reference", booking.reference ?? booking.id],
  ];

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Booking details" />

      <View
        className="mt-7 rounded-3xl p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Driving lesson
            </Text>
            <Text
              className="mt-3 text-[24px] leading-7"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {booking.date}
            </Text>
            <Text
              className="mt-2 text-[14px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              {booking.time}
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-1.5"
            style={{ backgroundColor: statusBackground }}
          >
            <Text
              className="text-[9px] uppercase tracking-[0.8px]"
              style={{ color: statusColor, fontFamily: fontFamily.figtreeBold }}
            >
              {status.replace("_", " ")}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="mt-5 overflow-hidden rounded-3xl border px-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        {details.map(([label, value], index) => (
          <View
            key={label}
            className="flex-row items-start justify-between gap-5 py-4"
            style={
              index
                ? { borderTopWidth: 1, borderTopColor: colors.border }
                : undefined
            }
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
              className="max-w-[62%] text-right text-[12px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>

      {status === "in_progress" ? (
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: "/student/sessions/[bookingId]/live-location",
              params: { bookingId: booking.id },
            })
          }
          className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="map-marker-radius"
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
            Manage live location
          </Text>
        </Pressable>
      ) : null}

      {status === "scheduled" ? (
        <View
          className="mt-7 rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[14px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Need to change this lesson?
          </Text>
          <Text
            className="mt-2 text-[12px] leading-5"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            Contact your driving school to reschedule or cancel this booking.
            Self-service changes will be added in a later update.
          </Text>
        </View>
      ) : null}
    </DashboardScreen>
  );
}
