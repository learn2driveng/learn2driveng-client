import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

export default function StudentProfileScreen() {
  const router = useRouter();
  const { colors, scheme } = useAppTheme();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <DashboardScreen>
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
            AJ
          </Text>
        </View>
        <Text
          className="mt-4 font-figtree-bold text-[22px]"
          style={{ color: colors.text }}
        >
          Alex Jordan
        </Text>
        <View className="mt-2 flex-row items-center gap-1.5">
          <MaterialCommunityIcons
            name="check-decagram"
            size={16}
            color={colors.primary}
          />
          <Text
            className="font-figtree-medium text-[13px]"
            style={{ color: colors.textMuted }}
          >
            Verified student
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
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <SettingsRow
          icon="account-outline"
          title="View account"
          description="Personal details and contact information"
          onPress={() => router.push("/student/profile/account")}
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
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
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
        <View
          className="mx-4 h-px"
          style={{ backgroundColor: colors.border }}
        />
        <SettingsRow
          icon="theme-light-dark"
          title="Appearance"
          description="Theme and display preferences"
          value={scheme === "dark" ? "Dark" : "Light"}
        />
      </View>

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        SUPPORT
      </Text>
      <View
        className="overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
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
          title="Log out"
          destructive
          onPress={() => {
            signOut();
            router.replace("/welcome");
          }}
        />
      </View>
    </DashboardScreen>
  );
}
