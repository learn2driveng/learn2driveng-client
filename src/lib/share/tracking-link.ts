import { Linking, Platform, Share } from "react-native";

export function buildGuardianTrackingMessage(
  shareUrl: string,
  learnerFirstName?: string | null,
) {
  const learnerLabel = learnerFirstName?.trim() || "my";
  return `Follow ${learnerLabel}'s live driving lesson on Learn2Drive. This private link stops working when the lesson ends:\n${shareUrl}`;
}

export async function copyTrackingLink(shareUrl: string) {
  if (
    Platform.OS === "web" &&
    typeof navigator !== "undefined" &&
    navigator.clipboard?.writeText
  ) {
    await navigator.clipboard.writeText(shareUrl);
    return;
  }

  await Share.share({ message: shareUrl });
}

export async function shareTrackingLinkViaWhatsApp(
  shareUrl: string,
  learnerFirstName?: string | null,
) {
  const message = buildGuardianTrackingMessage(shareUrl, learnerFirstName);
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

  if (await Linking.canOpenURL(whatsappUrl)) {
    await Linking.openURL(whatsappUrl);
    return;
  }

  await Share.share({
    title: "Live driving lesson",
    message,
    url: shareUrl,
  });
}

export async function openTrackingLinkInBrowser(shareUrl: string) {
  await Linking.openURL(shareUrl);
}
