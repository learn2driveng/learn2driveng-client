import * as Linking from "expo-linking";
import { Redirect, usePathname } from "expo-router";
import type { PropsWithChildren } from "react";

import { homeForRole } from "@/features/auth/navigation";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types";

type RoleRouteGuardProps = PropsWithChildren<{
  allowedRoles: readonly UserRole[];
  fallbackReturnTo: string;
}>;

function internalHrefFromLinkingUrl(url: string | null) {
  if (!url) return null;

  const parsed = Linking.parse(url);
  if (!parsed.path) return null;

  const query = new URLSearchParams();
  Object.entries(parsed.queryParams ?? {}).forEach(([key, value]) => {
    if (typeof value === "string") query.set(key, value);
  });

  return `/${parsed.path}${query.size ? `?${query.toString()}` : ""}`;
}

export function RoleRouteGuard({
  allowedRoles,
  children,
  fallbackReturnTo,
}: RoleRouteGuardProps) {
  const status = useAuthStore((state) => state.status);
  const role = useAuthStore((state) => state.role);
  const pathname = usePathname();
  const linkingUrl = Linking.useLinkingURL();

  if (status === "checking") return null;

  if (status !== "authenticated" || !role) {
    const linkingHref = internalHrefFromLinkingUrl(linkingUrl);
    const returnTo =
      linkingHref ??
      (pathname !== "/" ? pathname : fallbackReturnTo);

    return (
      <Redirect href={{ pathname: "/login", params: { returnTo } }} />
    );
  }

  if (!allowedRoles.includes(role)) {
    return <Redirect href={homeForRole(role)} />;
  }

  return children;
}
