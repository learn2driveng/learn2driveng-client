import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { useAppTheme } from "@/hooks/use-app-theme";

type PackageCreditCardProps = {
  name: string;
  schoolName: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  totalSessions: number;
  remainingSessions: number;
  status: "active" | "expired" | "completed" | "cancelled" | "pending";
  onBookPress?: () => void;
  onViewPress: () => void;
};

export function PackageCreditCard({
  name,
  schoolName,
  icon,
  totalSessions,
  remainingSessions,
  status,
  onBookPress,
  onViewPress,
}: PackageCreditCardProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const canBook = Boolean(
    status === "active" && remainingSessions > 0 && onBookPress,
  );
  const statusLabel =
    status === "active"
      ? remainingSessions > 0
        ? "Ready to book"
        : "All lessons booked"
      : status === "pending"
        ? "Payment pending"
        : status === "completed"
          ? "Completed"
          : status === "cancelled"
            ? "Cancelled"
            : "Expired";
  const creditsLabel =
    status === "completed"
      ? `${totalSessions} lessons completed`
      : status === "pending"
        ? `${totalSessions} lessons included`
        : status === "expired" || status === "cancelled"
          ? `${remainingSessions} of ${totalSessions} lessons unused`
          : status === "active" && remainingSessions === 0
            ? `${totalSessions} of ${totalSessions} lessons scheduled`
            : `${remainingSessions} of ${totalSessions} lessons available`;

  return (
    <View className="rounded-3xl border p-5" style={surfaces.card}>
      <View className="flex-row items-center gap-3">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={23}
            color={colors.primary}
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-figtree-bold text-[16px]"
            style={{ color: colors.text }}
          >
            {name}
          </Text>
          <Text
            className="mt-1 font-figtree text-[12px]"
            style={{ color: colors.textMuted }}
          >
            {schoolName}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <Text
            className="font-figtree-bold text-[11px]"
            style={{
              color:
                status === "completed"
                  ? colors.success
                  : status === "expired" || status === "cancelled"
                    ? colors.error
                    : colors.text,
            }}
          >
            {statusLabel}
          </Text>
        </View>
        <Text
          className="font-figtree-medium text-[12px]"
          style={{ color: colors.textMuted }}
        >
          {creditsLabel}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${canBook ? "Book a lesson from" : "View"} ${name}`}
        onPress={canBook ? onBookPress : onViewPress}
        className="mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-full active:opacity-75"
        style={{
          backgroundColor: canBook ? colors.primary : colors.surfaceStrong,
        }}
      >
        <MaterialCommunityIcons
          name={canBook ? "calendar-plus" : "arrow-right"}
          size={18}
          color={canBook ? colors.onPrimary : colors.text}
        />
        <Text
          className="font-figtree-bold text-[13px]"
          style={{ color: canBook ? colors.onPrimary : colors.text }}
        >
          {canBook ? "Book a lesson" : "View package"}
        </Text>
      </Pressable>
    </View>
  );
}
