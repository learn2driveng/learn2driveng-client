import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSchoolOperationsStore } from "@/store/school-operations.store";

export default function SchoolOnboardingIdentityScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const updateProfile = useSchoolOperationsStore(
    (state) => state.updateProfile,
  );
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [primaryLocation, setPrimaryLocation] = useState(
    profile.primaryLocation,
  );
  const [address, setAddress] = useState(profile.address);
  const [description, setDescription] = useState(profile.description);
  const complete = [
    name,
    email,
    phone,
    primaryLocation,
    address,
    description,
  ].every((value) => value.trim());

  const input = (
    label: string,
    value: string,
    onChangeText: (value: string) => void,
    multiline = false,
  ) => (
    <View>
      <Text
        className="mb-2 text-[10px] uppercase tracking-[1.2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        className={`rounded-2xl border px-4 text-[14px] ${multiline ? "min-h-28 py-4" : "h-14"}`}
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          color: colors.text,
          fontFamily: fontFamily.figtreeMedium,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );

  return (
    <DashboardScreen>
      <DashboardPageHeader title="School verification" />
      <AppLogo height={52} className="mt-6" />
      <View className="mt-7 flex-row items-center gap-2">
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.primary }}
        />
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        />
        <View
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: colors.surfaceStrong }}
        />
      </View>
      <Text
        className="mt-7 text-[10px] uppercase tracking-[2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        School onboarding · Step 1 of 3
      </Text>
      <Text
        accessibilityRole="header"
        className="mt-2 text-[28px] leading-8"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Tell us about your school
      </Text>
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        These details identify the accountable operator and become the
        foundation of your public marketplace profile.
      </Text>

      <View className="mt-8 gap-5">
        {input("Registered school name", name, setName)}
        {input("Operations email", email, setEmail)}
        {input("Phone number", phone, setPhone)}
        {input("Primary operating area", primaryLocation, setPrimaryLocation)}
        {input("Registered address", address, setAddress)}
        {input("School description", description, setDescription, true)}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !complete }}
        disabled={!complete}
        onPress={() => {
          updateProfile({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            primaryLocation: primaryLocation.trim(),
            address: address.trim(),
            description: description.trim(),
          });
          router.push("/school/onboarding/documents");
        }}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor: complete ? colors.primary : colors.surfaceStrong,
        }}
      >
        <Text
          className="text-[15px]"
          style={{
            color: complete ? colors.onPrimary : colors.textSubtle,
            fontFamily: fontFamily.figtreeBold,
          }}
        >
          Continue to documents
        </Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={complete ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
