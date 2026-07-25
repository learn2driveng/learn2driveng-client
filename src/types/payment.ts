export type PaymentProvider = "paystack";

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
