import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/components/common/toast";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useKeepFocusedInputVisible } from "@/hooks/use-keep-focused-input-visible";

type DashboardScreenProps = {
  children: ReactNode;
  header?: ReactNode;
  scrollResetKey?: string | number;
  onRefresh?: () => Promise<unknown> | void;
};

export function DashboardScreen({
  children,
  header,
  scrollResetKey,
  onRefresh,
}: DashboardScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  const scrollViewRef = useRef<ScrollView>(null);
  const refreshingRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const keepFocusedInputVisible = useKeepFocusedInputVisible(scrollViewRef);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      await onRefresh();
    } catch {
      showToast("Could not refresh. Please try again.", "error");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [onRefresh, showToast]);

  useEffect(() => {
    if (scrollResetKey === undefined) return;
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [scrollResetKey]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {header ? (
        <View style={{ paddingTop: 16, paddingHorizontal: 20 }}>
          <View className="mx-auto w-full max-w-[720px]">{header}</View>
        </View>
      ) : null}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onFocus={keepFocusedInputVisible}
        alwaysBounceVertical={!!onRefresh}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void handleRefresh()}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          ) : undefined
        }
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: header ? 0 : 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 20,
        }}
      >
        <View className="mx-auto w-full max-w-[720px]">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
