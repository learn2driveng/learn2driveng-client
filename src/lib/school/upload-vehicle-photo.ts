import { createVehiclePhotoUploadUrl, updateSchoolVehicle } from "@/lib/api";

const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadVehiclePhoto(input: {
  vehicleId: string;
  uri: string;
  fileName: string;
  mimeType: string | null | undefined;
  size?: number | null;
}) {
  if (!supportedMimeTypes.includes(input.mimeType as (typeof supportedMimeTypes)[number])) {
    throw new Error("Choose a JPG, PNG, or WebP vehicle photograph.");
  }
  if (input.size != null && input.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("The vehicle photograph must be 5 MB or smaller.");
  }
  const mimeType = input.mimeType as (typeof supportedMimeTypes)[number];
  const uploadDetails = await createVehiclePhotoUploadUrl(input.vehicleId, {
    filename: input.fileName,
    mimeType,
  });
  const blob = await (await fetch(input.uri)).blob();
  const response = await fetch(uploadDetails.uploadUrl, {
    method: "PUT",
    headers: uploadDetails.headers ?? { "Content-Type": mimeType },
    body: blob,
  });
  if (!response.ok) throw new Error("We could not upload the vehicle photograph.");
  return updateSchoolVehicle(input.vehicleId, { photoUrl: uploadDetails.fileUrl });
}
