import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { CheckoutShell } from "@/features/checkout";
import { getPackageById, getSchoolById } from "@/features/school-discovery";
import { useAppTheme } from "@/hooks/use-app-theme";

const paymentMethods = [
  {
    id: "card",
    icon: "credit-card-outline" as const,
    title: "Debit or credit card",
    description: "Visa, Mastercard or Verve",
  },
  {
    id: "transfer",
    icon: "bank-transfer" as const,
    title: "Bank transfer",
    description: "Pay securely from your bank app",
  },
  {
    id: "ussd",
    icon: "cellphone-key" as const,
    title: "USSD",
    description: "Pay with a code from any phone",
  },
] as const;

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { schoolId, packageId } = useLocalSearchParams<{
    schoolId?: string;
    packageId?: string;
  }>();
  const school = getSchoolById(schoolId);
  const selectedPackage = getPackageById(schoolId, packageId);
  const [method, setMethod] = useState<(typeof paymentMethods)[number]["id"]>("card");

  if (!school || !selectedPackage) return null;

  return (
    <CheckoutShell title="Payment method" step={1} onBack={() => router.back()}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
      >
        <Text
          className="text-[26px] leading-8 tracking-[-0.6px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          How would you like to pay?
        </Text>
        <Text
          className="mt-2 text-[14px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          Select a secure payment option for your training package.
        </Text>

        <View className="mt-7 gap-3">
          {paymentMethods.map((item) => {
            const selected = item.id === method;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setMethod(item.id)}
                className="flex-row items-center rounded-3xl border-2 p-4 active:opacity-75"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: selected ? colors.primary : colors.surfaceStrong }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={selected ? colors.onPrimary : colors.text}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text
                    className="text-[15px]"
                    style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="mt-1 text-[12px]"
                    style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
                  >
                    {item.description}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={23}
                  color={selected ? colors.primary : colors.textSubtle}
                />
              </Pressable>
            );
          })}
        </View>

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <Text
            className="text-[10px] uppercase tracking-[1px]"
            style={{ color: colors.textSubtle, fontFamily: fontFamily.figtreeBold }}
          >
            Order summary
          </Text>
          <Text
            className="mt-3 text-[16px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            {selectedPackage.name}
          </Text>
          <Text
            className="mt-1 text-[12px]"
            style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
          >
            {school.name} · {selectedPackage.sessions} sessions
          </Text>
          <View className="mt-4 h-px" style={{ backgroundColor: colors.border }} />
          <View className="mt-4 flex-row items-end justify-between">
            <Text style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}>
              Total
            </Text>
            <Text
              className="text-[23px]"
              style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
            >
              ₦{selectedPackage.price.toLocaleString("en-NG")}
            </Text>
          </View>
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
            router.push({
              pathname: "/student/explore/[schoolId]/checkout/review",
              params: { schoolId: school.id, packageId: selectedPackage.id, method },
            })
          }
          className="h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <Text
            className="text-[15px]"
            style={{ color: colors.onPrimary, fontFamily: fontFamily.figtreeBold }}
          >
            Review payment
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>
    </CheckoutShell>
  );
}
