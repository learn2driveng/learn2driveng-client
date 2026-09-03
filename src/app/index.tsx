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

      <Scanline />
    </Screen>
  );
}
