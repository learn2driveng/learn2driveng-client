import {
  submitMyInstructorPhoto,
  createMyInstructorPhotoUploadUrl,
} from "@/lib/api/users";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

function mimeTypeFromUri(uri: string) {
  const extension = uri.split(/[?#]/, 1)[0]?.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

export async function uploadOwnInstructorPhoto(input: {
  uri: string;
  fileName: string;
  mimeType?: string | null;
  size?: number | null;
}) {
  if (input.size != null && input.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("Your photo must be 5 MB or smaller.");
  }

  const fileResponse = await fetch(input.uri);
  const blob = await fileResponse.blob();
  if (blob.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("Your photo must be 5 MB or smaller.");
  }
  const mimeType = [blob.type, input.mimeType, mimeTypeFromUri(input.uri)].find(
    (value) => supportedMimeTypes.includes(value as (typeof supportedMimeTypes)[number]),
  ) as (typeof supportedMimeTypes)[number] | undefined;
  if (!mimeType) {
    throw new Error("Choose a JPG, PNG, or WebP photo.");
  }

  const upload = await createMyInstructorPhotoUploadUrl({
    filename: input.fileName,
    mimeType,
  });

  const response = await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: upload.headers ?? { "Content-Type": mimeType },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("We could not upload your photo. Please try again.");
  }

  return submitMyInstructorPhoto(upload.key);
}
