import { api } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/api";
import type {
  PublicDrivingSchoolDetail,
  PublicDrivingSchoolListItem,
} from "@/types/school";

export type DiscoverSchoolsSort = "distance" | "rating";

export type DiscoverSchoolsQuery = {
  search?: string;
  state?: string;
  city?: string;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  sort?: DiscoverSchoolsSort;
  page?: number;
  limit?: number;
};

type DiscoverSchoolsApiResponse = {
  success: boolean;
  message?: string;
  data: PublicDrivingSchoolListItem[];
  pagination: PaginationMeta;
};

type DiscoverSchoolDetailApiResponse = {
  success: boolean;
  message?: string;
  data: PublicDrivingSchoolDetail;
};

export async function fetchDiscoverSchools(query: DiscoverSchoolsQuery) {
  const params = {
    ...query,
    search: query.search?.trim() || undefined,
    state: query.state?.trim() || undefined,
    city: query.city?.trim() || undefined,
  };
  const { data } = await api.get<DiscoverSchoolsApiResponse>(
    "/discover/schools",
    { params },
  );

  return {
    items: data.data,
    pagination: data.pagination,
  };
}

export async function fetchDiscoverSchoolById(schoolId: string) {
  const { data } = await api.get<DiscoverSchoolDetailApiResponse>(
    `/discover/schools/${encodeURIComponent(schoolId)}`,
  );

  return data.data;
}
