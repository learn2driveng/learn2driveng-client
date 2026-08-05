import {
  attachSchoolDocument,
  createSchoolDocumentUploadUrl,
} from "@/lib/api/driving-schools";
import type { SchoolVerificationDocumentType } from "@/types";

export async function uploadSchoolVerificationDocument(input: {
  type: SchoolVerificationDocumentType;
  uri: string;
  fileName: string;
  mimeType: string;
  size?: number | null;
  label?: string;
}) {
  const uploadDetails = await createSchoolDocumentUploadUrl({
    type: input.type,
    filename: input.fileName,
    mimeType: input.mimeType,
    label: input.label,
  });

  const fileResponse = await fetch(input.uri);
  const blob = await fileResponse.blob();
  const uploadResponse = await fetch(uploadDetails.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": input.mimeType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error("We could not upload the selected document.");
  }

  return attachSchoolDocument({
    type: input.type,
    storageKey: uploadDetails.key,
    originalFilename: input.fileName,
    mimeType: input.mimeType,
    label: input.label,
    sizeInBytes: input.size ?? undefined,
  });
}
