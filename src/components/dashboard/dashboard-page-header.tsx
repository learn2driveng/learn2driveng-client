import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type DashboardPageHeaderProps = {
  title: string;
};

export function DashboardPageHeader({ title }: DashboardPageHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={() => router.back()}
        className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
        style={{ borderColor: colors.border, backgroundColor: colors.surface }}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={20}
          color={colors.text}
        />
      </Pressable>
      <Text
        className="font-figtree-bold text-[24px]"
        style={{ color: colors.text }}
      >
        {title}
      </Text>
    </View>
  );
}
