import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getPackageById, getSchoolById } from "@/sample_data";

export default function CheckoutResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { schoolId, packageId } = useLocalSearchParams<{
    schoolId?: string;
    packageId?: string;
  }>();
  const school = getSchoolById(schoolId);
  const selectedPackage = getPackageById(schoolId, packageId);

  if (!school || !selectedPackage) return null;

  return (
    <View
      className="flex-1 px-6"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-1 items-center justify-center">
        <View
          className="h-28 w-28 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.successSoft }}
        >
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.success }}
          >
            <MaterialCommunityIcons
              name="check"
              size={42}
              color={colors.contrastText}
            />
          </View>
        </View>
        <Text
          className="mt-8 text-center text-[30px] leading-9 tracking-[-0.8px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Package unlocked
        </Text>
        <Text
          className="mt-3 max-w-[310px] text-center text-[14px] leading-6"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Your {selectedPackage.sessions} sessions with {school.name} are ready
          to book.
        </Text>

        <View
          className="mt-9 w-full rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="ticket-confirmation-outline"
                size={25}
                color={colors.primary}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {selectedPackage.name}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtree,
                }}
              >
                {selectedPackage.sessions} session credits ·{" "}
                {selectedPackage.duration}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.replace({
              pathname: "/student/sessions/book",
              params: {
                packageName: selectedPackage.name,
                schoolName: school.name,
              },
            })
          }
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
            Book first lesson
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={colors.onPrimary}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/student/sessions")}
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
            View my packages
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
