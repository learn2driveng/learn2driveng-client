import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { CheckoutShell, useCheckoutPackage } from "@/features/checkout";
import {
  openPaystackCheckout,
  paystackReturnUrlPrefix,
} from "@/features/checkout/open-paystack-checkout";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  createLearnerBooking,
  initializePayment,
} from "@/lib/api";
import { refreshLearnerBookings } from "@/lib/learner/hydrate-learner-operations";
import { packageDurationLabel } from "@/lib/school/mappers";
import type { ApiError } from "@/types";
import type { PaymentChannel } from "@/types/payment";

const methodLabels: Record<string, string> = {
  card: "Debit or credit card",
  bank_transfer: "Bank transfer",
  ussd: "USSD",
};

export default function PurchaseReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const {
    schoolId,
    packageId,
    method = "card",
  } = useLocalSearchParams<{
    schoolId?: string;
    packageId?: string;
    method?: string;
  }>();
  const { school, selectedPackage, loading, error, refetch } =
    useCheckoutPackage(schoolId, packageId);
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !school || !selectedPackage) {
    return (
      <View
        className="flex-1 items-center justify-center px-8"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-center text-[16px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {error?.message ?? "Checkout details unavailable"}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => (error ? refetch() : router.back())}
          className="mt-6 rounded-full px-6 py-3 active:opacity-75"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <Text
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            {error ? "Try again" : "Go back"}
          </Text>
        </Pressable>
      </View>
    );
  }

  const rows = [
    ["Driving school", school.name],
    ["Training package", selectedPackage.name],
    ["Duration", packageDurationLabel(selectedPackage)],
    ["Sessions", `${selectedPackage.numberOfLessons} lessons`],
    ["Payment method", methodLabels[method] ?? methodLabels.card],
  ];

  const handlePay = async () => {
    if (isPaying) return;

    setIsPaying(true);
    setPayError(null);

    try {
      const booking = await createLearnerBooking({
        packageId: selectedPackage.id,
      });
      const channel = (
        method in methodLabels ? method : "card"
      ) as PaymentChannel;
      const payment = await initializePayment(booking.id, channel);

      if (!payment.authorizationUrl) {
        throw new Error(
          "The secure payment page is unavailable. Please try again.",
        );
      }

      const returnUrlPrefix = paystackReturnUrlPrefix();
      const { paymentStatus } = await openPaystackCheckout({
        authorizationUrl: payment.authorizationUrl,
        paymentId: payment.id,
        returnUrlPrefix,
      });

      const resultStatus =
        paymentStatus === "success"
          ? "success"
          : paymentStatus === "failed"
            ? "failed"
            : method === "bank_transfer"
              ? "pending"
              : "cancelled";

      await refreshLearnerBookings().catch(() => undefined);

      router.replace({
        pathname: "/checkout/[schoolId]/result",
        params: {
          schoolId: school.id,
          packageId: selectedPackage.id,
          method,
          status: resultStatus,
          bookingId: booking.id,
          paymentId: payment.id,
        },
      });
    } catch (caught) {
      setPayError(
        caught &&
          typeof caught === "object" &&
          "message" in caught &&
          typeof (caught as ApiError).message === "string"
          ? (caught as ApiError).message
          : "Payment could not be started. Please try again.",
      );
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <CheckoutShell
      title="Review purchase"
      step={2}
      onBack={() => router.back()}
    >
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 24,
        }}
      >
        <Text
          className="text-[26px] leading-8 tracking-[-0.6px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          Check everything looks right
        </Text>
        <Text
          className="mt-2 text-[14px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Your sessions become available after payment is confirmed.
        </Text>

        <View
          className="mt-7 overflow-hidden rounded-3xl border px-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {rows.map(([label, value], index) => (
            <View
              key={label}
              className="flex-row items-start justify-between gap-5 py-4"
              style={
                index
                  ? { borderTopWidth: 1, borderTopColor: colors.border }
                  : undefined
              }
            >
              <Text
                className="text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
              <Text
                className="max-w-[62%] text-right text-[12px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        <View
          className="mt-5 rounded-3xl p-5"
          style={{ backgroundColor: colors.contrastSurface }}
        >
          <View className="flex-row items-center justify-between">
            <Text
              className="text-[13px]"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Amount to pay
            </Text>
            <MaterialCommunityIcons
              name="shield-check"
              size={21}
              color={colors.primary}
            />
          </View>
          <Text
            className="mt-3 text-[32px] tracking-[-0.7px]"
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            ₦{selectedPackage.price.toLocaleString("en-NG")}
          </Text>
          <Text
            className="mt-2 text-[11px]"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtree,
            }}
          >
            Secure payment · No hidden charges
          </Text>
        </View>

        {payError ? (
          <Text
            className="mt-5 font-figtree-medium text-[13px]"
            style={{ color: colors.error }}
          >
            {payError}
          </Text>
        ) : null}
      </ScrollView>

      <View
        className="border-t px-5 pt-3"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 14),
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isPaying }}
          disabled={isPaying}
          onPress={() => void handlePay()}
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{
            backgroundColor: colors.primary,
            opacity: isPaying ? 0.8 : 1,
          }}
        >
          {isPaying ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="lock-outline"
                size={19}
                color={colors.onPrimary}
              />
              <Text
                className="text-[15px]"
                style={{
                  color: colors.onPrimary,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                Pay ₦{selectedPackage.price.toLocaleString("en-NG")}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </CheckoutShell>
  );
}
