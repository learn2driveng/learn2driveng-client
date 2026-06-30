import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";

type DashboardScreenProps = {
  children: ReactNode;
};

export function DashboardScreen({ children }: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="mx-auto w-full max-w-[720px]">{children}</View>
      </ScrollView>
    </View>
  );
}
