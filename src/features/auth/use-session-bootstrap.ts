import { useEffect } from "react";

import { getAuthenticatedUser } from "@/lib/api";
import { hydrateInstructorOperations } from "@/lib/instructor/hydrate-instructor-operations";
import { hydrateLearnerOperations } from "@/lib/learner/hydrate-learner-operations";
import { hydrateLearnerSessions } from "@/lib/learner/hydrate-learner-sessions";
import { hydrateSchoolOperations } from "@/lib/school/hydrate-school-operations";
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
          if (user.role === "learner") {
            await Promise.all([
              hydrateLearnerOperations().catch(() => undefined),
              hydrateLearnerSessions().catch(() => undefined),
            ]);
          } else if (user.role === "driving_school") {
            await hydrateSchoolOperations(
              `${user.firstName} ${user.lastName}`.trim(),
            ).catch(() => undefined);
          } else if (user.role === "instructor") {
            await hydrateInstructorOperations().catch(() => undefined);
          }
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
