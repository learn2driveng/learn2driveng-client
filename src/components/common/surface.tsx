import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type HeroSurfaceProps = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export function useSurfaceStyles() {
  const { colors, isDark } = useAppTheme();

  return {
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: isDark ? 0.24 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    } satisfies ViewStyle,
    floating: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.32 : 0.13,
      shadowRadius: 18,
      elevation: 6,
    } satisfies ViewStyle,
    inset: {
      backgroundColor: colors.surfaceStrong,
      borderColor: colors.border,
    } satisfies ViewStyle,
  };
}

export function HeroSurface({ children, className, style }: HeroSurfaceProps) {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();

  return (
    <LinearGradient
      colors={[colors.contrastSurface, colors.contrastSurfaceStrong]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className={className}
      style={[surfaces.floating, style]}
    >
      {children}
    </LinearGradient>
  );
}
