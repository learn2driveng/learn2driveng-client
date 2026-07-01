import { FontAwesome } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { borderRadius } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type SocialAuthButtonsProps = {
  compact?: boolean;
  onGooglePress?: () => void;
  onApplePress?: () => void;
};

export function SocialAuthButtons({
  compact = false,
  onGooglePress,
  onApplePress,
}: SocialAuthButtonsProps) {
  const { colors } = useAppTheme();
  const providers = [
    { label: "Google", icon: "google" as const, onPress: onGooglePress },
    { label: "Apple", icon: "apple" as const, onPress: onApplePress },
  ];

  return (
    <View className={`flex-row ${compact ? "justify-center gap-6" : "gap-4"}`}>
      {providers.map((provider) => (
        <Pressable
          key={provider.label}
          accessibilityRole="button"
          accessibilityLabel={`Continue with ${provider.label}`}
          accessibilityState={{ disabled: !provider.onPress }}
          disabled={!provider.onPress}
          onPress={provider.onPress}
          className={`${compact ? "h-14 w-14 rounded-full" : "h-14 flex-1 rounded-full"} flex-row items-center justify-center gap-3 border active:opacity-70`}
          style={{
            borderColor: colors.border,
            backgroundColor: colors.surface,
            borderRadius: borderRadius.button,
            overflow: "hidden",
            opacity: provider.onPress ? 1 : 0.7,
          }}
        >
          <FontAwesome name={provider.icon} size={20} color={colors.text} />
          {!compact ? (
            <Text
              className="font-figtree-semibold text-[17px]"
              style={{ color: colors.text }}
            >
              {provider.label}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
