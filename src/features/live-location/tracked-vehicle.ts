export type TrackedVehicle = {
  color?: string | null;
  make?: string | null;
  model?: string | null;
  plateNumber?: string | null;
  year?: number | null;
};

export function formatTrackedVehicle(vehicle?: TrackedVehicle | null) {
  if (!vehicle) return "Training vehicle";

  const description = [
    vehicle.color?.trim(),
    vehicle.year ? String(vehicle.year) : null,
    vehicle.make?.trim(),
    vehicle.model?.trim(),
  ]
    .filter(Boolean)
    .join(" ");
  const plateNumber = vehicle.plateNumber?.trim();

  if (description && plateNumber) return `${description} · ${plateNumber}`;
  return description || plateNumber || "Training vehicle";
}

export function formatTrackedVehicleMarker(vehicle?: TrackedVehicle | null) {
  if (!vehicle) return "Training vehicle";

  const makeAndModel = [vehicle.make?.trim(), vehicle.model?.trim()]
    .filter(Boolean)
    .join(" ");
  const plateNumber = vehicle.plateNumber?.trim();

  if (makeAndModel && plateNumber) return `${makeAndModel} · ${plateNumber}`;
  return makeAndModel || plateNumber || formatTrackedVehicle(vehicle);
}
