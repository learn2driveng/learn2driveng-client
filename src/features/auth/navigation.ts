import type { Href } from "expo-router";

import type { UserRole } from "@/types";

const homeRoutes = {
  learner: "/student",
  instructor: "/instructor",
  driving_school: "/school",
  guardian: "/welcome",
  admin: "/welcome",
} as const satisfies Record<UserRole, Href>;

const allowedReturnPrefixes: Partial<Record<UserRole, readonly string[]>> = {
  learner: ["/student", "/checkout"],
  instructor: ["/instructor"],
  driving_school: ["/school"],
};

const internalNavigationOrigin = "https://learn2drive.local";

function normalizeInternalReturnTo(returnTo?: string) {
  if (
    typeof returnTo !== "string" ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//") ||
    /[\u0000-\u001f\u007f\\]/.test(returnTo)
  ) {
    return null;
  }

  try {
    const url = new URL(returnTo, internalNavigationOrigin);
    if (
      url.origin !== internalNavigationOrigin ||
      /%(?:2e|2f|5c)/i.test(url.pathname)
    ) {
      return null;
    }

    return {
      href: `${url.pathname}${url.search}${url.hash}` as Href,
      pathname: url.pathname,
    };
  } catch {
    return null;
  }
}

export function homeForRole(role: UserRole): Href {
  return homeRoutes[role];
}

export function destinationForRole(role: UserRole, returnTo?: string): Href {
  const allowed = allowedReturnPrefixes[role] ?? [];
  const destination = normalizeInternalReturnTo(returnTo);
  const isAllowed =
    destination !== null &&
    allowed.some(
      (prefix) =>
        destination.pathname === prefix ||
        destination.pathname.startsWith(`${prefix}/`),
    );

  return isAllowed ? destination.href : homeForRole(role);
}
