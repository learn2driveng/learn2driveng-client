import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import {
  expiryOptions,
  getExpiryDate,
  relationshipOptions,
} from "@/features/guardian-access/guardian-access-format";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useGuardianAccessStore } from "@/store/guardian-access.store";

export function NewSafetyContactScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const createGuardianInvite = useGuardianAccessStore(
    (state) => state.createGuardianInvite,
  );
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [relationship, setRelationship] =
    useState<(typeof relationshipOptions)[number]>(relationshipOptions[0]);
  const [expiry, setExpiry] =
    useState<(typeof expiryOptions)[number]>(expiryOptions[1]);

  const canSendInvite = useMemo(
    () => name.trim().length >= 2 && contact.trim().length >= 5,
    [contact, name],
  );

  const sendInvite = () => {
    if (!canSendInvite) return;

    createGuardianInvite({
      guardianName: name,
      guardianContact: contact,
      relationship: relationship.value,
      expiresAt: getExpiryDate(expiry.days),
    });
    router.replace("/student/profile/guardians");
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Add safety contact" />

      <Text
        className="mt-5 text-[13px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
      >
        Invite someone you trust. They will only be able to view live location
        during lessons you explicitly share with them.
      </Text>

      <View className="mt-7 gap-5">
        <View>
          <Text
            className="mb-2 text-[11px] uppercase tracking-[1.4px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Contact name
          </Text>
          <TextInput
            accessibilityLabel="Safety contact name"
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="e.g. Helen Jordan"
            placeholderTextColor={colors.textFaint}
            value={name}
            className="h-14 rounded-2xl border px-4 text-[15px]"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: fontFamily.figtreeMedium,
            }}
          />
        </View>

        <View>
          <Text
            className="mb-2 text-[11px] uppercase tracking-[1.4px]"
            style={{
              color: colors.textSubtle,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Phone or email
          </Text>
          <TextInput
            accessibilityLabel="Safety contact phone or email"
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setContact}
            placeholder="+234 800 000 0000 or name@email.com"
            placeholderTextColor={colors.textFaint}
            value={contact}
            className="h-14 rounded-2xl border px-4 text-[15px]"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: fontFamily.figtreeMedium,
            }}
          />
        </View>
      </View>

      <View className="mt-7">
        <Text
          className="mb-3 text-[11px] uppercase tracking-[1.4px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Relationship
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {relationshipOptions.map((item) => {
            const selected = relationship.label === item.label;

            return (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setRelationship(item)}
                className="rounded-full border px-4 py-3 active:opacity-75"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="text-[12px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mt-7">
        <Text
          className="mb-3 text-[11px] uppercase tracking-[1.4px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Access expires
        </Text>
        <View className="gap-3">
          {expiryOptions.map((item) => {
            const selected = expiry.label === item.label;

            return (
              <Pressable
                key={item.label}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setExpiry(item)}
                className="flex-row items-center rounded-2xl border p-4 active:opacity-75"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name={selected ? "radiobox-marked" : "radiobox-blank"}
                  size={21}
                  color={selected ? colors.primary : colors.textSubtle}
                />
                <Text
                  className="ml-3 text-[13px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeSemibold,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        className="mt-7 flex-row items-start gap-3 rounded-2xl p-4"
        style={{ backgroundColor: colors.verifiedSoft }}
      >
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={20}
          color={colors.verified}
        />
        <Text
          className="flex-1 text-[12px] leading-5"
          style={{ color: colors.verified, fontFamily: fontFamily.figtree }}
        >
          The invite creates limited access only. This contact will not see your
          payments, profile details, or location unless you share an active
          lesson.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSendInvite }}
        disabled={!canSendInvite}
        onPress={sendInvite}
        className="mt-7 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor: canSendInvite ? colors.primary : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: canSendInvite ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Send invite
        </Text>
        <MaterialCommunityIcons
          name="send-outline"
          size={20}
          color={canSendInvite ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
