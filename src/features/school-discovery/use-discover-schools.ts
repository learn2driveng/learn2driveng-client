import { useCallback, useEffect, useState } from "react";

import {
  fetchDiscoverSchools,
  type DiscoverSchoolsQuery,
} from "@/lib/api/discover";
import { mapPublicSchoolListItemToSummary } from "@/lib/school/mappers";
import type { ApiError } from "@/types/api";
import type { SchoolSummary } from "@/types/school";

type UseDiscoverSchoolsResult = {
  schools: SchoolSummary[];
  loading: boolean;
  error: ApiError | null;
  usedLocationFallback: boolean;
  refetch: () => void;
};

export function useDiscoverSchools(
  query: DiscoverSchoolsQuery,
): UseDiscoverSchoolsResult {
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [usedLocationFallback, setUsedLocationFallback] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setUsedLocationFallback(false);

      try {
        let result = await fetchDiscoverSchools(query);
        const usedGeoQuery =
          query.latitude != null && query.longitude != null;

        if (usedGeoQuery && result.items.length === 0) {
          const fallbackQuery: DiscoverSchoolsQuery = {
            page: query.page,
            limit: query.limit,
            search: query.search,
            state: query.state,
            city: query.city,
            minRating: query.minRating,
            sort: "rating",
          };
          result = await fetchDiscoverSchools(fallbackQuery);
          if (!cancelled && result.items.length > 0) {
            setUsedLocationFallback(true);
          }
        }

        if (cancelled) {
          return;
        }

        setSchools(result.items.map(mapPublicSchoolListItemToSummary));
      } catch (caught) {
        if (cancelled) {
          return;
        }
        setSchools([]);
        setUsedLocationFallback(false);
        setError(
          caught && typeof caught === "object" && "statusCode" in caught
            ? (caught as ApiError)
            : {
                message:
                  "Unable to load driving schools. Check your connection and API URL.",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- query fields drive refetch
  }, [
    reloadToken,
    query.search,
    query.minRating,
    query.latitude,
    query.longitude,
    query.radiusKm,
    query.sort,
    query.page,
    query.limit,
  ]);

  return { schools, loading, error, usedLocationFallback, refetch };
}
