import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { DashboardPageHeader, DashboardScreen } from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";
import { mergeVerificationDocuments } from "@/lib/school/map-api";
import { uploadSchoolVerificationDocument } from "@/lib/school/upload-verification-document";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type { ApiError, SchoolVerificationDocumentType } from "@/types";

function fileSize(value: number | null) {
  if (!value) return "Size unavailable";
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)} MB`
    : `${Math.ceil(value / 1000)} KB`;
}

export default function SchoolOnboardingDocumentsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const documents = useSchoolOperationsStore(
    (state) => state.verificationDocuments,
  );
  const hydrateFromApi = useSchoolOperationsStore(
    (state) => state.hydrateFromApi,
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] =
    useState<SchoolVerificationDocumentType | null>(null);
  const requiredComplete = documents
    .filter((document) => document.required)
    .every((document) => document.uri);

  const chooseDocument = async (type: SchoolVerificationDocumentType) => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10_000_000) {
      setError("Each document must be 10 MB or smaller.");
      return;
    }

    const template = documents.find((document) => document.type === type);
    setUploadingType(type);

    try {
      const uploaded = await uploadSchoolVerificationDocument({
        type,
        uri: asset.uri,
        fileName: asset.name,
        mimeType: asset.mimeType ?? "application/octet-stream",
        size: asset.size ?? null,
        label: template?.label,
      });
      hydrateFromApi({
        verificationDocuments: mergeVerificationDocuments(uploaded),
      });
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(
        apiError.message ||
          (caught instanceof Error
            ? caught.message
            : "We could not upload this document."),
      );
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Verification documents" />
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
          style={{ backgroundColor: colors.surfaceStrong }}
        />
      </View>
      <Text
        className="mt-7 text-[10px] uppercase tracking-[2px]"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtreeBold }}
      >
        School onboarding · Step 2 of 3
      </Text>
      <Text
        accessibilityRole="header"
        className="mt-2 text-[28px] leading-8"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        Prove your school can operate
      </Text>
      <Text
        className="mt-3 text-[13px] leading-5"
        style={{
          color: colors.textMuted,
          fontFamily: fontFamily.figtreeMedium,
        }}
      >
        Upload clear PDF, JPG, or PNG files. Required evidence must be present
        before submission.
      </Text>
      {error ? (
        <Text
          className="mt-4 text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
        >
          {error}
        </Text>
      ) : null}

      <View className="mt-7 gap-3">
        {documents.map((document) => (
          <View
            key={document.type}
            className="rounded-3xl border p-4"
            style={{
              backgroundColor: colors.surface,
              borderColor: document.uri ? colors.success : colors.border,
            }}
          >
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: document.uri
                    ? colors.successSoft
                    : colors.surfaceStrong,
                }}
              >
                <MaterialCommunityIcons
                  name={
                    document.uri ? "file-check-outline" : "file-upload-outline"
                  }
                  size={22}
                  color={document.uri ? colors.success : colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[14px]"
                  style={{
                    color: colors.text,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {document.label}
                  {document.required ? " *" : ""}
                </Text>
                <Text
                  className="mt-1 text-[11px] leading-4"
                  style={{
                    color: colors.textMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {document.description}
                </Text>
                {document.fileName ? (
                  <Text
                    numberOfLines={1}
                    className="mt-2 text-[11px]"
                    style={{
                      color: colors.success,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {document.fileName} · {fileSize(document.size)}
                  </Text>
                ) : null}
              </View>
            </View>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                disabled={uploadingType === document.type}
                onPress={() => void chooseDocument(document.type)}
                className="h-11 flex-1 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.primary }}
              >
                {uploadingType === document.type ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text
                    className="text-[12px]"
                    style={{
                      color: colors.onPrimary,
                      fontFamily: fontFamily.figtreeBold,
                    }}
                  >
                    {document.uri ? "Replace" : "Choose file"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !requiredComplete }}
        disabled={!requiredComplete}
        onPress={() => router.push("/school/onboarding/review")}
        className="mt-8 h-14 flex-row items-center justify-center gap-2 rounded-full active:opacity-80"
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
          Review application
        </Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={20}
          color={requiredComplete ? colors.onPrimary : colors.textSubtle}
        />
      </Pressable>
    </DashboardScreen>
  );
}
