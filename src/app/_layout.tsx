import "../../global.css";
import "@/lib/nativewind";
import "@/features/location/instructor-background-location";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { StatusBar } from "expo-status-bar";
import { colorScheme as nativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components/common/toast";
import { useAppFonts } from "@/hooks/use-app-fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSessionBootstrap } from "@/features/auth";
import { PushNotificationManager } from "@/features/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme, isDark, colors } = useAppTheme();
  const [fontsLoaded, fontError] = useAppFonts();
  const authStatus = useSessionBootstrap();
  const isAuthenticated = authStatus === "authenticated";

  useEffect(() => {
    if ((fontsLoaded || fontError) && authStatus !== "checking") {
      SplashScreen.hideAsync();
    }
  }, [authStatus, fontsLoaded, fontError]);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  useEffect(() => {
    nativeWindColorScheme.set(theme);
  }, [theme]);

  if ((!fontsLoaded && !fontError) || authStatus === "checking") {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <PushNotificationManager />
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(public)" />
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Screen name="(app)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
