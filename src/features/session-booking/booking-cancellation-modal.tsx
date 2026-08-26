import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppTheme } from "@/hooks/use-app-theme";

type BookingCancellationModalProps = {
  visible: boolean;
  date: string;
  time: string;
  packageName: string;
  onDismiss: () => void;
  onConfirm: () => void;
  submitting?: boolean;
};

export function BookingCancellationModal({
  visible,
  date,
  time,
  packageName,
  onDismiss,
  onConfirm,
  submitting = false,
}: BookingCancellationModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close cancellation confirmation"
          onPress={onDismiss}
          className="absolute inset-0"
        />
        <View
          accessibilityViewIsModal
          className="rounded-t-[32px] px-6 pt-4"
          style={{
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
        >
          <View
            className="h-1.5 w-12 self-center rounded-full"
            style={{ backgroundColor: colors.border }}
          />

          <View
            className="mt-6 h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={28}
              color={colors.error}
            />
          </View>

          <Text
            className="mt-5 font-figtree-bold text-[22px]"
            style={{ color: colors.text }}
          >
            Cancel this lesson?
          </Text>
          <Text
            className="mt-2 font-figtree text-[13px] leading-5"
            style={{ color: colors.textMuted }}
          >
            Your place will be released. You can reschedule instead if you still
            want to attend this lesson.
          </Text>

          <View
            className="mt-5 rounded-2xl border p-4"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Text
              className="font-figtree-bold text-[14px]"
              style={{ color: colors.text }}
            >
              {date} · {time}
            </Text>
            <Text
              className="mt-1 font-figtree text-[12px]"
              style={{ color: colors.textMuted }}
            >
              {packageName}
            </Text>
          </View>

          <View
            className="mt-4 flex-row items-start gap-3 rounded-2xl p-4"
            style={{ backgroundColor: colors.surfaceStrong }}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text
              className="flex-1 font-figtree text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Cancel at least 3 hours before the lesson starts. One lesson will
              return to your package after cancellation.
            </Text>
          </View>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={onDismiss}
              className="h-14 flex-1 items-center justify-center rounded-full border active:opacity-70"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <Text
                className="font-figtree-bold text-[14px]"
                style={{ color: colors.text }}
              >
                Keep lesson
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={onConfirm}
              className="h-14 flex-1 items-center justify-center rounded-full active:opacity-80"
              style={{ backgroundColor: colors.error }}
            >
              {submitting ? (
                <ActivityIndicator color={colors.onDark} />
              ) : (
                <Text
                  className="font-figtree-bold text-[14px]"
                  style={{ color: colors.onDark }}
                >
                  Cancel lesson
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
