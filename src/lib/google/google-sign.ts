import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
let googleSigninModule:
  | typeof import("@react-native-google-signin/google-signin")
  | undefined;

async function loadGoogleSignin() {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      "Google sign-in requires the Learn2Drive development build and is not available in Expo Go.",
    );
  }

  if (!googleSigninModule) {
    try {
      googleSigninModule =
        await import("@react-native-google-signin/google-signin");
      googleSigninModule.GoogleSignin.configure({
        webClientId,
        iosClientId,
      });
    } catch {
      throw new Error(
        "Google sign-in is unavailable in this app build. Install the Learn2Drive development build and try again.",
      );
    }
  }

  return googleSigninModule;
}

export async function signInWithGoogle() {
  if (Platform.OS === "web") {
    throw new Error("Google sign-in is available in the mobile app.");
  }

  if (!webClientId || (Platform.OS === "ios" && !iosClientId)) {
    throw new Error("Google sign-in is not configured for this build.");
  }

  const { GoogleSignin, isSuccessResponse } = await loadGoogleSignin();

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
