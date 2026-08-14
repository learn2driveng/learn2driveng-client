import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";

import { HeroSurface } from "@/components/common/surface";
import { useToast } from "@/components/common/toast";
import {
  DashboardPageHeader,
  DashboardScreen,
  SectionHeader,
} from "@/components/dashboard";
import { fontFamily } from "@/constants/fonts";
import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { mergeVerificationDocuments } from "@/lib/school/map-api";
import { uploadSchoolVerificationDocument } from "@/lib/school/upload-verification-document";
import { useSchoolOperationsStore } from "@/store/school-operations.store";
import type {
  ApiError,
  DrivingSchoolVerificationDocumentStatus,
  SchoolVerificationDocument,
  SchoolVerificationDocumentType,
} from "@/types";

type VerificationDocumentsScreenProps = {
  mode: "onboarding" | "management";
};

function fileSize(value: number | null) {
  if (!value) return "Size unavailable";
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)} MB`
    : `${Math.ceil(value / 1000)} KB`;
}

function documentStatus(document: SchoolVerificationDocument): {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  status: DrivingSchoolVerificationDocumentStatus | "missing";
} {
  if (!document.uri) {
    return { label: "Missing", icon: "alert-circle-outline", status: "missing" };
  }
  if (document.status === "approved") {
    return { label: "Approved", icon: "check-decagram", status: "approved" };
  }
  if (document.status === "rejected") {
    return { label: "Needs attention", icon: "alert-outline", status: "rejected" };
  }
  return { label: "Awaiting review", icon: "clock-outline", status: "uploaded" };
}

export function VerificationDocumentsScreen({
  mode,
}: VerificationDocumentsScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
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
  const approvedCount = documents.filter(
    (document) => document.status === "approved",
  ).length;
  const awaitingCount = documents.filter(
    (document) => document.uri && (!document.status || document.status === "uploaded"),
  ).length;
  const attentionCount = documents.filter(
    (document) => document.status === "rejected" || (document.required && !document.uri),
  ).length;

  const chooseDocument = async (type: SchoolVerificationDocumentType) => {
    setError(null);
    try {
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
      showToast(
        template?.uri ? "Document replaced successfully." : "Document uploaded successfully.",
      );
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

  const openDocument = async (document: SchoolVerificationDocument) => {
    if (!document.uri) return;
    setError(null);
    try {
      await Linking.openURL(document.uri);
    } catch {
      setError("We could not open this document.");
    }
  };

  return (
    <DashboardScreen>
      <DashboardPageHeader title="Verification documents" />

      {mode === "onboarding" ? (
        <>
          <View className="mt-7 flex-row items-center gap-2">
            {[true, true, false].map((complete, index) => (
              <View
                key={index}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: complete
                    ? colors.primary
                    : colors.surfaceStrong,
                }}
              />
            ))}
          </View>
          <Text
            className="mt-7 text-[10px] uppercase tracking-[2px]"
            style={{
              color: colors.textMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
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
            Upload clear PDF, JPG, or PNG files. Required evidence must be
            present before submission.
          </Text>
        </>
      ) : (
        <HeroSurface
          className="mt-7 overflow-hidden"
          style={{ borderRadius: 30, padding: 20 }}
        >
          <Text
            className="text-[11px] uppercase tracking-[1.3px]"
            style={{
              color: colors.contrastMuted,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            Compliance records
          </Text>
          <Text
            className="mt-2 text-[22px]"
            style={{
              color: colors.contrastText,
              fontFamily: fontFamily.figtreeBold,
            }}
          >
            School verification
          </Text>
          <View
            className="mt-5 flex-row border-t pt-4"
            style={{ borderTopColor: colors.contrastBorder }}
          >
            {[
              [String(approvedCount), "Approved"],
              [String(awaitingCount), "In review"],
              [String(attentionCount), "Attention"],
            ].map(([value, label], index) => (
              <View
                key={label}
                className="flex-1"
                style={
                  index
                    ? {
                        borderLeftWidth: 1,
                        borderLeftColor: colors.contrastBorder,
                        paddingLeft: 14,
                      }
                    : undefined
                }
              >
                <Text
                  className="text-[20px]"
                  style={{
                    color: colors.contrastText,
                    fontFamily: fontFamily.figtreeBold,
                  }}
                >
                  {value}
                </Text>
                <Text
                  className="mt-1 text-[10px]"
                  style={{
                    color: colors.contrastMuted,
                    fontFamily: fontFamily.figtreeMedium,
                  }}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </HeroSurface>
      )}

      {error ? (
        <Text
          className="mt-5 text-[12px]"
          style={{ color: colors.error, fontFamily: fontFamily.figtreeBold }}
        >
          {error}
        </Text>
      ) : null}

      <View className="mt-8">
        <SectionHeader title="Required evidence" />
        <View className="mt-4 gap-3">
          {documents.map((document) => {
            const meta = documentStatus(document);
            const statusColor =
              meta.status === "approved"
                ? colors.success
                : meta.status === "rejected" || meta.status === "missing"
                  ? colors.error
                  : colors.primary;

            return (
              <View
                key={document.type}
                className="rounded-3xl border p-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor:
                    meta.status === "rejected" ? colors.error : colors.border,
                }}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: colors.surfaceStrong }}
                  >
                    <MaterialCommunityIcons
                      name={meta.icon}
                      size={22}
                      color={statusColor}
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text
                        className="flex-1 text-[14px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {document.label}
                        {document.required ? " *" : ""}
                      </Text>
                      <View
                        className="rounded-full px-2.5 py-1"
                        style={{ backgroundColor: colors.surfaceStrong }}
                      >
                        <Text
                          className="text-[9px]"
                          style={{
                            color: statusColor,
                            fontFamily: fontFamily.figtreeBold,
                          }}
                        >
                          {meta.label}
                        </Text>
                      </View>
                    </View>
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
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        {document.fileName} · {fileSize(document.size)}
                      </Text>
                    ) : null}
                    {document.reviewNotes ? (
                      <Text
                        className="mt-2 text-[11px] leading-4"
                        style={{
                          color: colors.error,
                          fontFamily: fontFamily.figtreeMedium,
                        }}
                      >
                        {document.reviewNotes}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View className="mt-4 flex-row gap-3">
                  <Pressable
                    accessibilityRole="button"
                    disabled={uploadingType === document.type}
                    onPress={() => void chooseDocument(document.type)}
                    className="h-11 flex-1 items-center justify-center rounded-full active:opacity-80"
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: borderRadius.button,
                    }}
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
                  {document.uri ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void openDocument(document)}
                      className="h-11 flex-1 items-center justify-center rounded-full border active:opacity-75"
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: borderRadius.button,
                      }}
                    >
                      <Text
                        className="text-[12px]"
                        style={{
                          color: colors.text,
                          fontFamily: fontFamily.figtreeBold,
                        }}
                      >
                        View file
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {mode === "onboarding" ? (
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
            borderRadius: borderRadius.button,
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
      ) : null}
    </DashboardScreen>
  );
}
