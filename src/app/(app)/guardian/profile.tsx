import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { AppLogo } from "@/components/common/app-logo";
import { ThemeSelector } from "@/components/common/theme-selector";
import { useSurfaceStyles } from "@/components/common/surface";
import { DashboardScreen, SettingsRow } from "@/components/dashboard";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAuthStore } from "@/store/auth.store";

export default function GuardianProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <DashboardScreen>
      <AppLogo height={48} className="mb-6" />
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
        style={surfaces.card}
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

      <Text
        className="mb-3 mt-8 ml-1 font-figtree-bold text-[11px] tracking-[1.5px]"
        style={{ color: colors.textSubtle }}
      >
        APPEARANCE
      </Text>
      <ThemeSelector />
    </DashboardScreen>
  );
}
