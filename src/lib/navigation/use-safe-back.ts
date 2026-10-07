import { usePathname, useRouter, type Href } from "expo-router";
import { useCallback } from "react";

import { useAuthStore } from "@/store/auth.store";

function fallbackForPath(pathname: string, role: string | null): Href {
  if (pathname.startsWith("/student/profile")) return "/student/profile";
  if (pathname.startsWith("/student/sessions")) return "/student/sessions";
  if (pathname.startsWith("/student/progress")) return "/student/progress";
  if (pathname.startsWith("/student/explore")) return "/student/explore";
  if (pathname.startsWith("/student")) return "/student";

  if (pathname.startsWith("/instructor/profile")) return "/instructor/profile";
  if (pathname.startsWith("/instructor/schedule")) return "/instructor/schedule";
  if (pathname.startsWith("/instructor/sessions")) return "/instructor/schedule";
  if (pathname.startsWith("/instructor")) return "/instructor";

  if (pathname.startsWith("/school/onboarding")) return "/school/onboarding";
  if (pathname.startsWith("/school/bookings")) return "/school/bookings";
  if (pathname.startsWith("/school/learners")) return "/school/learners";
  if (pathname.startsWith("/school/instructors")) return "/school/instructors";
  if (pathname.startsWith("/school")) return "/school";

  if (pathname.startsWith("/checkout")) return "/student/explore";
  if (pathname.startsWith("/explore")) return "/explore";
  if (pathname.startsWith("/track")) return "/explore";

  if (role === "learner") return "/student";
  if (role === "instructor") return "/instructor";
  if (role === "driving_school") return "/school";
  return "/welcome";
}

export function useSafeBack(fallback?: Href) {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);

  return useCallback(() => {
    if (router.canDismiss()) {
      router.back();
      return;
    }

    router.replace(fallback ?? fallbackForPath(pathname, role));
  }, [fallback, pathname, role, router]);
}
