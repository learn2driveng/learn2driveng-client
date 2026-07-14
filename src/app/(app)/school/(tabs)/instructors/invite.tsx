import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

const transmissionOptions = ["Automatic", "Manual"] as const;

export default function InviteInstructorScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("Wuse II Training Yard");
  const [transmissions, setTransmissions] = useState<
    Array<(typeof transmissionOptions)[number]>
  >(["Automatic"]);

  const canSendInvite = useMemo(
    () => name.trim().length >= 2 && contact.trim().length >= 5,
    [contact, name],
  );

  const toggleTransmission = (
    transmission: (typeof transmissionOptions)[number],
  ) => {
    setTransmissions((current) =>
      current.includes(transmission)
        ? current.filter((item) => item !== transmission)
        : [...current, transmission],
    );
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Invite instructor" />
      <Text
        className="mt-5 text-[13px] leading-5"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeMedium }}
      >
        Invite instructors into your school. They complete their own profile,
        then the school activates them before assignment.
      </Text>

      <View className="mt-7 gap-5">
        {[
          {
            label: "Instructor name",
            value: name,
            onChangeText: setName,
            placeholder: "e.g. Tunde Balogun",
            keyboardType: "default" as const,
          },
          {
            label: "Phone or email",
            value: contact,
            onChangeText: setContact,
            placeholder: "+234 800 000 0000 or name@email.com",
            keyboardType: "email-address" as const,
          },
          {
            label: "Assigned location",
            value: location,
            onChangeText: setLocation,
            placeholder: "Training yard or route",
            keyboardType: "default" as const,
          },
        ].map((field) => (
          <View key={field.label}>
            <Text
              className="mb-2 text-[11px] uppercase tracking-[1.4px]"
              style={{
                color: colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {field.label}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize={field.keyboardType === "email-address" ? "none" : "words"}
              keyboardType={field.keyboardType}
              onChangeText={field.onChangeText}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textFaint}
              value={field.value}
              className="h-14 rounded-2xl border px-4 text-[15px]"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                fontFamily: fontFamily.figtreeMedium,
              }}
            />
          </View>
        ))}
      </View>

      <View className="mt-7">
        <Text
          className="mb-3 text-[11px] uppercase tracking-[1.4px]"
          style={{
            color: colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Allowed vehicle types
        </Text>
        <View className="flex-row gap-3">
          {transmissionOptions.map((item) => {
            const selected = transmissions.includes(item);

            return (
              <Pressable
                key={item}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggleTransmission(item)}
                className="flex-1 rounded-2xl border p-4 active:opacity-75"
                style={{
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                }}
              >
                <MaterialCommunityIcons
                  name={selected ? "check-circle" : "circle-outline"}
                  size={20}
                  color={selected ? colors.onPrimary : colors.textSubtle}
                />
                <Text
                  className="mt-3 text-[13px]"
                  style={{
                    color: selected ? colors.onPrimary : colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View
        className="mt-7 rounded-3xl border p-4"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <Text
          className="text-[13px]"
          style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
        >
          School-controlled activation
        </Text>
        <Text
          className="mt-2 text-[12px] leading-5"
          style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
        >
          This invite does not make the instructor bookable immediately. They
          must accept, complete profile details, and be activated by the school.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSendInvite }}
        disabled={!canSendInvite}
        onPress={() => router.replace("/school/instructors")}
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
          Send instructor invite
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
