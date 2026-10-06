import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchLearnerBookingById, verifyPaymentByReference } from "@/lib/api";
import { refreshLearnerBookings } from "@/lib/learner/hydrate-learner-operations";
import type { ApiError } from "@/types";

function entityId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (typeof record.id === "string") return record.id;
  return typeof record._id === "string" ? record._id : null;
}

export default function PaymentReturnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { reference } = useLocalSearchParams<{ reference?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const reconcilePayment = useCallback(async () => {
    if (typeof reference !== "string") {
      if (!reference) setError("The payment reference is missing.");
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const payment = await verifyPaymentByReference(reference);
      const booking = await fetchLearnerBookingById(payment.bookingId);
      const schoolId = entityId(booking.schoolId) ?? payment.schoolId;
      const packageId = entityId(booking.packageId);

      if (!schoolId || !packageId) {
        throw new Error("The booking details could not be restored.");
      }

      if (payment.status === "success") {
        await refreshLearnerBookings().catch(() => undefined);
      }

      router.replace({
        pathname: "/checkout/[schoolId]/result",
        params: {
          schoolId,
          packageId,
          bookingId: booking.id,
          paymentId: payment.id,
          status:
            payment.status === "success"
              ? "success"
              : payment.status === "failed"
                ? "failed"
                : "pending",
        },
      });
    } catch (caught) {
      setError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError).message
          : "We could not confirm this payment yet.",
      );
    } finally {
      setIsChecking(false);
    }
  }, [reference, router]);

  useEffect(() => {
    const timeout = setTimeout(() => void reconcilePayment(), 0);
    return () => clearTimeout(timeout);
  }, [reconcilePayment]);

  return (
    <View
      className="flex-1 items-center justify-center px-7"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <View
        className="h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        {isChecking ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <MaterialCommunityIcons
            name="credit-card-clock-outline"
            size={36}
            color={colors.primary}
          />
        )}
      </View>

      <Text
        accessibilityRole="header"
        className="mt-7 text-center text-[26px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        {isChecking ? "Confirming payment" : "Payment needs attention"}
      </Text>
      <Text
        className="mt-3 max-w-[330px] text-center text-[14px] leading-6"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        {error ??
          "Please wait while we securely confirm your payment with Paystack."}
      </Text>

      {error ? (
        <View className="mt-8 w-full gap-3">
          <Pressable
            accessibilityRole="button"
            disabled={isChecking}
            onPress={() => void reconcilePayment()}
            className="h-14 items-center justify-center rounded-full active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="text-[15px]"
              style={{
                color: colors.onPrimary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Check again
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/student")}
            className="h-14 items-center justify-center rounded-full border active:opacity-80"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-[15px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              Back to dashboard
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
