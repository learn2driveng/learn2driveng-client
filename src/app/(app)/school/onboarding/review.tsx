import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolOnboardingReviewScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const documents = useSchoolOperationsStore(
    (state) => state.verificationDocuments,
  );
  const submit = useSchoolOperationsStore(
    (state) => state.submitVerificationApplication,
  );
  const underReview = profile.verificationStatus === "pending_review";
  const requiredComplete = documents
    .filter((document) => document.required)
    .every((document) => document.uri);

  if (underReview) {
    return (
      <DashboardScreen>
        <DashboardPageHeader title="Verification status" />
        <AppLogo height={52} className="mt-6" />
        <View className="flex-1 items-center justify-center py-20">
          <View
            className="h-20 w-20 items-center justify-center rounded-[26px]"
            style={{ backgroundColor: colors.verifiedSoft }}
          >
            <MaterialCommunityIcons
              name="shield-search"
              size={38}
              color={colors.verified}
            />
          </View>
          <Text
            accessibilityRole="header"
            className="mt-7 text-center text-[28px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Verification in review
          </Text>
          <Text
            className="mt-3 max-w-[360px] text-center text-[13px] leading-5"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            Your school cannot publish packages or receive learner bookings
            until the platform approves the submitted evidence.
          </Text>
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Review application" />
      <View className="mt-7 flex-row items-center gap-2">
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
      </View>
      <Text
        className="mt-7 text-[10px] uppercase tracking-[2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        School onboarding · Step 3 of 3
      </Text>
      <Text
        accessibilityRole="header"
        className="mt-2 text-[28px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Ready for verification
      </Text>
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Confirm the operator identity and required evidence before sending this
        application for platform review.
      </Text>

      <View className="mt-8">
        <SectionHeader title="School identity" />
        <View
          className="mt-4 rounded-3xl border p-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {[
            ["School", profile.name],
            ["FRSC number", profile.frscRegistrationNumber],
            ["Address", profile.address],
            ["Contact", profile.email],
          ].map(([label, value]) => (
            <View key={label} className="flex-row justify-between gap-4 py-3">
              <Text
                className="text-[11px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {label}
              </Text>
              <Text
                className="flex-1 text-right text-[11px]"
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
      </View>
      <View className="mt-8">
        <SectionHeader title="Evidence" />
        <View className="mt-4 gap-2">
          {documents
            .filter((document) => document.required)
            .map((document) => (
              <View
                key={document.type}
                className="flex-row items-center gap-3 rounded-2xl border p-3"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name={document.uri ? "check-circle" : "alert-circle"}
                  size={20}
                  color={document.uri ? colors.success : colors.error}
                />
                <Text
                  className="flex-1 text-[12px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {document.label}
                </Text>
              </View>
            ))}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !requiredComplete }}
        disabled={!requiredComplete}
        onPress={() => {
          if (submit()) router.replace("/school/onboarding/review");
        }}
        className="mt-8 h-14 items-center justify-center rounded-full active:opacity-80"
        style={{
          backgroundColor: requiredComplete
            ? colors.primary
            : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: requiredComplete ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Submit for verification
        </Text>
      </Pressable>
    </DashboardScreen>
  );
}
