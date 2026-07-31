import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

if (Platform.OS !== "web") {
  GoogleSignin.configure({
    webClientId,
  });
}

export async function signInWithGoogle() {
  if (Platform.OS === "web") {
    throw new Error("Google sign-in is available in the mobile app.");
  }

  if (!webClientId) {
    throw new Error("Google sign-in is not configured for this build.");
  }

  await GoogleSignin.hasPlayServices();
  await GoogleSignin.signOut();
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    return null;
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google did not return an ID token.");
  }

  return { idToken };
}
