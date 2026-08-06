import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";
import type { Payment } from "@/types/payment";

export async function initializePayment(bookingId: string) {
  const { data } = await api.post<ApiSuccessResponse<Payment>>(
    "/payments/initialize",
    { bookingId },
  );
  return data.data;
}

export async function verifyPayment(paymentId: string) {
  const { data } = await api.post<ApiSuccessResponse<Payment>>(
    `/payments/${encodeURIComponent(paymentId)}/verify`,
  );
  return data.data;
}
