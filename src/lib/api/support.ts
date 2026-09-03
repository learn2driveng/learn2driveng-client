import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";

export type SupportRequestContext =
  | "support"
  | "payment"
  | "problem"
  | "school";

export async function createSupportRequest(input: {
  context: SupportRequestContext;
  subject: string;
  message: string;
}) {
  const { data } = await api.post<ApiSuccessResponse<{ id: string }>>(
    "/support-requests",
    input,
  );
  return data.data;
}
