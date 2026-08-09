import { createSchoolLogoUploadUrl, updateMyDrivingSchool } from "@/lib/api";

const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;
const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

type SupportedLogoMimeType = (typeof supportedMimeTypes)[number];

function isSupportedMimeType(value: string): value is SupportedLogoMimeType {
  return supportedMimeTypes.includes(value as SupportedLogoMimeType);
}

export async function uploadSchoolLogo(input: {
  uri: string;
  fileName: string;
  mimeType: string | null | undefined;
  size?: number | null;
}) {
  const mimeType = input.mimeType ?? "";
  if (!isSupportedMimeType(mimeType)) {
    throw new Error("Choose a JPG, PNG, or WebP image for your school logo.");
  }
  if (input.size != null && input.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error("Your school logo must be 5 MB or smaller.");
  }

  const uploadDetails = await createSchoolLogoUploadUrl({
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
    throw new Error("We could not upload your school logo.");
  }

  return updateMyDrivingSchool({ logoUrl: uploadDetails.fileUrl });
}
