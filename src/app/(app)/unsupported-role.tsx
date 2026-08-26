import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { AuthPrimaryButton } from "@/components/auth";
import { Screen } from "@/components/common/screen";
import { fontFamily } from "@/constants/fonts";
import { RoleRouteGuard, useLogout } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function UnsupportedRoleScreen() {
  const { colors } = useAppTheme();
  const { logout, isLoggingOut } = useLogout();

  return (
    <RoleRouteGuard
      allowedRoles={["guardian", "admin"]}
      fallbackReturnTo="/unsupported-role"
    >
      <Screen className="items-center justify-center px-8">
      <View
        className="h-20 w-20 items-center justify-center rounded-3xl"
        style={{ backgroundColor: colors.surfaceStrong }}
      >
        <MaterialCommunityIcons
          name="account-lock-outline"
          size={38}
          color={colors.primary}
        />
      </View>
      <Text
        accessibilityRole="header"
        className="mt-6 text-center text-[24px]"
        style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
      >
        This account role is not available in the app
      </Text>
      <Text
        className="mt-3 text-center text-[14px] leading-6"
        style={{ color: colors.textMuted, fontFamily: fontFamily.figtree }}
      >
        Your account is valid, but this version of Learn2Drive does not include
        a workspace for this role yet.
      </Text>
      <View className="mt-8 w-full">
        <AuthPrimaryButton
          label={isLoggingOut ? "Signing out…" : "Sign out"}
          disabled={isLoggingOut}
          onPress={() => void logout()}
        />
      </View>
      </Screen>
    </RoleRouteGuard>
  );
}
