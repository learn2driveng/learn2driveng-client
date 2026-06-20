import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";

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

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow items-center px-7"
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className={`w-full max-w-[620px] flex-1 ${contentClassName}`}>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
