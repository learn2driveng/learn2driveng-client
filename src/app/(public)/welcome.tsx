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
      <View className="flex-1 justify-center">
        <AppLogo height={58} />
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
          Compare approved schools freely, or log in to manage your packages,
          lessons, and progress.
        </Text>

        <View className="flex-row gap-3 mt-8">
          {[
            ["shield-check-outline", "Verified schools"],
            ["map-marker-radius-outline", "Nearby options"],
          ].map(([icon, label]) => (
            <View
              key={label}
              className="flex-1 items-center px-3 py-4 border rounded-2xl"
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
                className="mt-2 text-[11px] text-center"
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
          className="flex-row justify-center items-center gap-2 active:opacity-80 rounded-full h-14"
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
          className="justify-center items-center active:opacity-70 border rounded-full h-14"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-[15px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Log in or create an account
          </Text>
        </Pressable>
        <Text
          className="mt-1 text-[10px] text-center leading-4"
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
