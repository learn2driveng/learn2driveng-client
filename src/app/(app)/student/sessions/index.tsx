import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  DashboardScreen,
  PackageCreditCard,
  SectionHeader,
} from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function StudentSessionsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const bookSelectedPackage = () => {
    if (!selectedPackage) return;

    router.push({
      pathname: "/student/sessions/book",
      params: { packageName: selectedPackage },
    });
  };

  return (
    <DashboardScreen>
      <Text
        className="font-figtree-bold text-[30px]"
        style={{ color: colors.text }}
      >
        Sessions
      </Text>
      <Text
        className="mt-2 font-figtree text-[16px]"
        style={{ color: colors.textMuted }}
      >
        Book and manage the driving sessions included in your packages.
      </Text>

      <View
        className="mt-8 flex-row items-center gap-4 rounded-3xl p-5"
        style={{ backgroundColor: colors.text }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="ticket-confirmation-outline"
            size={25}
            color="#041320"
          />
        </View>
        <View className="flex-1">
          <Text className="font-figtree-bold text-[26px] text-white">20</Text>
          <Text className="font-figtree text-[13px] text-white/70">
            Available session credits
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedPackage }}
          disabled={!selectedPackage}
          onPress={bookSelectedPackage}
          className="h-11 flex-row items-center gap-2 rounded-2xl px-4 active:opacity-75"
          style={{
            backgroundColor: selectedPackage
              ? colors.primary
              : colors.surfaceStrong,
          }}
        >
          <MaterialCommunityIcons
            name="calendar-plus"
            size={19}
            color={selectedPackage ? "#041320" : colors.textSubtle}
          />
          <Text
            className="font-figtree-bold text-[13px]"
            style={{
              color: selectedPackage ? "#041320" : colors.textSubtle,
            }}
          >
            Book
          </Text>
        </Pressable>
      </View>

      <View className="mt-9">
        <SectionHeader title="Active packages" />
        <Text
          className="mt-2 font-figtree text-[13px]"
          style={{ color: colors.textMuted }}
        >
          Select the package you want to use, then tap Book.
        </Text>
        <View className="mt-4 gap-3">
          <PackageCreditCard
            name="Defensive Driving Package"
            icon="shield-car"
            totalSessions={10}
            remainingSessions={10}
            selected={selectedPackage === "Defensive Driving Package"}
            onPress={() => setSelectedPackage("Defensive Driving Package")}
          />
          <PackageCreditCard
            name="Professional Driving Package"
            icon="steering"
            totalSessions={10}
            remainingSessions={10}
            selected={selectedPackage === "Professional Driving Package"}
            onPress={() => setSelectedPackage("Professional Driving Package")}
          />
        </View>
      </View>
    </DashboardScreen>
  );
}
