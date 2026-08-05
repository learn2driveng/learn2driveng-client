import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { updateMyDrivingSchool } from "@/lib/api";
import { hydrateSchoolFromRecord } from "@/lib/school/hydrate-school-operations";
import { useAuthStore } from "@/store/auth.store";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError } from "@/types";

export default function SchoolProfileScreen() {
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const profile = useSchoolOperationsStore((state) => state.profile);
  const updateProfile = useSchoolOperationsStore(
    (state) => state.updateProfile,
  );
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [primaryLocation, setPrimaryLocation] = useState(
    profile.primaryLocation,
  );
  const [address, setAddress] = useState(profile.address);
  const [description, setDescription] = useState(profile.description);
  const [operatingAreas, setOperatingAreas] = useState(profile.operatingAreas);
  const [areaDraft, setAreaDraft] = useState("");
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const canSave =
    [name, email, phone, primaryLocation, address, description].every(
      (value) => value.trim().length > 0,
    ) && operatingAreas.length > 0;

  useEffect(() => {
    if (!profile.id) return;
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setPrimaryLocation(profile.primaryLocation);
    setAddress(profile.address);
    setDescription(profile.description);
    setOperatingAreas(profile.operatingAreas);
    setSaved(true);
  }, [profile.id]);

  const addOperatingArea = () => {
    const area = areaDraft.trim();
    if (
      !area ||
      operatingAreas.some((item) => item.toLowerCase() === area.toLowerCase())
    )
      return;
    setOperatingAreas((current) => [...current, area]);
    setAreaDraft("");
    setSaved(false);
  };

  const removeOperatingArea = (area: string) => {
    setOperatingAreas((current) => current.filter((item) => item !== area));
    setSaved(false);
  };

  const field = (
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
        multiline={multiline}
        onChangeText={(nextValue) => {
          onChangeText(nextValue);
          setSaved(false);
        }}
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
      <DashboardPageHeader title="School profile" />
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Maintain the public marketplace information learners use when evaluating
        your school.
      </Text>

      <View className="mt-8">
        <SectionHeader title="Verification" />
        <View
          className="mt-4 p-4 border rounded-3xl"
          style={{
            backgroundColor: colors.successSoft,
            borderColor: colors.success,
            ...surfaces.floating,
          }}
        >
          <View className="flex-row items-center gap-3">
            <MaterialCommunityIcons
              name="check-decagram"
              size={24}
              color={colors.success}
            />
            <View className="flex-1">
              <Text
                className="text-[14px] capitalize"
                style={{
                  color: colors.success,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {profile.verificationStatus.replace("_", " ")}
              </Text>
              <Text
                className="mt-1 text-[11px]"
                style={{
                  color: colors.textMuted,
                  fontFamily: fontFamily.figtreeMedium,
                }}
              >
                {profile.frscRegistrationNumber}
              </Text>
            </View>
          </View>
          <Text
            className="mt-3 text-[11px] leading-4"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeMedium,
            }}
          >
            Legal school name and FRSC registration changes require platform
            review. Marketplace contact and description changes can be saved
            locally.
          </Text>
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Public profile" />
        <Text
          className="mt-2 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          This content appears on the school page learners browse.
        </Text>
        <View
          className="gap-5 mt-4 p-4 border rounded-3xl"
          style={surfaces.card}
        >
          {field("Marketplace display name", name, setName)}
          {field("About the school", description, setDescription, true)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Contact and location" />
        <View
          className="gap-5 mt-4 p-4 border rounded-3xl"
          style={surfaces.card}
        >
          {field("Operations email", email, setEmail)}
          {field("Phone number", phone, setPhone)}
          {field("Primary location", primaryLocation, setPrimaryLocation)}
          {field("Street address", address, setAddress)}
        </View>
      </View>

      <View className="mt-8">
        <SectionHeader title="Operating areas" />
        <Text
          className="mt-2 text-[11px] leading-4"
          style={{
            color: colors.textMuted,
            fontFamily: fontFamily.figtreeMedium,
          }}
        >
          Add the neighbourhoods and routes where learners can book training.
        </Text>
        <View className="flex-row gap-2 mt-4">
          <TextInput
            accessibilityLabel="New operating area"
            value={areaDraft}
            onChangeText={setAreaDraft}
            onSubmitEditing={addOperatingArea}
            placeholder="e.g. Asokoro"
            placeholderTextColor={colors.textFaint}
            returnKeyType="done"
            className="flex-1 px-4 border rounded-2xl h-12 text-[14px]"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: fontFamily.figtreeMedium,
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add operating area"
            accessibilityState={{ disabled: !areaDraft.trim() }}
            disabled={!areaDraft.trim()}
            onPress={addOperatingArea}
            className="justify-center items-center active:opacity-80 rounded-2xl w-12 h-12"
            style={{
              backgroundColor: areaDraft.trim()
                ? colors.primary
                : colors.surfaceStrong,
            }}
          >
            <MaterialCommunityIcons
              name="plus"
              size={21}
              color={areaDraft.trim() ? colors.onPrimary : colors.textSubtle}
            />
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-2 mt-4">
          {operatingAreas.map((area) => (
            <Pressable
              key={area}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${area}`}
              onPress={() => removeOperatingArea(area)}
              className="flex-row items-center gap-1.5 active:opacity-70 px-3 py-2 border rounded-full"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-[11px]"
                style={{
                  color: colors.text,
                  fontFamily: fontFamily.figtreeBold,
                }}
              >
                {area}
              </Text>
              <MaterialCommunityIcons
                name="close"
                size={14}
                color={colors.textSubtle}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave || saved || isSaving }}
        disabled={!canSave || saved || isSaving}
        onPress={async () => {
          if (!canSave || saved || isSaving) return;

          setSaveError(null);
          setIsSaving(true);

          try {
            const school = await updateMyDrivingSchool({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              description: description.trim(),
              addressLine1: address.trim(),
              city: primaryLocation.trim(),
            });
            const adminName = user
              ? `${user.firstName} ${user.lastName}`.trim()
              : profile.adminName;
            hydrateSchoolFromRecord(school, adminName);
            updateProfile({
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              primaryLocation: primaryLocation.trim(),
              address: address.trim(),
              description: description.trim(),
              operatingAreas,
            });
            setSaved(true);
          } catch (caught) {
            const error = caught as ApiError;
            setSaveError(error.message || "We could not save your profile.");
          } finally {
            setIsSaving(false);
          }
        }}
        className="flex-row justify-center items-center gap-2 active:opacity-80 mt-8 rounded-2xl h-14"
        style={{
          backgroundColor:
            canSave && !saved && !isSaving
              ? colors.primary
              : colors.surfaceStrong,
        }}
      >
        {isSaving ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <>
            <MaterialCommunityIcons
              name={saved ? "check" : "content-save-outline"}
              size={20}
              color={canSave && !saved ? colors.onPrimary : colors.textSubtle}
            />
            <Text
              className="text-[15px]"
              style={{
                color: canSave && !saved ? colors.onPrimary : colors.textSubtle,
                fontFamily: fontFamily.figtreeBold,
              }}
            >
              {saved ? "Profile up to date" : "Save profile"}
            </Text>
          </>
        )}
      </Pressable>
      {saveError ? (
        <Text
          className="mt-3 text-center text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeMedium }}
        >
          {saveError}
        </Text>
      ) : null}
    </DashboardScreen>
  );
}
