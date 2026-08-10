import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";

type ToastTone = "success" | "error" | "info";
type Toast = { message: string; tone: ToastTone };
type ToastContextValue = { showToast: (message: string, tone?: ToastTone) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = "success") => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const toneMeta = toast
    ? {
        success: { icon: "check-circle" as const, color: colors.success },
        error: { icon: "alert-circle" as const, color: colors.error },
        info: { icon: "information" as const, color: colors.verified },
      }[toast.tone]
    : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && toneMeta ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            top: insets.top + 12,
            left: 20,
            right: 20,
            zIndex: 1000,
            elevation: 1000,
          }}
        >
          <View
            style={{
              minHeight: 58,
              backgroundColor: colors.contrastSurface,
              borderColor: colors.contrastBorder,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons name={toneMeta.icon} size={21} color={toneMeta.color} />
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                marginLeft: 12,
                marginRight: 12,
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: "700",
                lineHeight: 21,
              }}
            >
              {toast.message}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" hitSlop={12} onPress={() => setToast(null)}>
              <MaterialCommunityIcons name="close" size={19} color={colors.contrastMuted} />
            </Pressable>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
