import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { logOutSession } from "@/lib/api";
import { unregisterCurrentPushDevice } from "@/features/notifications/push-notifications";
import { useAuthStore } from "@/store/auth.store";

export function useLogout() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutInProgress = useRef(false);

  const logout = useCallback(async () => {
    if (logoutInProgress.current) return;
    logoutInProgress.current = true;
    setIsLoggingOut(true);

    try {
      // Remove the push device before logout revokes the access token.
      await unregisterCurrentPushDevice().catch(() => undefined);
      await logOutSession().catch(() => undefined);
    } finally {
      try {
        await signOut();
        router.replace("/welcome");
      } finally {
        logoutInProgress.current = false;
        setIsLoggingOut(false);
      }
    }
  }, [router, signOut]);

  return { logout, isLoggingOut };
}
