import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { AppLogo } from "@/components/common/app-logo";
import { Screen } from "@/components/common/screen";
import { borderRadius, splashPalette } from "@/constants/theme";

const PRIMARY = splashPalette.primary;
const SLIDE_COUNT = 3;

function OnboardingHeader({
  onSkip,
  onBack,
}: {
  onSkip: () => void;
  onBack?: () => void;
}) {
  return (
    <View className="flex-row items-center px-6 py-3">
      <View className="w-16 items-start">
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous onboarding page"
            onPress={onBack}
            hitSlop={12}
            className="h-11 w-11 items-center justify-center"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#94a3b8"
            />
          </Pressable>
        ) : null}
      </View>

      <View pointerEvents="none" className="flex-1 items-center">
        <AppLogo height={36} />
      </View>

      <View className="w-16 items-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={onSkip}
          hitSlop={12}
          className="min-h-11 justify-center px-2"
        >
          <Text className="font-sans text-sm font-medium text-neutral-500 dark:text-white/60">
            Skip
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function OnboardingTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text
      accessibilityRole="header"
      className={`text-center font-sans text-[30px] font-bold leading-tight tracking-tight text-neutral-900 dark:text-white ${className}`}
    >
      {children}
    </Text>
  );
}

function PrimaryCtaButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <View
      className="w-full max-w-xs self-center overflow-hidden"
      style={{
        borderRadius: borderRadius.button,
        backgroundColor: PRIMARY,
        overflow: "hidden",
        ...Platform.select({
          android: { elevation: 6 },
          ios: {
            shadowColor: PRIMARY,
            shadowOpacity: 0.3,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 4 },
          },
        }),
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        android_ripple={{ color: "rgba(16, 23, 40, 0.12)" }}
        className="flex-row items-center justify-center gap-2 py-4"
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        <Text className="font-sans text-lg font-bold text-background-dark">
          {label}
        </Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={22}
          color={splashPalette.backgroundDark}
        />
      </Pressable>
    </View>
  );
}

function PageDots({
  activeIndex,
  className = "mb-10",
}: {
  activeIndex: number;
  className?: string;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 1,
        max: SLIDE_COUNT,
        now: activeIndex + 1,
        text: `Page ${activeIndex + 1} of ${SLIDE_COUNT}`,
      }}
      className={`flex-row items-center justify-center gap-2 ${className}`}
    >
      {Array.from({ length: SLIDE_COUNT }).map((_, index) => (
        <View
          key={index}
          className={`h-1.5 rounded-full ${index === activeIndex ? "w-8 bg-primary" : "w-4 bg-slate-300 dark:bg-slate-700"}`}
          style={
            index === activeIndex
              ? {
                  shadowColor: PRIMARY,
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 4,
                }
              : undefined
          }
        />
      ))}
    </View>
  );
}

function GridOverlay() {
  const rows = 22;
  const cols = 10;

  return (
    <View className="pointer-events-none absolute inset-0" pointerEvents="none">
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} className="h-10 flex-row">
          {Array.from({ length: cols }).map((_, col) => (
            <View
              key={col}
              className="h-10 w-10 border-r border-b border-primary/[0.03]"
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function ProCertificateHero() {
  return (
    <View className="relative aspect-square w-full max-w-[320px] items-center justify-center">
      <View
        className="absolute inset-0 rounded-full bg-primary/5"
        style={{ transform: [{ scale: 1.15 }] }}
      />

      <View className="relative h-full w-full overflow-hidden rounded-xl border border-primary/20 bg-primary/5">
        <View className="absolute left-0 right-0 top-0 h-1 bg-primary" />

        <View className="flex-1 items-center justify-center gap-4 px-6 py-8">
          <View className="h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-primary/20">
            <MaterialCommunityIcons
              name="star-shooting"
              size={56}
              color={PRIMARY}
            />
          </View>

          <View className="flex-row gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <MaterialCommunityIcons
                key={index}
                name="star"
                size={20}
                color={PRIMARY}
              />
            ))}
          </View>

          <View className="mt-2 rounded-full border border-primary/40 px-6 py-2">
            <Text className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Certified Pro Driver
            </Text>
          </View>
        </View>

        <View className="absolute bottom-4 left-4 h-12 w-12 border-b border-l border-primary/30" />
        <View className="absolute right-4 top-8 h-8 w-8 border-r border-t border-primary/30" />
      </View>
    </View>
  );
}

function HeroGlow() {
  return (
    <View className="pointer-events-none absolute inset-0 items-center justify-center">
      <View
        className="h-80 w-80 rounded-full"
        style={{ backgroundColor: `${PRIMARY}26`, transform: [{ scale: 1.2 }] }}
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

function MapDotPattern() {
  return (
    <View
      className="absolute inset-0 flex-row flex-wrap opacity-40"
      pointerEvents="none"
    >
      {Array.from({ length: 120 }).map((_, i) => (
        <View key={i} className="h-5 w-5 items-center justify-center">
          <View className="h-0.5 w-0.5 rounded-full bg-white/10" />
        </View>
      ))}
    </View>
  );
}

function LocationPing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(2.5, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [opacity, scale]);

  const pingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={pingStyle}
        className="absolute h-4 w-4 rounded-full bg-primary/40"
      />
      <View className="h-4 w-4 rounded-full border-2 border-white bg-primary shadow-lg" />
    </View>
  );
}

function PhoneMockup({ height = 280 }: { height?: number }) {
  return (
    <View
      className="relative w-full max-w-[260px] self-center"
      style={{ height }}
    >
      <View className="absolute inset-0 overflow-hidden rounded-[3rem] border-[6px] border-slate-800 bg-surface-dark shadow-2xl">
        <View className="absolute inset-0 overflow-hidden bg-slate-900">
          <MapDotPattern />
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ opacity: 0.4 }}
          >
            <Path
              d="M-10 80 C 20 70, 50 90, 80 60 S 110 20, 150 10"
              fill="none"
              stroke={PRIMARY}
              strokeWidth={2}
            />
            <Path
              d="M-10 40 C 30 50, 60 20, 90 40"
              fill="none"
              stroke="#475569"
              strokeWidth={1}
            />
          </Svg>

          <View className="absolute inset-0 items-center justify-center">
            <LocationPing />
          </View>

          <View className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-surface-dark/90 p-3">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                <MaterialCommunityIcons
                  name="share-variant"
                  size={18}
                  color={PRIMARY}
                />
              </View>
              <View className="flex-1 gap-1">
                <View className="h-1.5 w-16 rounded-full bg-white/20" />
                <View className="h-1.5 w-24 rounded-full bg-white/10" />
              </View>
            </View>
          </View>
        </View>

        <View className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-slate-800" />
      </View>

      <View
        className="absolute -right-4 top-1/3 h-16 w-16 items-center justify-center rounded-2xl border-4 border-background-dark bg-primary"
        style={{
          transform: [{ rotate: "12deg" }],
          shadowColor: PRIMARY,
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <MaterialCommunityIcons
          name="shield-check"
          size={32}
          color={splashPalette.backgroundDark}
        />
      </View>

      <View className="absolute -left-6 bottom-1/4 h-12 w-12 rounded-full bg-white/5" />
    </View>
  );
}

function OnboardingSlide1({
  width,
  height,
  onSkip,
  onNext,
}: {
  width: number;
  height: number;
  onSkip: () => void;
  onNext: () => void;
}) {
  return (
    <View style={{ width, height }}>
      <OnboardingHeader onSkip={onSkip} />

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

      <View className="px-8 pb-4">
        <OnboardingTitle className="mb-4">
          FRSC-Approved{"\n"}
          <Text className="text-primary">Schools</Text>
        </OnboardingTitle>
        <Text className="mx-auto mb-6 max-w-[300px] text-center font-sans text-base leading-relaxed text-neutral-600 dark:text-white/70">
          Discover and book lessons with the best, government-verified driving
          schools near you.
        </Text>
        <PageDots activeIndex={0} />
        <PrimaryCtaButton label="Get Started" onPress={onNext} />
      </View>
    </View>
  );
}

function OnboardingSlide2({
  width,
  height,
  onSkip,
  onBack,
  onNext,
}: {
  width: number;
  height: number;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const phoneHeight = Math.round(
    Math.max(240, Math.min(Math.round(height * 0.52), 340)) * 1.5,
  );

  return (
    <View style={{ width, height }}>
      <OnboardingHeader onSkip={onSkip} onBack={onBack} />

      <View className="flex-1 items-center justify-center px-8">
        <PhoneMockup height={phoneHeight} />
      </View>

      <View className="px-8 pb-2">
        <OnboardingTitle className="mb-2">Safety for Everyone</OnboardingTitle>
        <Text className="mx-auto mb-4 max-w-xs text-center font-sans text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Create a private, expiring link when you want someone you trust to
          follow an active lesson.
        </Text>
      </View>

      <View className="px-8 pb-4">
        <PageDots activeIndex={1} className="mb-6" />
        <PrimaryCtaButton label="Next Step" onPress={onNext} />
      </View>
    </View>
  );
}

function OnboardingSlide3({
  width,
  height,
  onSkip,
  onBack,
  onNext,
}: {
  width: number;
  height: number;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <View style={{ width, height }}>
      <GridOverlay />

      <OnboardingHeader onSkip={onSkip} onBack={onBack} />

      <View className="relative z-10 flex-1 items-center justify-center px-8">
        <ProCertificateHero />

        <OnboardingTitle className="mt-8">
          Become a{"\n"}
          <Text className="text-primary">Pro</Text> Driver
        </OnboardingTitle>
        <Text className="mt-4 max-w-xs text-center font-sans text-base leading-relaxed text-slate-500 dark:text-slate-400">
          Track your progress, get expert tips, and build a structured driving
          history.
        </Text>
      </View>

      <View className="relative z-10 px-8 pb-4">
        <PageDots activeIndex={2} className="mb-6" />
        <PrimaryCtaButton label="Get Started" onPress={onNext} />
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [, setPage] = useState(0);
  const [slideHeight, setSlideHeight] = useState(0);

  const continueToDiscovery = () => {
    router.push("/location");
  };

  const goToPage = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setPage(index);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setPage(index);
  };

  return (
    <Screen className="relative overflow-hidden">
      <View
        className="pointer-events-none absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full bg-primary/5"
        style={{ transform: [{ scale: 1.2 }] }}
      />
      <View
        className="pointer-events-none absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full bg-primary/5"
        style={{ transform: [{ scale: 1.1 }] }}
      />

      <View
        className="flex-1"
        onLayout={(event) => setSlideHeight(event.nativeEvent.layout.height)}
      >
        {slideHeight > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            bounces={false}
            decelerationRate="fast"
            style={{ flex: 1 }}
            contentContainerStyle={{ height: slideHeight }}
          >
            <OnboardingSlide1
              width={width}
              height={slideHeight}
              onSkip={continueToDiscovery}
              onNext={() => goToPage(1)}
            />
            <OnboardingSlide2
              width={width}
              height={slideHeight}
              onSkip={continueToDiscovery}
              onBack={() => goToPage(0)}
              onNext={() => goToPage(2)}
            />
            <OnboardingSlide3
              width={width}
              height={slideHeight}
              onSkip={continueToDiscovery}
              onBack={() => goToPage(1)}
              onNext={continueToDiscovery}
            />
          </ScrollView>
        ) : null}
      </View>
    </Screen>
  );
}
