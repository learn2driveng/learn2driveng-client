import { api } from "@/lib/api/client";
import type { ApiSuccessResponse } from "@/types";
import type { Payment, PaymentChannel } from "@/types/payment";

export async function initializePayment(
  bookingId: string,
  channel: PaymentChannel,
) {
  const { data } = await api.post<ApiSuccessResponse<Payment>>(
    "/payments/initialize",
    { bookingId, channel },
  );
  return data.data;
}

export async function verifyPaymentByReference(reference: string) {
  const { data } = await api.post<ApiSuccessResponse<Payment>>(
    `/payments/reference/${encodeURIComponent(reference)}/verify`,
  );
  return data.data;
}

export async function verifyPayment(paymentId: string) {
  const { data } = await api.post<ApiSuccessResponse<Payment>>(
    `/payments/${encodeURIComponent(paymentId)}/verify`,
  );
  return data.data;
}
