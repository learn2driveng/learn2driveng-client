import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { LearnerBooking } from "@/types";

type BookingCardProps = {
  booking: LearnerBooking;
  onPress: () => void;
};

export function BookingCard({ booking, onPress }: BookingCardProps) {
  const { colors } = useAppTheme();
  const statusColor =
    booking.status === "upcoming"
      ? colors.verified
      : booking.status === "completed"
        ? colors.success
        : colors.error;
  const statusBackground =
    booking.status === "upcoming"
      ? colors.verifiedSoft
      : booking.status === "completed"
        ? colors.successSoft
        : colors.surfaceStrong;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.status} booking. ${booking.date} at ${booking.time}. ${booking.school}. ${booking.packageName}.`}
      accessibilityHint="Opens booking details"
      onPress={onPress}
      className="rounded-3xl border p-5 active:opacity-75"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <View
            className="self-start rounded-full px-3 py-1.5"
            style={{ backgroundColor: statusBackground }}
          >
            <Text
              className="text-[9px] uppercase tracking-[0.8px]"
              style={{ color: statusColor, fontFamily: fontFamily.figtreeBold }}
            >
              {booking.status}
            </Text>
          </View>
          <Text
            className="mt-4 text-[17px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {booking.date}
          </Text>
          <Text
            className="mt-1 text-[13px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            {booking.time} · {booking.instructor}
          </Text>
        </View>
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.text}
          />
        </View>
      </View>
      <View className="mt-4 h-px" style={{ backgroundColor: colors.border }} />
      <Text
        numberOfLines={1}
        className="mt-4 text-[12px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        {booking.school} · {booking.packageName}
      </Text>
    </Pressable>
  );
}
