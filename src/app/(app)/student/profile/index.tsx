import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

import { ThemeSelector } from "@/components/common/theme-selector";
import { useSurfaceStyles } from "@/components/common/surface";
import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useLogout } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchMyProfile } from "@/lib/api/users";
import { userDisplayName, userInitials } from "@/lib/learner/map-api";
import { useAuthStore } from "@/store/auth.store";

export default function StudentProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const { logout, isLoggingOut } = useLogout();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const refresh = useCallback(async () => {
    updateUser(await fetchMyProfile());
  }, [updateUser]);

  if (!user) return null;

  const displayName = userDisplayName(user);
  const initials = userInitials(user);

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
        Manage your account and app preferences.
      </Text>

      <View className="mt-8 items-center">
        <View
          className="h-24 w-24 items-center justify-center rounded-full border-4"
          style={{ backgroundColor: colors.text, borderColor: colors.primary }}
        >
          <Text
            className="font-figtree-bold text-[28px]"
            style={{ color: colors.primary }}
          >
            {initials}
          </Text>
        </View>
        <Text
          className="mt-4 font-figtree-bold text-[22px]"
          style={{ color: colors.text }}
        >
          {displayName}
        </Text>
        <View className="mt-2 flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name={user.isEmailVerified ? "check-decagram" : "email-outline"}
            size={16}
            color={colors.primary}
          />
          <Text
            className="font-figtree-medium text-[13px]"
            style={{ color: colors.textMuted }}
          >
            {user.isEmailVerified ? "Verified student" : "Email not verified"}
          </Text>
        </View>
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
          icon="account-outline"
          title="View account"
          description="Personal details and contact information"
          onPress={() => router.push("/student/profile/account")}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="receipt-text-outline"
          title="Payment history"
          description="Confirmed package payments"
          onPress={() => router.push("/student/profile/payments")}
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
          description="Sessions, reminders and updates"
          onPress={() => router.push("/student/profile/notifications")}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="map-marker-outline"
          title="Location settings"
          description="Location access and default area"
          onPress={() => router.push("/student/profile/location")}
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
          description="FAQs and contact support"
          onPress={() => router.push("/student/profile/help")}
        />
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
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
