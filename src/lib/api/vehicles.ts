import { api } from "@/lib/api/client";
import type { ApiSuccessResponse, Vehicle, VehicleTransmissionType } from "@/types";

export type CreateVehicleInput = {
  make: string;
  model: string;
  year: number;
  plateNumber: string;
  color?: string;
  transmissionType: VehicleTransmissionType;
  isActive?: boolean;
};

export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export async function fetchSchoolVehicles() {
  const { data } = await api.get<ApiSuccessResponse<Vehicle[]>>("/vehicles");
  return data.data;
}

export async function createSchoolVehicle(input: CreateVehicleInput) {
  const { data } = await api.post<ApiSuccessResponse<Vehicle>>(
    "/vehicles",
    input,
  );
  return data.data;
}

export async function updateSchoolVehicle(
  vehicleId: string,
  input: UpdateVehicleInput,
) {
  const { data } = await api.patch<ApiSuccessResponse<Vehicle>>(
    `/vehicles/${vehicleId}`,
    input,
  );
  return data.data;
}
