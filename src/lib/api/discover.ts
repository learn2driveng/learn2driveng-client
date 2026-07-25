import { apiRequest } from "@/lib/api/client";
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

function buildDiscoverQueryString(query: DiscoverSchoolsQuery) {
  const params = new URLSearchParams();

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }
  if (query.state?.trim()) {
    params.set("state", query.state.trim());
  }
  if (query.city?.trim()) {
    params.set("city", query.city.trim());
  }
  if (query.minRating != null) {
    params.set("minRating", String(query.minRating));
  }
  if (query.latitude != null && query.longitude != null) {
    params.set("latitude", String(query.latitude));
    params.set("longitude", String(query.longitude));
  }
  if (query.radiusKm != null) {
    params.set("radiusKm", String(query.radiusKm));
  }
  if (query.sort) {
    params.set("sort", query.sort);
  }
  if (query.page != null) {
    params.set("page", String(query.page));
  }
  if (query.limit != null) {
    params.set("limit", String(query.limit));
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export async function fetchDiscoverSchools(query: DiscoverSchoolsQuery) {
  const response = await apiRequest<DiscoverSchoolsApiResponse>(
    `/discover/schools${buildDiscoverQueryString(query)}`,
  );

  return {
    items: response.data,
    pagination: response.pagination,
  };
}

export async function fetchDiscoverSchoolById(schoolId: string) {
  const response = await apiRequest<DiscoverSchoolDetailApiResponse>(
    `/discover/schools/${encodeURIComponent(schoolId)}`,
  );

  return response.data;
}
