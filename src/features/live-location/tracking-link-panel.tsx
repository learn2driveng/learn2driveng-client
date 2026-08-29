import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { useAppTheme } from "@/hooks/use-app-theme";
import {
  copyTrackingLink,
  openTrackingLinkInBrowser,
  shareTrackingLinkViaWhatsApp,
} from "@/lib/share/tracking-link";

type TrackingLinkPanelProps = {
  shareUrl: string;
  learnerFirstName?: string | null;
  onRevoke?: () => void;
  isRevoking?: boolean;
};

function truncateUrl(url: string, max = 42) {
  if (url.length <= max) return url;
  return `${url.slice(0, max - 1)}…`;
}

export function TrackingLinkPanel({
  shareUrl,
  learnerFirstName,
  onRevoke,
  isRevoking = false,
}: TrackingLinkPanelProps) {
  const { colors } = useAppTheme();

  return (
    <View
      className="rounded-3xl border p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <Text
        className="font-figtree-bold text-[15px]"
        style={{ color: colors.text }}
      >
        Guardian tracking link
      </Text>
      <Text
        className="mt-2 font-figtree text-[12px] leading-5"
        style={{ color: colors.textMuted }}
      >
        One link for your family and the driving school. It stops working when
        the lesson ends.
      </Text>

      <View
        className="mt-4 rounded-2xl border px-4 py-3"
        style={{
          backgroundColor: colors.surfaceStrong,
          borderColor: colors.border,
        }}
      >
        <Text
          className="font-figtree-medium text-[10px] uppercase"
          style={{ color: colors.textSubtle }}
        >
          Session link
        </Text>
        <Text
          selectable
          className="mt-1 font-figtree text-[12px] leading-5"
          style={{ color: colors.text }}
        >
          {truncateUrl(shareUrl)}
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={() => void copyTrackingLink(shareUrl)}
          className="h-11 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
          style={{ backgroundColor: colors.surfaceStrong }}
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={16}
            color={colors.text}
          />
          <Text
            className="font-figtree-bold text-[12px]"
            style={{ color: colors.text }}
          >
            Copy
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            void shareTrackingLinkViaWhatsApp(shareUrl, learnerFirstName)
          }
          className="h-11 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
          style={{ backgroundColor: "#DCFCE7" }}
        >
          <MaterialCommunityIcons name="whatsapp" size={16} color="#15803D" />
          <Text
            className="font-figtree-bold text-[12px]"
            style={{ color: "#15803D" }}
          >
            WhatsApp
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => void openTrackingLinkInBrowser(shareUrl)}
          className="h-11 flex-row items-center gap-2 rounded-full px-4 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
        >
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color={colors.onPrimary}
          />
          <Text
            className="font-figtree-bold text-[12px]"
            style={{ color: colors.onPrimary }}
          >
            Open
          </Text>
        </Pressable>
      </View>

      {onRevoke ? (
        <Pressable
          accessibilityRole="button"
          disabled={isRevoking}
          onPress={onRevoke}
          className="mt-4 h-11 items-center justify-center rounded-full border active:opacity-75"
          style={{ borderColor: colors.error }}
        >
          <Text
            className="font-figtree-bold text-[12px]"
            style={{ color: colors.error }}
          >
            {isRevoking ? "Stopping link…" : "Stop family sharing"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
