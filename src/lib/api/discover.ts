import { api } from "@/lib/api/client";
import type { PaginationMeta } from "@/types/api";
import type {
  PublicDrivingSchoolInstructor,
  PublicDrivingSchoolDetail,
  PublicDrivingSchoolListItem,
  PublicDrivingSchoolVehicle,
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
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: data?.pagination ?? {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
      total: 0,
      totalPages: 0,
    },
  };
}

export async function fetchDiscoverSchoolById(schoolId: string) {
  const { data } = await api.get<DiscoverSchoolDetailApiResponse>(
    `/discover/schools/${encodeURIComponent(schoolId)}`,
  );

  return data.data;
}

type DiscoverSchoolCollectionResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  pagination: PaginationMeta;
};

async function fetchDiscoverSchoolCollection<T>(
  schoolId: string,
  collection: "instructors" | "vehicles",
  page: number,
  limit: number,
) {
  const { data } = await api.get<DiscoverSchoolCollectionResponse<T>>(
    `/discover/schools/${encodeURIComponent(schoolId)}/${collection}`,
    { params: { page, limit } },
  );

  return {
    items: Array.isArray(data?.data) ? data.data : [],
    pagination: data.pagination,
  };
}

export function fetchDiscoverSchoolInstructors(
  schoolId: string,
  page = 1,
  limit = 20,
) {
  return fetchDiscoverSchoolCollection<PublicDrivingSchoolInstructor>(
    schoolId,
    "instructors",
    page,
    limit,
  );
}

export function fetchDiscoverSchoolVehicles(
  schoolId: string,
  page = 1,
  limit = 20,
) {
  return fetchDiscoverSchoolCollection<PublicDrivingSchoolVehicle>(
    schoolId,
    "vehicles",
    page,
    limit,
  );
}
