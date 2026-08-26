export type SamplePaymentResult = "success" | "pending" | "failed";

const paymentResultByMethod: Record<string, SamplePaymentResult> = {
  card: "success",
  bank_transfer: "pending",
};

/** Presentation fixture used to preview checkout result states. */
export function getSamplePaymentResult(method: string | undefined) {
  return paymentResultByMethod[method ?? "card"] ?? "success";
}
