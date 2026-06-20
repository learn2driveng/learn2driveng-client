import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { packageName, schoolName, date, time, instructor } =
    useLocalSearchParams<{
      packageName?: string;
      schoolName?: string;
      date?: string;
      time?: string;
      instructor?: string;
    }>();

  return (
    <DashboardScreen>
      <View className="items-center pt-10">
        <View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}24` }}
        >
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons name="check" size={34} color={colors.onPrimary} />
          </View>
        </View>
        <Text
          className="mt-7 text-center text-[30px] leading-9 tracking-[-0.8px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Your lesson is booked
        </Text>
        <Text
          className="mt-3 max-w-[290px] text-center text-[14px] leading-6"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
        >
          We reserved one session credit and sent the booking details to your instructor.
        </Text>
      </View>

      <View
        className="mt-9 overflow-hidden rounded-3xl border p-5"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center gap-3 pb-4">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons name="calendar-check" size={23} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-[10px] uppercase tracking-[1px]"
              style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
            >
              Booking confirmed
            </Text>
            <Text
              className="mt-1 text-[16px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              {date ?? "Tue 25"} · {time ?? "11:30 AM"}
            </Text>
          </View>
        </View>

        {[
          ["School", schoolName ?? "Elite Safety Driving Academy"],
          ["Package", packageName ?? "Selected package"],
          ["Instructor", instructor ?? "Best available instructor"],
          ["Booking reference", "L2D-240625-A7"],
        ].map(([label, value]) => (
          <View
            key={label}
            className="flex-row items-start justify-between gap-5 border-t py-3.5"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-[12px]"
              style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
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

      <View className="mt-8 gap-3">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/student/sessions")}
          className="h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[15px]"
            style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
          >
            View my sessions
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/student")}
          className="h-14 items-center justify-center rounded-2xl border active:opacity-70"
          style={{ borderColor: colors.border, backgroundColor: colors.surface }}
        >
          <Text
            className="text-[15px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Return home
          </Text>
        </Pressable>
      </View>

      <View
        className="mt-8 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.verifiedSoft }}
      >
        <MaterialCommunityIcons name="information-outline" size={19} color={colors.verified} />
        <Text
          className="flex-1 text-[12px] leading-5"
          style={{ color: colors.verified, fontFamily: fontFamily.figtreeMedium }}
        >
          You can reschedule or cancel from your booking details, subject to the school’s policy.
        </Text>
      </View>
    </DashboardScreen>
  );
}
