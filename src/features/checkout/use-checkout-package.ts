import { useCallback, useEffect, useState } from "react";

import { fetchDiscoverSchoolById } from "@/lib/api/discover";
import { mapPublicSchoolDetailToSchoolDetail } from "@/lib/school/mappers";
import type { ApiError } from "@/types/api";
import type { SchoolDetail, TrainingPackage } from "@/types";

type UseCheckoutPackageResult = {
  school: SchoolDetail | null;
  selectedPackage: TrainingPackage | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
};

export function useCheckoutPackage(
  schoolId: string | undefined,
  packageId: string | undefined,
): UseCheckoutPackageResult {
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(schoolId && packageId));
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!schoolId || !packageId) {
      return;
    }

    let cancelled = false;
    const resolvedSchoolId = schoolId;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const payload = await fetchDiscoverSchoolById(resolvedSchoolId);
        if (cancelled) return;
        setSchool(mapPublicSchoolDetailToSchoolDetail(payload));
      } catch (caught) {
        if (cancelled) return;
        setSchool(null);
        setError(
          caught && typeof caught === "object" && "statusCode" in caught
            ? (caught as ApiError)
            : {
                message: "Unable to load checkout details.",
                statusCode: 0,
              },
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [schoolId, packageId, reloadToken]);

  const hasSelection = Boolean(schoolId && packageId);
  const visibleSchool = hasSelection ? school : null;
  const selectedPackage =
    visibleSchool?.packages.find((item) => item.id === packageId) ?? null;

  return {
    school: visibleSchool,
    selectedPackage,
    loading: hasSelection ? loading : false,
    error: hasSelection ? error : null,
    refetch,
  };
}
