import { useRef, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";
import { useKeepFocusedInputVisible } from "@/hooks/use-keep-focused-input-visible";

type AuthScreenProps = {
  children: ReactNode;
  contentClassName?: string;
  scrollEnabled?: boolean;
};

export function AuthScreen({
  children,
  contentClassName = "",
  scrollEnabled = true,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const keepFocusedInputVisible = useKeepFocusedInputVisible(scrollViewRef);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onFocus={keepFocusedInputVisible}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow items-center px-7"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View
          className={`w-full max-w-[620px] ${contentClassName}`}
          style={{ flexGrow: 1, flexShrink: 0 }}
        >
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
