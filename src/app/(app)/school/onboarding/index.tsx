import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { AddressAutocompleteField } from "@/components/school/address-autocomplete-field";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { createDrivingSchool } from "@/lib/api";
import { hydrateSchoolFromRecord } from "@/lib/school/hydrate-school-operations";
import { isValidEmail } from "@/lib/auth/validation";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { AddressSuggestion, ApiError } from "@/types";

export default function SchoolOnboardingIdentityScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const updateProfile = useSchoolOperationsStore(
    (state) => state.updateProfile,
  );
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [address, setAddress] = useState(profile.address);
  const [selectedAddress, setSelectedAddress] =
    useState<AddressSuggestion | null>(
      profile.latitude != null && profile.longitude != null
        ? {
            id: `school-${profile.id}`,
            formattedAddress: profile.address,
            addressLine1: profile.addressLine1,
            addressLine2: profile.addressLine2 ?? null,
            city: profile.city,
            state: profile.state,
            country: profile.country,
            latitude: profile.latitude,
            longitude: profile.longitude,
          }
        : null,
    );
  const [description, setDescription] = useState(profile.description);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAddressError, setShowAddressError] = useState(false);
  const complete =
    [name, phone, description].every((value) => value.trim()) &&
    isValidEmail(email) &&
    selectedAddress !== null;

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

  const continueToDocuments = async () => {
    if (!selectedAddress) {
      setShowAddressError(true);
      return;
    }
    if (!complete || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const school = await createDrivingSchool({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2 ?? undefined,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        description: description.trim(),
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
      });

      const adminName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : profile.adminName;
      hydrateSchoolFromRecord(school, adminName);

      const primaryLocation = [selectedAddress.city, selectedAddress.state]
        .filter((part, index, parts) => part && parts.indexOf(part) === index)
        .join(", ");
      updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        primaryLocation,
        address: selectedAddress.formattedAddress,
        addressLine1: selectedAddress.addressLine1,
        addressLine2: selectedAddress.addressLine2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        country: selectedAddress.country,
        latitude: selectedAddress.latitude,
        longitude: selectedAddress.longitude,
        description: description.trim(),
      });
      router.push("/school/onboarding/documents");
    } catch (caught) {
      const error = caught as ApiError;
      setSubmitError(
        error.message || "We could not create the school profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <AddressAutocompleteField
          value={address}
          selectedAddress={selectedAddress}
          onChangeText={(value) => {
            setAddress(value);
            setSelectedAddress(null);
            setShowAddressError(false);
          }}
          onSelectAddress={(selection) => {
            setAddress(selection.formattedAddress);
            setSelectedAddress(selection);
            setShowAddressError(false);
          }}
          error={
            showAddressError && !selectedAddress
              ? "Select an address suggestion to confirm its location."
              : null
          }
        />
        {input("School description", description, setDescription, true)}
      </View>

      {submitError ? (
        <Text
          accessibilityRole="alert"
          className="mt-5 text-[12px] leading-5"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
        >
          {submitError}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !complete || isSubmitting }}
        disabled={!complete || isSubmitting}
        onPress={() => void continueToDocuments()}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
        style={{
          backgroundColor:
            complete && !isSubmitting ? colors.primary : colors.surfaceStrong,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color={colors.textSubtle} />
        ) : (
          <>
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
          </>
        )}
      </Pressable>
    </DashboardScreen>
  );
}
