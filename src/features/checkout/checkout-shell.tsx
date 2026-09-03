import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type CheckoutShellProps = PropsWithChildren<{
  title: string;
  step: number;
  onBack: () => void;
  onExit: () => void;
}>;

export function CheckoutShell({
  title,
  step,
  onBack,
  onExit,
  children,
}: CheckoutShellProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-row items-center px-5 py-3">
        <View className="w-[76px] items-start">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            className="h-10 w-10 items-center justify-center rounded-full border active:opacity-70"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={21}
              color={colors.text}
            />
          </Pressable>
        </View>
        <View className="flex-1 items-center px-2">
          <Text
            className="text-center text-[16px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {title}
          </Text>
          <Text
            className="mt-0.5 text-[9px] uppercase tracking-[0.8px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Step {step} of 2
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit checkout and go to dashboard"
          onPress={onExit}
          className="h-10 w-[76px] flex-row items-center justify-end gap-1 active:opacity-70"
        >
          <MaterialCommunityIcons
            name="home-variant-outline"
            size={16}
            color={colors.primary}
          />
          <Text
            className="text-[12px]"
            style={{
              color: colors.primary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Home
          </Text>
        </Pressable>
      </View>
      <View
        className="mx-5 h-1 overflow-hidden rounded-full"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <View
          className="h-full rounded-full"
          style={{
            backgroundColor: colors.primary,
            width: step === 1 ? "50%" : "100%",
          }}
        />
      </View>
      {children}
    </View>
  );
}
