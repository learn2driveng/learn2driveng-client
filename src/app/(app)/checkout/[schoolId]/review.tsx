import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { CheckoutShell } from "@/features/checkout";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getPackageById, getSchoolById } from "@/sample_data";
import { getSamplePaymentResult } from "@/sample_data/payment-results";

const methodLabels: Record<string, string> = {
  card: "Debit or credit card",
  transfer: "Bank transfer",
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
  const school = getSchoolById(schoolId);
  const selectedPackage = getPackageById(schoolId, packageId);

  if (!school || !selectedPackage) return null;

  const rows = [
    ["Driving school", school.name],
    ["Training package", selectedPackage.name],
    ["Duration", `${selectedPackage.durationInDays} days`],
    ["Sessions", `${selectedPackage.numberOfLessons} lessons`],
    ["Payment method", methodLabels[method] ?? methodLabels.card],
  ];

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
          Your sessions become available immediately after payment.
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

        <View
          className="mt-5 flex-row items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: colors.verifiedSoft }}
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={19}
            color={colors.verified}
          />
          <Text
            className="flex-1 text-[12px] leading-5"
            style={{
              color: colors.verified,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            By paying, you agree to the school’s cancellation and rescheduling
            policy.
          </Text>
        </View>
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
          onPress={() =>
            router.replace({
              pathname: "/checkout/[schoolId]/result",
              params: {
                schoolId: school.id,
                packageId: selectedPackage.id,
                method,
                status: getSamplePaymentResult(method),
              },
            })
          }
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
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
        </Pressable>
      </View>
    </CheckoutShell>
  );
}
