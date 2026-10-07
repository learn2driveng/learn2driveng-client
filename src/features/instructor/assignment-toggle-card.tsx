import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Switch, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type AssignmentToggleCardProps = {
  acceptingAssignments: boolean;
  saving: boolean;
  onChange: (value: boolean) => void;
};

export function AssignmentToggleCard({ acceptingAssignments, saving, onChange }: AssignmentToggleCardProps) {
  const { colors } = useAppTheme();

  return (
    <>
      <View
        className="mt-7 flex-row items-center rounded-3xl border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: acceptingAssignments ? colors.successSoft : colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={acceptingAssignments ? "calendar-check-outline" : "calendar-remove-outline"}
            size={24}
            color={acceptingAssignments ? colors.success : colors.textSubtle}
          />
        </View>
        <View className="ml-4 flex-1">
          <Text className="font-figtree-bold text-[15px]" style={{ color: colors.text }}>
            Accepting assignments
          </Text>
          <Text className="mt-1 font-figtree text-[12px] leading-4" style={{ color: colors.textMuted }}>
            {acceptingAssignments
              ? "Your school can assign you new lessons."
              : "Your school cannot assign you new lessons."}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Accepting new lesson assignments"
          accessibilityRole="switch"
          disabled={saving}
          onValueChange={onChange}
          thumbColor={colors.surface}
          trackColor={{ false: colors.surfaceStrong, true: colors.success }}
          value={acceptingAssignments}
        />
      </View>

      <View className="mt-5 flex-row gap-3 rounded-2xl p-4" style={{ backgroundColor: colors.surfaceMuted }}>
        <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
        <Text className="flex-1 font-figtree text-[12px] leading-5" style={{ color: colors.textMuted }}>
          Pausing new assignments does not cancel lessons already on your schedule. Contact your school if you cannot attend one.
        </Text>
      </View>
    </>
  );
}
