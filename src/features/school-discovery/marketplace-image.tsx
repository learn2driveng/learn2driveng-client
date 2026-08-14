import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";

type MarketplaceImageProps = {
  uri?: string | null;
  accessibilityLabel: string;
  fallbackIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  rounded?: "circle" | "card";
  style?: StyleProp<ViewStyle>;
};

export function MarketplaceImage({
  uri,
  accessibilityLabel,
  fallbackIcon,
  rounded = "card",
  style,
}: MarketplaceImageProps) {
  const { colors } = useAppTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const failed = Boolean(uri && failedUri === uri);
  const loading = Boolean(uri && loadedUri !== uri && !failed);

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      className="items-center justify-center overflow-hidden"
      style={[
        {
          backgroundColor: colors.surfaceStrong,
          borderRadius: rounded === "circle" ? 999 : 18,
        },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={fallbackIcon}
        size={28}
        color={colors.textSubtle}
      />
      {uri && !failed ? (
        <Image
          source={uri}
          accessibilityLabel={accessibilityLabel}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={180}
          style={StyleSheet.absoluteFill}
          onLoad={() => setLoadedUri(uri)}
          onError={() => setFailedUri(uri)}
        />
      ) : null}
      {loading && !failed ? (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <ActivityIndicator size="small" color={colors.textMuted} />
        </View>
      ) : null}
    </View>
  );
}
