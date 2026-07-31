import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppLogo } from "@/components/common/app-logo";
import { Screen } from "@/components/common/screen";
import { splashPalette } from "@/constants/theme";
import { homeForRole } from "@/features/auth";
import { useAuthStore } from "@/store/auth.store";

const FRSC_SEAL_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD99lysc47F8HMkFqweiUaINTA_KvVAT2G1YcDq5y9vW29PbZnDnesPrnabI7BUpVjxq26bQdtgD_j4Yy3oa0tfB2haDCRvMnmBld38uNMdCC2WQPjOJUAmFZVxIK3X47b0dNF9WXvm6-CfNB1DO4fjrKCe2CKDsDxjlkHw9CfTNiUip4C34sJ9Migs5-KgeQ1N245M9107h-A0uEAXmhITog9_8be-w-Buy4o9cIM3405uOYyYtDV4A2INBy9UF2tRrj-hb0ruk4Bk";

const GRID_ROWS = 18;
const GRID_COLS = 14;
const PRIMARY = splashPalette.primary;

function DotGrid() {
  return (
    <View className="absolute inset-0" pointerEvents="none">
      {Array.from({ length: GRID_ROWS }).map((_, row) => (
        <View key={row} className="h-6 flex-row">
          {Array.from({ length: GRID_COLS }).map((_, col) => (
            <View key={col} className="h-6 w-6 items-center justify-center">
              <View className="h-0.5 w-0.5 rounded-full bg-black/5 dark:bg-white/5" />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Scanline() {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value * 280 }],
  }));

  return (
    <Animated.View
      className="absolute left-0 right-0 top-[20%] h-10 opacity-20"
      style={animatedStyle}
      pointerEvents="none"
    >
      <LinearGradient
        colors={["transparent", `${PRIMARY}1A`, "transparent"]}
        className="absolute inset-0"
      />
    </Animated.View>
  );
}

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const progress = useSharedValue(0);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    progress.value = withTiming(0.72, {
      duration: 2200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(
        isAuthenticated && role ? homeForRole(role) : ("/onboarding" as Href),
      );
    }, 2800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role, router]);

  const progressStyle = useAnimatedStyle(() => ({
    width: progress.value * 240,
  }));

  return (
    <Screen
      edges={false}
      className="overflow-hidden px-8"
      style={{ paddingTop: insets.top + 32, paddingBottom: insets.bottom + 16 }}
    >
      <DotGrid />

      <View className="z-10 flex-row items-start justify-between opacity-60">
        <View>
          <Text className="font-sans text-caption font-medium uppercase tracking-wide text-primary">
            System Auth
          </Text>
          <Text className="font-sans text-caption font-medium uppercase tracking-wide text-neutral-900 dark:text-white">
            Status: Ready
          </Text>
        </View>
        <Text className="text-right font-sans text-caption font-medium uppercase tracking-wide text-neutral-900 dark:text-white">
          L2D-OS v2.4.0
        </Text>
      </View>

      <View className="w-full flex-1 items-center justify-center">
        <View className="items-center justify-center p-12">
          <View className="absolute h-[200px] w-[200px] scale-110 rounded-full border border-primary/20" />
          <View className="absolute h-[200px] w-[200px] rounded-full border-2 border-transparent border-t-primary opacity-50" />

          <View
            className="relative z-20 h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/50 bg-background-light shadow-lg dark:bg-background-dark"
            style={{
              shadowColor: PRIMARY,
              shadowOpacity: 0.15,
              shadowRadius: 30,
              elevation: 8,
            }}
          >
            <AppLogo height={78} />
          </View>

          <LinearGradient
            colors={["transparent", `${PRIMARY}66`, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="absolute -left-12 h-px w-24"
          />
          <LinearGradient
            colors={["transparent", `${PRIMARY}66`, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            className="absolute -right-12 h-px w-24"
          />
        </View>

        <View className="mt-8 items-center">
          <Text className="font-sans text-title1 font-bold tracking-wide text-neutral-900 dark:text-white">
            LEARN<Text className="font-sans text-primary">2</Text>DRIVE
          </Text>
          <View className="flex-row items-center gap-3">
            <View className="h-px w-8 bg-primary/30" />
            <Text className="font-sans text-footnote font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Safety Tracking & Education
            </Text>
            <View className="h-px w-8 bg-primary/30" />
          </View>
        </View>

        <View className="mt-16 w-full max-w-[240px] gap-3">
          <View className="flex-row items-end justify-between">
            <Text className="font-sans text-caption font-medium uppercase tracking-wide text-primary/80">
              Initializing Safety Core
            </Text>
            <Text className="font-sans text-caption font-medium tabular-nums text-neutral-900 dark:text-white">
              72%
            </Text>
          </View>
          <View className="h-1 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
            <Animated.View
              className="h-full rounded-full bg-primary"
              style={progressStyle}
            />
          </View>
        </View>
      </View>

      <View className="z-10 items-center gap-4 pb-4">
        <View className="w-full max-w-sm flex-row items-center gap-4 rounded-xl border border-black/10 bg-black/5 px-6 py-3 dark:border-white/10 dark:bg-white/5">
          <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-black/10 dark:bg-white/10">
            <Image
              source={{ uri: FRSC_SEAL_URI }}
              className="h-full w-full"
              contentFit="contain"
            />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-sans text-caption font-bold uppercase tracking-wide text-primary">
              FRSC Verified Provider
            </Text>
            <Text className="font-sans max-w-[180px] text-footnote text-neutral-500 dark:text-neutral-400">
              Certified safety and tracking standards compliant.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="check-decagram"
            size={16}
            color={`${PRIMARY}CC`}
          />
        </View>
        <Text className="font-sans text-caption font-light uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Secure Fleet Connection Active
        </Text>
      </View>

      <Scanline />
    </Screen>
  );
}
