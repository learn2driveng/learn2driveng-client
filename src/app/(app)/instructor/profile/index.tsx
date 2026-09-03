import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { ThemeSelector } from "@/components/common/theme-selector";
import { useSurfaceStyles } from "@/components/common/surface";
import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useLogout } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
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
  const { logout } = useLogout();

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
        Manage your instructor account and preferences.
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
            {profile.initials}
          </Text>
        </View>
        <Text
          className="mt-4 font-figtree-bold text-[22px]"
          style={{ color: colors.text }}
        >
          {profile.name}
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
            Verified instructor · {profile.schoolName}
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
          title="Log out"
          destructive
          onPress={() => void logout()}
        />
      </View>
    </DashboardScreen>
  );
}
