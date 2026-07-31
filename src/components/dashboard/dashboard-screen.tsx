import { useEffect, useRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";
import { useKeepFocusedInputVisible } from "@/hooks/use-keep-focused-input-visible";

type DashboardScreenProps = {
  children: ReactNode;
  scrollResetKey?: string | number;
};

export function DashboardScreen({
  children,
  scrollResetKey,
}: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const keepFocusedInputVisible = useKeepFocusedInputVisible(scrollViewRef);

  useEffect(() => {
    if (scrollResetKey === undefined) return;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [scrollResetKey]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onFocus={keepFocusedInputVisible}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="mx-auto w-full max-w-[720px]">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
