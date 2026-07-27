import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { UserRole } from "@/types";

type LoginRole = Exclude<UserRole, "admin">;

type AuthRoleSelectProps = {
  value: LoginRole;
  onChange: (role: LoginRole) => void;
};

const roles: {
  value: LoginRole;
  label: string;
  description: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  available: boolean;
}[] = [
  {
    value: "learner",
    label: "Learner",
    description: "Book lessons and track your training",
    icon: "account-outline",
    available: true,
  },
  {
    value: "instructor",
    label: "Instructor",
    description: "Manage assigned lessons and availability",
    icon: "account-tie-outline",
    available: true,
  },
  {
    value: "guardian",
    label: "Guardian",
    description: "Follow a linked learner’s progress",
    icon: "account-child-outline",
    available: true,
  },
  {
    value: "driving_school",
    label: "School",
    description: "Manage instructors, packages and bookings",
    icon: "school-outline",
    available: true,
  },
];

export function AuthRoleSelect({ value, onChange }: AuthRoleSelectProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const selectedRole = roles.find((role) => role.value === value) ?? roles[0];

  const selectRole = (role: LoginRole) => {
    onChange(role);
    setOpen(false);
  };

  return (
    <View>
      <Text
        className="mb-3 ml-1 font-figtree-bold text-[12px] tracking-[1.7px]"
        style={{ color: colors.text }}
      >
        SIGN IN AS
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sign in as ${selectedRole.label}`}
        accessibilityHint="Opens account type options"
        onPress={() => setOpen(true)}
        className="h-16 flex-row items-center rounded-full border px-4 active:opacity-75"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: borderRadius.button,
          overflow: "hidden",
        }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name={selectedRole.icon}
            size={21}
            color={colors.text}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="font-figtree-bold text-[15px]"
            style={{ color: colors.text }}
          >
            {selectedRole.label}
          </Text>
          <Text
            numberOfLines={1}
            className="mt-0.5 font-figtree text-[11px]"
            style={{ color: colors.textMuted }}
          >
            {selectedRole.description}
          </Text>
        </View>
        {!selectedRole.available ? (
          <View
            className="mr-2 rounded-full px-2 py-1"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <Text
              className="font-figtree-bold text-[8px] uppercase tracking-[0.7px]"
              style={{ color: colors.textSubtle }}
            >
              Soon
            </Text>
          </View>
        ) : null}
        <MaterialCommunityIcons
          name="chevron-down"
          size={22}
          color={colors.textSubtle}
        />
      </Pressable>

      <Modal
        animationType="fade"
        onRequestClose={() => setOpen(false)}
        statusBarTranslucent
        transparent
        visible={open}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close account type options"
            onPress={() => setOpen(false)}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(4, 19, 32, 0.58)" },
            ]}
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-[32px] px-6 pt-3"
            style={{
              backgroundColor: colors.background,
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View
              className="h-1 w-12 self-center rounded-full"
              style={{ backgroundColor: colors.border }}
            />
            <Text
              accessibilityRole="header"
              className="mt-6 font-figtree-bold text-[24px]"
              style={{ color: colors.text }}
            >
              Choose account type
            </Text>
            <Text
              className="mt-1 font-figtree text-[13px]"
              style={{ color: colors.textMuted }}
            >
              Select the dashboard you want to access.
            </Text>

            <View className="mt-5 gap-2">
              {roles.map((role) => {
                const selected = role.value === value;

                return (
                  <Pressable
                    key={role.value}
                    accessibilityRole="radio"
                    accessibilityLabel={`${role.label}. ${role.description}${role.available ? "" : ". Dashboard coming soon"}`}
                    accessibilityState={{ selected }}
                    onPress={() => selectRole(role.value)}
                    className="flex-row items-center rounded-2xl border p-4 active:opacity-75"
                    style={{
                      backgroundColor: selected
                        ? colors.surfaceStrong
                        : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    }}
                  >
                    <View
                      className="h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: selected
                          ? colors.primary
                          : colors.surfaceStrong,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={role.icon}
                        size={22}
                        color={selected ? colors.onPrimary : colors.text}
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text
                          className="font-figtree-bold text-[15px]"
                          style={{ color: colors.text }}
                        >
                          {role.label}
                        </Text>
                        {!role.available ? (
                          <Text
                            className="font-figtree-bold text-[8px] uppercase tracking-[0.7px]"
                            style={{ color: colors.textSubtle }}
                          >
                            Coming soon
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        className="mt-1 font-figtree text-[11px]"
                        style={{ color: colors.textMuted }}
                      >
                        {role.description}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={selected ? "check-circle" : "circle-outline"}
                      size={22}
                      color={selected ? colors.primary : colors.textSubtle}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
