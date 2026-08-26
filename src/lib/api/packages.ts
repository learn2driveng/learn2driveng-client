import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, TrainingPackage, VehicleTransmissionType } from "@/types";

export type CreatePackageInput = {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  numberOfLessons: number;
  durationInDays: number;
  eligibleTransmissions?: VehicleTransmissionType[];
  isActive?: boolean;
};

export type UpdatePackageInput = Partial<CreatePackageInput>;

export async function fetchSchoolPackages() {
  const { data } =
    await api.get<ApiSuccessResponse<TrainingPackage[]>>("/packages");
  return data.data;
}

export async function createSchoolPackage(input: CreatePackageInput) {
  const { data } = await api.post<ApiSuccessResponse<TrainingPackage>>(
    "/packages",
    input,
  );
  return data.data;
}

export async function updateSchoolPackage(
  packageId: string,
  input: UpdatePackageInput,
) {
  const { data } = await api.patch<ApiSuccessResponse<TrainingPackage>>(
    `/packages/${packageId}`,
    input,
  );
  return data.data;
}

export async function deleteSchoolPackage(packageId: string) {
  await api.delete(`/packages/${packageId}`);
}
