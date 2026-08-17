export type PaymentProvider = "paystack";

export const paymentChannels = ["card", "bank_transfer"] as const;

export type PaymentChannel = (typeof paymentChannels)[number];

export function isPaymentChannel(value: unknown): value is PaymentChannel {
  return (
    typeof value === "string" &&
    paymentChannels.some((channel) => channel === value)
  );
}

export function parsePaymentChannel(value: unknown): PaymentChannel {
  return isPaymentChannel(value) ? value : "card";
}

export type PaymentStatus =
  | "initiated"
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  bookingId: string;
  payerUserId: string;
  schoolId: string;
  provider: PaymentProvider;
  channel?: PaymentChannel | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  providerReference: string;
  providerTransactionId?: string | null;
  authorizationUrl?: string | null;
  paidAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface InitializePaymentPayload {
  bookingId: string;
}

export interface InitializePaymentResult {
  payment: Payment;
  authorizationUrl: string;
}
