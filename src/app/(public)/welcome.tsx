import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/common/app-logo";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentEntryChoiceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      className="flex-1 px-6"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top + 24,
        paddingBottom: Math.max(insets.bottom, 24),
      }}
    >
      <AppLogo height={58} />

      <View className="flex-1 justify-center">
        <View
          className="h-20 w-20 items-center justify-center rounded-[24px]"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="steering"
            size={39}
            color={colors.onPrimary}
          />
        </View>
        <Text
          className="mt-8 text-[10px] uppercase tracking-[2px]"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Start your journey
        </Text>
        <Text
          accessibilityRole="header"
          className="mt-2 max-w-[340px] text-[31px] leading-9 tracking-[-0.9px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Learn to drive with a school you can{" "}
          <Text style={{ color: colors.primary }}>trust</Text>
        </Text>
        <Text
          className="mt-4 max-w-[340px] text-[14px] leading-6"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Browse FRSC-verified schools freely, or log in to manage your
          packages, lessons, and progress.
        </Text>

        <View className="mt-8 flex-row gap-3">
          {[
            ["shield-check-outline", "Verified schools"],
            ["map-marker-radius-outline", "Nearby options"],
          ].map(([icon, label]) => (
            <View
              key={label}
              className="flex-1 items-center rounded-2xl border px-3 py-4"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <MaterialCommunityIcons
                name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={22}
                color={colors.primary}
              />
              <Text
                className="mt-2 text-center text-[11px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeSemibold,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/explore")}
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[15px]"
            style={{
              color: colors.onPrimary,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Explore driving schools
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors.onPrimary}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/login")}
          className="h-14 items-center justify-center rounded-full border active:opacity-70"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[15px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Log in to my account
          </Text>
        </Pressable>
        <Text
          className="mt-1 text-center text-[10px] leading-4"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          You don’t need an account to browse schools.
        </Text>
      </View>
    </View>
  );
}
