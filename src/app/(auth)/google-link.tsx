import { Redirect } from "expo-router";

import LoginScreen from "./login";
import { useGoogleAuthStore } from "@/store/google-auth.store";

export default function GoogleLinkScreen() {
  const pendingGoogleLink = useGoogleAuthStore((state) => state.pendingLink);

  if (!pendingGoogleLink) {
    return <Redirect href="/login" />;
  }

  return <LoginScreen />;
}
