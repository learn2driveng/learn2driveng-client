import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

export default function GuardianProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
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
        Guardian account and preferences will live here.
      </Text>

      <View
        className="mt-8 overflow-hidden rounded-3xl border"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
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
