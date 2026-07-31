import "../../global.css";
import "@/lib/nativewind";
import "@/lib/google/google-sign";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAppFonts } from "@/hooks/use-app-fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSessionBootstrap } from "@/features/auth";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isDark, colors } = useAppTheme();
  const [fontsLoaded, fontError] = useAppFonts();
  const authStatus = useSessionBootstrap();

  useEffect(() => {
    if ((fontsLoaded || fontError) && authStatus !== "checking") {
      SplashScreen.hideAsync();
    }
  }, [authStatus, fontsLoaded, fontError]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  if ((!fontsLoaded && !fontError) || authStatus === "checking") {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </SafeAreaProvider>
  );
}
