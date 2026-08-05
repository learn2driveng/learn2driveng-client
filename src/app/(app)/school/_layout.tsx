import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useState } from "react";

import { ContentEmptyState } from "@/components/common/content-empty-state";
import { Screen } from "@/components/common/screen";
import { useRoleRouteAccess } from "@/features/auth";
import { useAppTheme } from "@/hooks/use-app-theme";
import { fetchMyDrivingSchool } from "@/lib/api";
import { hydrateSchoolFromRecord } from "@/lib/school/hydrate-school-operations";
import { useAuthStore } from "@/store/auth.store";
import type { ApiError, DrivingSchoolVerificationStatus } from "@/types";

type SchoolAccess =
  | { status: "checking" }
  | {
      status: "ready";
      verificationStatus: DrivingSchoolVerificationStatus | "draft";
    }
  | { status: "error" };

export default function SchoolLayout() {
  const { colors } = useAppTheme();
  const pathname = usePathname();
  const roleAccess = useRoleRouteAccess("driving_school", "/school");
  const user = useAuthStore((state) => state.user);
  const [reloadToken, setReloadToken] = useState(0);
  const [access, setAccess] = useState<SchoolAccess>({
    status: "checking",
  });

  useEffect(() => {
    if (roleAccess.status !== "allowed") return;

    let active = true;
    const adminName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "School admin";

    fetchMyDrivingSchool()
      .then((school) => {
        if (!active) return;
        hydrateSchoolFromRecord(school, adminName);
        setAccess({
          status: "ready",
          verificationStatus: school.verificationStatus,
        });
      })
      .catch((error: ApiError) => {
        if (!active) return;

        setAccess(
          error.statusCode === 404
            ? { status: "ready", verificationStatus: "draft" }
            : { status: "error" },
        );
      });

    return () => {
      active = false;
    };
  }, [reloadToken, roleAccess.status, user]);

  if (roleAccess.status === "checking") return null;
  if (roleAccess.status === "redirect") {
    return <Redirect href={roleAccess.href} />;
  }

  if (access.status === "checking") return null;

  if (access.status === "error") {
    return (
      <Screen className="justify-center px-6">
        <ContentEmptyState
          icon="cloud-alert-outline"
          title="School access unavailable"
          description="We could not confirm your school verification status. Check your connection and try again."
          actionLabel="Try again"
          onActionPress={() => {
            setAccess({ status: "checking" });
            setReloadToken((current) => current + 1);
          }}
        />
      </Screen>
    );
  }

  if (
    access.verificationStatus !== "approved" &&
    !pathname.startsWith("/school/onboarding")
  ) {
    return <Redirect href="/school/onboarding" />;
  }

  if (
    access.verificationStatus === "approved" &&
    pathname.startsWith("/school/onboarding")
  ) {
    return <Redirect href="/school" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
