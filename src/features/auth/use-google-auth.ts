import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { destinationForRole } from "@/features/auth/navigation";
import { authenticateWithGoogle } from "@/lib/api";
import { signInWithGoogle } from "@/lib/google/google-sign";
import { useAuthStore } from "@/store/auth.store";
import { useGoogleAuthStore } from "@/store/google-auth.store";
import type { ApiError, UserRole } from "@/types";

type GoogleSignupRole = Extract<UserRole, "learner">;

function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  ) {
    return (error as ApiError).message;
  }

  return "Google sign-in could not be completed. Please try again.";
}

export function useGoogleAuth(role: GoogleSignupRole, returnTo?: string) {
  const router = useRouter();
  const authenticate = useAuthStore((state) => state.authenticate);
  const beginSignup = useGoogleAuthStore((state) => state.beginSignup);
  const beginLink = useGoogleAuthStore((state) => state.beginLink);
  const clearSignup = useGoogleAuthStore((state) => state.clearSignup);
  const clearLink = useGoogleAuthStore((state) => state.clearLink);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const continueWithGoogle = useCallback(async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);

    try {
      const nativeResult = await signInWithGoogle();
      if (!nativeResult) return;

      const result = await authenticateWithGoogle(nativeResult.idToken);
      if (result.status === "authenticated") {
        clearSignup();
        clearLink();
        await authenticate(result);
        router.replace(destinationForRole(result.user.role, returnTo));
        return;
      }

      if (result.status === "registration_required") {
        beginSignup({
          registrationToken: result.registrationToken,
          profile: result.profile,
          role,
          returnTo,
        });
        router.push("/google-onboarding");
        return;
      }

      beginLink({
        linkToken: result.linkToken,
        profile: result.profile,
        returnTo,
      });
      router.replace({
        pathname: "/login",
        params: typeof returnTo === "string" ? { returnTo } : undefined,
      });
    } catch (error) {
      setGoogleError(errorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  }, [
    authenticate,
    beginLink,
    beginSignup,
    clearLink,
    clearSignup,
    returnTo,
    role,
    router,
  ]);

  return { continueWithGoogle, googleError, isGoogleLoading };
}
