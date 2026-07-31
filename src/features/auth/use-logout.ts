import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

import { logOutSession } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function useLogout() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await logOutSession();
    } catch {
      // Local session removal must still succeed when the API is unavailable.
    } finally {
      await signOut();
      router.replace("/welcome");
      setIsLoggingOut(false);
    }
  }, [router, signOut]);

  return { logout, isLoggingOut };
}
