import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { useToast } from "@/components/common/toast";
import { ThemeSelector } from "@/components/common/theme-selector";
import { useSurfaceStyles } from "@/components/common/surface";
import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useLogout } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  fetchMyInstructorPhotoSubmission,
  fetchMyProfile,
} from "@/lib/api/users";
import type { InstructorPhotoSubmission } from "@/lib/api/users";
import { uploadOwnInstructorPhoto } from "@/lib/instructor/upload-own-photo";
import { useAuthStore } from "@/store/auth.store";
import { useInstructorOperationsStore } from "@/store/instructor-operations.store";

function Divider() {
  const { colors } = useAppTheme();
  return (
    <View className="mx-4 h-px" style={{ backgroundColor: colors.border }} />
  );
}

export default function InstructorProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const profile = useInstructorOperationsStore((state) => state.profile);
  const setProfilePhoto = useInstructorOperationsStore(
    (state) => state.setProfilePhoto,
  );
  const updateUser = useAuthStore((state) => state.updateUser);
  const { showToast } = useToast();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [photoSubmission, setPhotoSubmission] =
    useState<InstructorPhotoSubmission | null>(null);
  const { logout, isLoggingOut } = useLogout();

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void fetchMyProfile()
        .then((user) => {
          if (!active) return;
          updateUser(user);
          setProfilePhoto(user.profilePhoto ?? null);
          setPhotoFailed(false);
        })
        .catch(() => undefined);
      void fetchMyInstructorPhotoSubmission()
        .then((submission) => {
          if (active) setPhotoSubmission(submission);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, [setProfilePhoto, updateUser]),
  );

  const refresh = useCallback(async () => {
    const [user, submission] = await Promise.all([
      fetchMyProfile(),
      fetchMyInstructorPhotoSubmission(),
    ]);
    updateUser(user);
    setProfilePhoto(user.profilePhoto ?? null);
    setPhotoFailed(false);
    setPhotoSubmission(submission);
  }, [setProfilePhoto, updateUser]);

  const choosePhoto = async () => {
    if (isUploadingPhoto) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      setIsUploadingPhoto(true);
      const submission = await uploadOwnInstructorPhoto({
        uri: asset.uri,
        fileName: asset.fileName ?? "instructor-photo.jpg",
        mimeType: asset.mimeType,
        size: asset.fileSize,
      });
      setPhotoSubmission(submission);
      showToast("Photo sent to your school for approval.");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Your photo could not be uploaded.",
        "error",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <DashboardScreen onRefresh={refresh}>
      <Text
        accessibilityRole="header"
        className="font-figtree-bold text-[30px]"
        style={{ color: colors.text }}
      >
        Profile
      </Text>
      <Text
        className="mt-2 font-figtree text-[15px]"
        style={{ color: colors.textMuted }}
      >
        Manage your instructor account and preferences.
      </Text>

      <View className="mt-8 items-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            profile.profilePhoto
              ? "Change instructor photo"
              : "Upload instructor photo"
          }
          accessibilityState={{
            disabled: isUploadingPhoto,
            busy: isUploadingPhoto,
          }}
          disabled={isUploadingPhoto}
          onPress={() => void choosePhoto()}
          className="items-center active:opacity-75"
        >
          <View className="relative">
            <View
              className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4"
              style={{
                backgroundColor: colors.text,
                borderColor: colors.primary,
              }}
            >
              {isUploadingPhoto ? (
                <ActivityIndicator color={colors.primary} />
              ) : profile.profilePhoto && !photoFailed ? (
                <Image
                  source={{ uri: profile.profilePhoto }}
                  className="h-full w-full"
                  resizeMode="cover"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <Text
                  className="font-figtree-bold text-[28px]"
                  style={{ color: colors.primary }}
                >
                  {profile.initials}
                </Text>
              )}
            </View>
            <View
              className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-2"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.background,
              }}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={18}
                color={colors.onPrimary}
              />
            </View>
          </View>
          <Text
            className="mt-3 font-figtree-semibold text-[13px]"
            style={{ color: colors.primary }}
          >
            {isUploadingPhoto
              ? "Sending photo…"
              : profile.profilePhoto
                ? "Submit new photo"
                : "Upload photo"}
          </Text>
        </Pressable>
        {photoSubmission?.status === "pending" ? (
          <View
            className="mt-4 w-full flex-row items-center gap-3 rounded-2xl border p-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Image
              source={{ uri: photoSubmission.photoUrl }}
              className="h-12 w-12 rounded-xl"
              resizeMode="cover"
            />
            <Text
              className="flex-1 font-figtree-medium text-[12px] leading-5"
              style={{ color: colors.textMuted }}
            >
              Your new photo is awaiting school approval. Your current photo
              stays visible until then.
            </Text>
          </View>
        ) : photoSubmission?.status === "rejected" ? (
          <Text
            className="mt-4 text-center font-figtree-medium text-[12px]"
            style={{ color: colors.error }}
          >
            Your last photo was not approved. You can submit another.
          </Text>
        ) : null}
        <Text
          className="mt-3 font-figtree-bold text-[22px]"
          style={{ color: colors.text }}
        >
          {profile.name}
        </Text>
        {profile.schoolName ? (
          <Text
            className="mt-2 font-figtree-medium text-[13px]"
            style={{ color: colors.textMuted }}
          >
            {profile.schoolName}
          </Text>
        ) : null}
      </View>

      <Text
        className="mb-3 mt-10 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        ACCOUNT
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={surfaces.card}
      >
        <SettingsRow
          icon="inbox-outline"
          title="Notification inbox"
          description="Assignments, changes and report reminders"
          onPress={() => router.push("/instructor/profile/inbox")}
        />
        <Divider />
        <SettingsRow
          icon="account-outline"
          title="View account"
          description="Personal details and instructor information"
          onPress={() => router.push("/instructor/profile/account")}
        />
        <Divider />
        <SettingsRow
          icon="shield-lock-outline"
          title="Security"
          description="Password and account access"
          onPress={() => router.push("/instructor/profile/security")}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        PREFERENCES
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={surfaces.card}
      >
        <SettingsRow
          icon="bell-outline"
          title="Notification preferences"
          description="Lessons, changes and report reminders"
          onPress={() => router.push("/instructor/profile/notifications")}
        />
        <Divider />
        <SettingsRow
          icon="map-marker-outline"
          title="Location settings"
          description="Location access during teaching sessions"
          onPress={() => router.push("/instructor/profile/location")}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        APPEARANCE
      </Text>
      <ThemeSelector />

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        SUPPORT
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={surfaces.card}
      >
        <SettingsRow
          icon="help-circle-outline"
          title="Help and support"
          description="Instructor FAQs and contact options"
          onPress={() => router.push("/instructor/profile/help")}
        />
        <Divider />
        <SettingsRow
          icon="logout"
          title={isLoggingOut ? "Logging out…" : "Log out"}
          destructive
          loading={isLoggingOut}
          onPress={() => void logout()}
        />
      </View>
    </DashboardScreen>
  );
}
