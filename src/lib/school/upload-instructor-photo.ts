import {
  createInstructorPhotoUploadUrl,
  updateSchoolInstructor,
} from "@/lib/api";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

export async function uploadInstructorPhoto(input: {
  instructorId: string;
  uri: string;
  fileName: string;
  mimeType: string | null | undefined;
  size?: number | null;
}) {
  if (!supportedMimeTypes.includes(input.mimeType as (typeof supportedMimeTypes)[number])) {
    throw new Error("Choose a JPG, PNG, or WebP passport photograph.");
  }
  if (input.size != null && input.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("The passport photograph must be 5 MB or smaller.");
  }

  const mimeType = input.mimeType as (typeof supportedMimeTypes)[number];
  const uploadDetails = await createInstructorPhotoUploadUrl(input.instructorId, {
    filename: input.fileName,
    mimeType,
  });
  const fileResponse = await fetch(input.uri);
  const blob = await fileResponse.blob();
  const uploadResponse = await fetch(uploadDetails.uploadUrl, {
    method: "PUT",
    headers: uploadDetails.headers ?? { "Content-Type": mimeType },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("We could not upload the passport photograph.");
  }

  return updateSchoolInstructor(input.instructorId, {
    profilePhoto: uploadDetails.fileUrl,
  });
}
