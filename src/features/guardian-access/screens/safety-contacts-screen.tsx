import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import {
  formatGuardianDate,
  formatGuardianStatus,
} from "@/features/guardian-access/guardian-access-format";
import { useAppTheme } from "@/hooks/use-app-theme";
import { studentProfile } from "@/sample_data/student";
import { useGuardianAccessStore } from "@/store/guardian-access.store";

export function SafetyContactsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const guardianLinks = useGuardianAccessStore((state) => state.guardianLinks);
  const resendGuardianInvite = useGuardianAccessStore(
    (state) => state.resendGuardianInvite,
  );
  const revokeGuardianLink = useGuardianAccessStore(
    (state) => state.revokeGuardianLink,
  );
  const learnerGuardianLinks = guardianLinks.filter(
    (link) => link.learnerId === studentProfile.id,
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Safety contacts" />

      <View
        className="mt-7 overflow-hidden rounded-[28px] p-5"
        style={{ backgroundColor: colors.contrastSurface }}
      >
        <View className="flex-row items-start gap-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.primary }}
          >
            <MaterialCommunityIcons
              name="shield-account"
              size={25}
              color={colors.onPrimary}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[18px]"
              style={{
                color: colors.contrastText,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              You control access
            </Text>
            <Text
              className="mt-2 text-[12px] leading-5"
              style={{
                color: colors.contrastMuted,
                fontFamily: fontFamily.figtree,
              }}
            >
              Safety contacts can only see your live location during an active
              lesson, after you choose to share it.
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader
          title={`Linked contacts · ${learnerGuardianLinks.length}`}
        />
        <View className="mt-4 gap-4">
          {learnerGuardianLinks.map((link) => {
            const active = link.status === "active";
            const revoked = link.status === "revoked";
            const canResend = link.status === "pending";

            return (
              <View
                key={link.id}
                className="rounded-3xl border p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <Text
                      className="text-[13px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {link.guardianInitials}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-[15px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {link.guardianName}
                    </Text>
                    <Text
                      className="mt-1 text-[11px]"
                      style={{
                        color: colors.textMuted,
                        fontFamily: fontFamily.figtreeMedium,
                      }}
                    >
                      {link.guardianContact}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{
                      backgroundColor: active
                        ? colors.successSoft
                        : colors.surfaceStrong,
                    }}
                  >
                    <Text
                      className="text-[10px] capitalize"
                      style={{
                        color: active ? colors.success : colors.textMuted,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      {formatGuardianStatus(link.status)}
                    </Text>
                  </View>
                </View>

                <View
                  className="my-4 h-px"
                  style={{ backgroundColor: colors.border }}
                />

                <View className="gap-3">
                  {[
                    ["Invite", formatGuardianStatus(link.inviteStatus)],
                    ["Expires", formatGuardianDate(link.expiresAt)],
                    ["Last viewed", formatGuardianDate(link.lastAccessedAt)],
                  ].map(([label, value]) => (
                    <View
                      key={label}
                      className="flex-row items-center justify-between gap-4"
                    >
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
                          fontFamily: fontFamily.figtreeSemibold,
                        }}
                      >
                        {value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-5 flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canResend }}
                    disabled={!canResend}
                    onPress={() => resendGuardianInvite(link.id)}
                    className="min-h-12 flex-1 items-center justify-center rounded-full border active:opacity-70"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      opacity: canResend ? 1 : 0.45,
                    }}
                  >
                    <Text
                      className="text-[12px]"
                      style={{
                        color: colors.text,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Resend invite
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: revoked }}
                    disabled={revoked}
                    onPress={() => revokeGuardianLink(link.id)}
                    className="min-h-12 flex-1 items-center justify-center rounded-full border active:opacity-70"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.error,
                      opacity: revoked ? 0.45 : 1,
                    }}
                  >
                    <Text
                      className="text-[12px]"
                      style={{
                        color: colors.error,
                        fontFamily: fontFamily.figtreeBold,
                      }}
                    >
                      Revoke
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/student/profile/guardians/new")}
        className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{ backgroundColor: colors.primary }}
      >
        <MaterialCommunityIcons
          name="account-plus-outline"
          size={21}
          color={colors.onPrimary}
        />
        <Text
          className="text-[15px]"
          style={{
            color: colors.onPrimary,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Add safety contact
        </Text>
      </Pressable>

      <View
        className="mt-6 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.verifiedSoft }}
      >
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={colors.verified}
        />
        <Text
          className="flex-1 text-[12px] leading-5"
          style={{ color: colors.verified, fontFamily: fontFamily.figtree }}
        >
          Adding a contact does not share your location automatically. You still
          choose who can view each active lesson.
        </Text>
      </View>
    </DashboardScreen>
  );
}
