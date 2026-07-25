import { useCallback, useEffect, useState } from "react";

import { fetchDiscoverSchoolById } from "@/lib/api/discover";
import { mapPublicSchoolDetailToSchoolDetail } from "@/lib/school/mappers";
import type { ApiError } from "@/types/api";
import type { SchoolDetail } from "@/types/school";

type UseDiscoverSchoolDetailOptions = {
  distanceKm?: number;
};

type UseDiscoverSchoolDetailResult = {
  school: SchoolDetail | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
};

export function useDiscoverSchoolDetail(
  schoolId: string | undefined,
  options: UseDiscoverSchoolDetailOptions = {},
): UseDiscoverSchoolDetailResult {
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(schoolId));
  const [error, setError] = useState<ApiError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!schoolId) {
      setSchool(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const id = schoolId;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const payload = await fetchDiscoverSchoolById(id);
        if (cancelled) {
          return;
        }
        setSchool(
          mapPublicSchoolDetailToSchoolDetail(payload, {
            distanceKm: options.distanceKm,
          }),
        );
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setSchool(null);
        setError(
          caught && typeof caught === "object" && "statusCode" in caught
            ? (caught as ApiError)
            : {
                message: "Unable to load this driving school.",
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
  }, [schoolId, options.distanceKm, reloadToken]);

  return { school, loading, error, refetch };
}
