import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

import { fontFamily } from "@/constants/fonts";
import { useAppTheme } from "@/hooks/use-app-theme";

type SchoolAvatarProps = {
  name: string;
  logoUrl?: string | null;
  size?: number;
  inverse?: boolean;
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function SchoolAvatar({
  name,
  logoUrl,
  size = 48,
  inverse = false,
}: SchoolAvatarProps) {
  const { colors } = useAppTheme();
  const [loadedLogoUrl, setLoadedLogoUrl] = useState<string | null>(null);
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const imageFailed = Boolean(logoUrl && failedLogoUrl === logoUrl);
  const isImageLoading = Boolean(
    logoUrl && loadedLogoUrl !== logoUrl && !imageFailed,
  );

  const showFallback = !logoUrl || imageFailed;

  return (
    <View
      accessibilityLabel={`${name} logo`}
      className="items-center justify-center overflow-hidden rounded-full border"
      style={{
        width: size,
        height: size,
        backgroundColor: inverse ? "rgba(255,255,255,0.12)" : colors.surfaceStrong,
        borderColor: inverse ? "rgba(255,255,255,0.28)" : colors.border,
      }}
    >
      {showFallback && initialsFromName(name) ? (
        <Text
          style={{
            color: inverse ? colors.contrastText : colors.text,
            fontFamily: fontFamily.figtreeBold,
            fontSize: Math.max(11, Math.round(size * 0.3)),
          }}
        >
          {initialsFromName(name)}
        </Text>
      ) : showFallback ? (
        <MaterialCommunityIcons
          name="school-outline"
          size={Math.round(size * 0.46)}
          color={inverse ? colors.contrastText : colors.textMuted}
        />
      ) : null}
      {logoUrl && !imageFailed ? (
        <Image
          source={{ uri: logoUrl }}
          className="absolute h-full w-full"
          resizeMode="cover"
          onLoadEnd={() => setLoadedLogoUrl(logoUrl)}
          onError={() => {
            setFailedLogoUrl(logoUrl);
          }}
        />
      ) : null}
      {isImageLoading && !imageFailed ? (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: inverse ? "rgba(255,255,255,0.16)" : colors.surfaceStrong }}
        >
          <ActivityIndicator
            size="small"
            color={inverse ? colors.contrastText : colors.textMuted}
          />
        </View>
      ) : null}
    </View>
  );
}
