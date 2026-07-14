import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { useAppTheme } from "@/hooks/use-app-theme";

type PackageCreditCardProps = {
  name: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  totalSessions: number;
  remainingSessions: number;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  status?: "active" | "expired";
  expiresOn?: string;
  actionLabel?: string;
};

export function PackageCreditCard({
  name,
  icon,
  totalSessions,
  remainingSessions,
  onPress,
  selected,
  disabled = false,
  status = "active",
  expiresOn,
  actionLabel,
}: PackageCreditCardProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const isSelectable = selected !== undefined;
  const isExpired = status === "expired";
  const accessibilityDescription = isExpired
    ? `${name}. Expired${expiresOn ? ` on ${expiresOn}` : ""}. ${remainingSessions} unused sessions.`
    : `${name}. ${remainingSessions} of ${totalSessions} sessions remaining.`;
  const remainingPercentage =
    `${totalSessions > 0 ? Math.round((remainingSessions / totalSessions) * 100) : 0}%` as const;

  return (
    <Pressable
      accessibilityRole={isSelectable ? "radio" : "button"}
      accessibilityLabel={accessibilityDescription}
      accessibilityHint={
        disabled
          ? undefined
          : actionLabel
            ? `${actionLabel} this package`
            : isSelectable
              ? "Selects this package for booking"
              : "Opens package details"
      }
      accessibilityState={{
        selected: isSelectable ? selected : undefined,
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      className="rounded-3xl border-2 p-5 active:opacity-70"
      style={{
        ...surfaces.card,
        borderColor: selected ? colors.primary : colors.border,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={icon}
            size={25}
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
          {isExpired ? (
            <View
              className="mt-2 self-start rounded-full px-2.5 py-1"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <Text
                className="font-figtree-bold text-[10px] uppercase tracking-[0.8px]"
                style={{ color: colors.error }}
              >
                Expired
              </Text>
            </View>
          ) : null}
          <Text
            className={`${isExpired ? "mt-2" : "mt-1"} font-figtree text-[12px]`}
            style={{ color: colors.textMuted }}
          >
            {isExpired
              ? `Expired${expiresOn ? ` on ${expiresOn}` : ""} · ${remainingSessions} unused`
              : `${remainingSessions} of ${totalSessions} sessions remaining`}
          </Text>
        </View>
        {actionLabel ? (
          <Text
            className="font-figtree-bold text-[12px]"
            style={{ color: colors.primary }}
          >
            {actionLabel}
          </Text>
        ) : (
          <MaterialCommunityIcons
            name={
              isSelectable
                ? selected
                  ? "check-circle"
                  : disabled
                    ? "minus-circle-outline"
                    : "circle-outline"
                : "chevron-right"
            }
            size={23}
            color={selected ? colors.primary : colors.textSubtle}
          />
        )}
      </View>
      <View
        className="mt-4 h-1.5 overflow-hidden rounded-full"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <View
          className="h-full rounded-full"
          style={{
            width: remainingPercentage,
            backgroundColor: isExpired ? colors.textFaint : colors.primary,
          }}
        />
      </View>
    </Pressable>
  );
}
