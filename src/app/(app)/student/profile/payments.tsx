import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchLearnerBookings, fetchSuccessfulPayments } from "@/lib/api";
import { bookingToLearnerPackage } from "@/lib/learner/map-api";
import type { ApiError } from "@/types";
import type { SuccessfulPayment } from "@/types/payment";

type PaymentRecord = SuccessfulPayment & {
  packageName: string;
  schoolName: string;
};

function paymentMethod(channel: string | null) {
  const labels: Record<string, string> = {
    card: "Card",
    bank: "Pay with bank",
    bank_transfer: "Bank transfer",
    ussd: "USSD",
    apple_pay: "Apple Pay",
    mobile_money: "Mobile money",
  };
  return channel
    ? (labels[channel] ?? channel.replaceAll("_", " "))
    : "Paystack";
}

function paymentDate(value: string | null) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function paymentAmount(payment: SuccessfulPayment) {
  const amount = Number(payment.amount);
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";
  return payment.currency === "NGN"
    ? `₦${formatted}`
    : `${payment.currency} ${formatted}`;
}

export default function PaymentHistoryScreen() {
  const { colors } = useAppTheme();
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payments = await fetchSuccessfulPayments();
      const bookings = await fetchLearnerBookings().catch(() => []);
      const packages = new Map(
        bookings.map((booking) => [
          booking.id,
          bookingToLearnerPackage(booking),
        ]),
      );
      setRecords(
        payments.map((payment) => ({
          ...payment,
          packageName:
            packages.get(payment.bookingId)?.name ?? "Training package",
          schoolName:
            packages.get(payment.bookingId)?.schoolName ?? "Driving school",
        })),
      );
    } catch (caught) {
      setError(
        (caught as ApiError).message || "We could not load your payments.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <DashboardScreen onRefresh={load}>
      <DashboardPageHeader title="Payment history" />
      <Text
        className="mt-3 text-[14px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Confirmed package payments only.
      </Text>

      {loading ? (
        <View className="items-center py-20">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View className="mt-8">
          <ContentEmptyState
            icon="alert-circle-outline"
            title="Payment history unavailable"
            description={error}
            actionLabel="Try again"
            onActionPress={() => void load()}
          />
        </View>
      ) : records.length === 0 ? (
        <View className="mt-8">
          <ContentEmptyState
            icon="receipt-text-outline"
            title="No payments yet"
            description="Your confirmed package payments will appear here. Unfinished attempts are not shown."
          />
        </View>
      ) : (
        <View className="mt-7 gap-4">
          {records.map((payment) => (
            <View
              key={payment.id}
              className="rounded-3xl border p-5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <View className="flex-row items-start gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name="receipt-text-check-outline"
                    size={23}
                    color={colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-[16px]"
                    style={{
                      color: colors.text,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {payment.packageName}
                  </Text>
                  <Text
                    className="mt-1 text-[12px]"
                    style={{
                      color: colors.textMuted,
                      fontFamily: fontFamily.figtree,
                    }}
                  >
                    {payment.schoolName}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={colors.success}
                />
              </View>

              <View
                className="mt-5 h-px"
                style={{ backgroundColor: colors.border }}
              />
              <View className="mt-4 flex-row items-center justify-between">
                <Text
                  className="text-[12px]"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  Amount paid
                </Text>
                <Text
                  className="text-[18px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {paymentAmount(payment)}
                </Text>
              </View>
              <Text
                className="mt-2 text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtree,
                }}
              >
                {paymentDate(payment.paidAt)} · {paymentMethod(payment.channel)}
              </Text>
              <Text
                selectable
                className="mt-3 text-[11px]"
                style={{
                  color: colors.textSubtle,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                Reference: {payment.providerReference}
              </Text>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => void load()}
            className="self-center rounded-full px-5 py-3 active:opacity-70"
          >
            <Text
              style={{
                color: colors.primary,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              Refresh payments
            </Text>
          </Pressable>
        </View>
      )}
    </DashboardScreen>
  );
}
