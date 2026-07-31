import {
  useCurrentRouteInfo,
  useGlobalSearchParams,
  usePathname,
  useSegments,
  useUnstableGlobalHref,
  type Href,
} from "expo-router";

import { homeForRole } from "@/features/auth/navigation";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types";

type RoleRouteAccess =
  | { status: "checking" }
  | { status: "allowed" }
  | { status: "redirect"; href: Href };

export function useRoleRouteAccess(
  requiredRole: UserRole,
  fallbackReturnTo: string,
): RoleRouteAccess {
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);
  const pathname = usePathname();
  const segments = useSegments();
  const params = useGlobalSearchParams();
  const globalHref = useUnstableGlobalHref();
  const routeInfo = useCurrentRouteInfo();

  if (status === "checking") return { status: "checking" };

  if (status !== "authenticated" || !role) {
    const pathParameterNames = new Set<string>();
    const segmentPath = `/${segments
      .filter((segment) => !segment.startsWith("("))
      .map((segment) => {
        const parameterName = segment.match(/^\[(?:\.\.\.)?(.+)\]$/)?.[1];
        if (parameterName) pathParameterNames.add(parameterName);
        const parameter = parameterName ? params[parameterName] : undefined;
        return typeof parameter === "string" ? parameter : segment;
      })
      .join("/")}`;
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === "string" && !pathParameterNames.has(key)) {
        query.set(key, value);
      }
    });
    const currentRouteHref =
      requiredRole === "learner" && segmentPath === "/checkout"
        ? fallbackReturnTo
        : routeInfo?.pathnameWithParams;
    const routeHref =
      currentRouteHref &&
      currentRouteHref !== "/" &&
      currentRouteHref.startsWith("/") &&
      !currentRouteHref.startsWith("//")
        ? currentRouteHref
        : segmentPath !== "/"
          ? `${segmentPath}${query.size ? `?${query.toString()}` : ""}`
          : globalHref !== "/" &&
              globalHref.startsWith("/") &&
              !globalHref.startsWith("//")
            ? globalHref
            : pathname !== "/"
              ? pathname
              : fallbackReturnTo;

    return {
      status: "redirect",
      href: { pathname: "/login", params: { returnTo: routeHref } },
    };
  }

  if (role !== requiredRole) {
    return { status: "redirect", href: homeForRole(role) };
  }

  return { status: "allowed" };
}
