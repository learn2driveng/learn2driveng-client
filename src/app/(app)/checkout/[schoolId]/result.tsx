import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { getPackageById, getSchoolById } from "@/sample_data";

type CheckoutResultStatus = "success" | "pending" | "failed" | "cancelled";

const resultStatuses: readonly CheckoutResultStatus[] = [
  "success",
  "pending",
  "failed",
  "cancelled",
];

function isCheckoutResultStatus(
  status: string | undefined,
): status is CheckoutResultStatus {
  return resultStatuses.some((item) => item === status);
}

export default function CheckoutResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const { schoolId, packageId, method, status } = useLocalSearchParams<{
    schoolId?: string;
    packageId?: string;
    method?: string;
    status?: string;
  }>();
  const school = getSchoolById(schoolId);
  const selectedPackage = getPackageById(schoolId, packageId);
  const resultStatus = isCheckoutResultStatus(status) ? status : "success";

  if (!school || !selectedPackage) return null;

  const retryPayment = () =>
    router.replace({
      pathname: "/checkout/[schoolId]/payment",
      params: {
        schoolId: school.id,
        packageId: selectedPackage.id,
        ...(typeof method === "string" ? { method } : {}),
      },
    });

  const content = {
    success: {
      icon: "check" as const,
      iconBackground: colors.success,
      iconColor: colors.contrastText,
      title: "Package unlocked",
      description: `Your ${selectedPackage.numberOfLessons} sessions with ${school.name} are ready to book.`,
      statusLabel: "Payment successful",
      statusColor: colors.success,
    },
    pending: {
      icon: "clock-outline" as const,
      iconBackground: colors.primary,
      iconColor: colors.onPrimary,
      title: "Payment processing",
      description:
        "We’re still confirming your payment. Your package will appear as soon as confirmation is complete.",
      statusLabel: "Confirmation pending",
      statusColor: colors.primary,
    },
    failed: {
      icon: "close" as const,
      iconBackground: colors.error,
      iconColor: colors.contrastText,
      title: "Payment unsuccessful",
      description:
        "Your payment could not be completed. You have not been charged for this package.",
      statusLabel: "Payment failed",
      statusColor: colors.error,
    },
    cancelled: {
      icon: "close" as const,
      iconBackground: colors.textSubtle,
      iconColor: colors.contrastText,
      title: "Payment cancelled",
      description:
        "The payment was cancelled before completion. No package or session credit was added.",
      statusLabel: "Payment cancelled",
      statusColor: colors.textSubtle,
    },
  }[resultStatus];

  return (
    <View
      className="flex-1 px-6"
      style={{
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 20),
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-1 items-center justify-center">
        <View
          accessibilityElementsHidden
          className="h-28 w-28 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: content.iconBackground }}
          >
            <MaterialCommunityIcons
              name={content.icon}
              size={42}
              color={content.iconColor}
            />
          </View>
        </View>
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          className="mt-8 text-center text-[30px] leading-9 tracking-[-0.8px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          {content.title}
        </Text>
        <Text
          className="mt-3 max-w-[330px] text-center text-[14px] leading-6"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          {content.description}
        </Text>

        {resultStatus === "pending" ? (
          <View
            className="mt-5 flex-row items-start gap-3 rounded-2xl border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={colors.textMuted}
            />
            <Text
              className="flex-1 text-[12px] leading-5"
              style={{
                color: colors.textMuted,
                fontFamily: fontFamily.figtreeMedium,
              }}
            >
              Please don’t make another payment while this one is processing.
            </Text>
          </View>
        ) : null}

        <View
          className="mt-7 w-full rounded-3xl border p-5"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.surfaceStrong }}
            >
              <MaterialCommunityIcons
                name="ticket-confirmation-outline"
                size={25}
                color={colors.primary}
              />
            </View>
            <View className="ml-4 flex-1">
              <Text
                className="text-[15px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {selectedPackage.name}
              </Text>
              <Text
                className="mt-1 text-[12px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtree,
                }}
              >
                {selectedPackage.numberOfLessons} session credits ·{" "}
                {selectedPackage.durationInDays} days
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: content.statusColor }}
                />
                <Text
                  className="text-[11px]"
                  style={{
                    color: content.statusColor,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {content.statusLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3">
        {resultStatus === "success" ? (
          <>
            <ResultButton
              label="Book first lesson"
              icon="arrow-right"
              onPress={() =>
                router.replace({
                  pathname: "/student/sessions/book",
                  params: {
                    packageName: selectedPackage.name,
                    schoolName: school.name,
                  },
                })
              }
            />
            <ResultButton
              secondary
              label="View my packages"
              onPress={() => router.replace("/student/sessions")}
            />
          </>
        ) : null}

        {resultStatus === "pending" ? (
          <>
            <ResultButton
              label="Back to dashboard"
              icon="arrow-right"
              onPress={() => router.replace("/student")}
            />
            <ResultButton
              secondary
              label="Get payment help"
              onPress={() => router.push("/student/profile/support")}
            />
          </>
        ) : null}

        {resultStatus === "failed" ? (
          <>
            <ResultButton
              label="Try payment again"
              icon="refresh"
              onPress={retryPayment}
            />
            <ResultButton
              secondary
              label="Get payment help"
              onPress={() => router.push("/student/profile/support")}
            />
          </>
        ) : null}

        {resultStatus === "cancelled" ? (
          <>
            <ResultButton
              label="Return to payment"
              icon="arrow-right"
              onPress={retryPayment}
            />
            <ResultButton
              secondary
              label="Back to Explore"
              onPress={() => router.replace("/student/explore")}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

type ResultButtonProps = {
  label: string;
  icon?: "arrow-right" | "refresh";
  secondary?: boolean;
  onPress: () => void;
};

function ResultButton({
  label,
  icon,
  secondary = false,
  onPress,
}: ResultButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="h-14 flex-row items-center justify-center gap-2 rounded-full border active:opacity-80"
      style={{
        backgroundColor: secondary ? colors.surface : colors.primary,
        borderColor: secondary ? colors.border : colors.primary,
      }}
    >
      <Text
        className="text-[15px]"
        style={{
          color: secondary ? colors.text : colors.onPrimary,
          fontFamily: fontFamily.figtreeBold,
        }}
      >
        {label}
      </Text>
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={secondary ? colors.text : colors.onPrimary}
        />
      ) : null}
    </Pressable>
  );
}
