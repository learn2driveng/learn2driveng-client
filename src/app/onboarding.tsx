import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borderRadius, splashPalette } from "@/constants/theme";

const PRIMARY = splashPalette.primary;

function HeroGlow() {
  return (
    <View
      className="pointer-events-none absolute inset-0 items-center justify-center"
      pointerEvents="none"
    >
      <View
        className="h-80 w-80 rounded-full opacity-100"
        style={{
          backgroundColor: `${PRIMARY}26`,
          transform: [{ scale: 1.2 }],
        }}
      />
    </View>
  );
}

function VerifiedBadge() {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute -bottom-4 -right-2 flex-row items-center gap-2 rounded-2xl border border-primary/30 bg-navy-accent px-3 py-3 shadow-lg"
    >
      <MaterialCommunityIcons name="check-decagram" size={20} color={PRIMARY} />
      <Text
        className="font-sans text-xs font-bold uppercase tracking-wider text-primary"
        style={{ color: splashPalette.primary }}
      >
        FRSC Verified
      </Text>
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const goNext = () => {
    // Next auth step — login screen to be added in (auth) group
    router.push("/login" as Href);
  };

  return (
    <View
      className="relative flex-1 overflow-hidden bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Decorative blurs */}
      <View
        className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/5"
        style={{ transform: [{ scale: 1.5 }] }}
      />
      <LinearGradient
        colors={["transparent", "#101728"]}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-1/2 opacity-30 dark:opacity-100"
        pointerEvents="none"
      />

      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MaterialCommunityIcons
              name="steering"
              size={20}
              color={splashPalette.backgroundDark}
            />
          </View>
          <Text className="font-sans text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            Learn2Drive
          </Text>
        </View>
        <Pressable onPress={goNext} hitSlop={12}>
          <Text className="font-sans text-sm font-medium text-neutral-500 dark:text-white/60">
            Skip
          </Text>
        </Pressable>
      </View>

      {/* Hero illustration */}
      <View className="relative flex-1 items-center justify-center px-8">
        <HeroGlow />

        <View className="relative aspect-square w-full max-w-[280px] items-center justify-center">
          <View
            className="absolute inset-0 rounded-[2.5rem] bg-navy-accent/40"
            style={{ transform: [{ rotate: "6deg" }] }}
          />
          <View
            className="absolute inset-0 rounded-[2.5rem] border border-white/10 bg-navy-accent"
            style={{ transform: [{ rotate: "-3deg" }] }}
          />

          <View className="relative z-10 items-center">
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "transparent"]}
              className="h-32 w-48 items-center justify-center rounded-2xl border border-white/20"
            >
              <MaterialCommunityIcons name="garage" size={80} color={PRIMARY} />
            </LinearGradient>
            <VerifiedBadge />
          </View>
        </View>
      </View>

      {/* Copy */}
      <View className="px-8 pb-10">
        <Text className="mb-4 text-center font-sans text-[30px] font-bold leading-tight tracking-tight text-neutral-900 dark:text-white">
          FRSC-Approved{"\n"}
          <Text className="text-primary">Schools</Text>
        </Text>
        <Text className="mx-auto max-w-[300px] text-center font-sans text-base leading-relaxed text-neutral-600 dark:text-white/70">
          Discover and book lessons with the best, government-verified driving
          schools near you.
        </Text>
      </View>

      {/* Footer */}
      <View className="gap-8 px-8 pb-8">
        <View className="flex-row items-center justify-center gap-3">
          <View
            className="h-1.5 w-8 rounded-full bg-primary"
            style={{
              shadowColor: PRIMARY,
              shadowOpacity: 0.5,
              shadowRadius: 10,
              elevation: 4,
            }}
          />
          <View className="h-1.5 w-4 rounded-full bg-black/20 dark:bg-white/20" />
          <View className="h-1.5 w-4 rounded-full bg-black/20 dark:bg-white/20" />
        </View>

        <View
          className="w-full overflow-hidden"
          style={{
            borderRadius: borderRadius.button,
            backgroundColor: PRIMARY,
            overflow: "hidden",
            ...Platform.select({
              android: { elevation: 6 },
              ios: {
                shadowColor: PRIMARY,
                shadowOpacity: 0.2,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              },
            }),
          }}
        >
          <Pressable
            onPress={goNext}
            android_ripple={{ color: "rgba(16, 23, 40, 0.12)" }}
            className="flex-row items-center justify-center gap-3 py-5"
            style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
          >
            <Text className="font-sans text-lg font-bold text-background-dark">
              Get Started
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={22}
              color={splashPalette.backgroundDark}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
