import { useEffect } from "react";

import { getAuthenticatedUser } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export function useSessionBootstrap() {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "checking") return;

    let active = true;

    async function restoreSession() {
      try {
        const tokens = await useAuthStore.getState().hydrateTokens();
        if (!tokens || !active) return;

        const user = await getAuthenticatedUser();
        if (active) {
          useAuthStore.getState().completeHydration(user);
        }
      } catch {
        if (active) {
          await useAuthStore.getState().signOut();
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, [status]);

  return status;
}
