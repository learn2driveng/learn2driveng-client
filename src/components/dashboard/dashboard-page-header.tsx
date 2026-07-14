import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useSurfaceStyles } from "@/components/common/surface";
import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type DashboardPageHeaderProps = {
  title: string;
  showBack?: boolean;
};

export function DashboardPageHeader({
  title,
  showBack = true,
}: DashboardPageHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const surfaces = useSurfaceStyles();

  return (
    <View className="flex-row items-center gap-4">
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
          hitSlop={12}
          onPress={() => router.back()}
          className="h-11 flex-row items-center justify-center gap-2 rounded-full border px-4 active:opacity-70"
          style={surfaces.card}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
          <Text
            className="text-[12px]"
            style={{ color: colors.text, fontFamily: fontFamily.figtreeBold }}
          >
            Back
          </Text>
        </Pressable>
      ) : null}
      <Text
        accessibilityRole="header"
        numberOfLines={2}
        className="flex-1 font-figtree-bold text-[24px]"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
    </View>
  );
}
