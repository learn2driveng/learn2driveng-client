import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import { verifyPayment } from "@/lib/api";
import type { PaymentStatus } from "@/types/payment";

const TERMINAL_STATUSES: PaymentStatus[] = ["success", "failed"];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type PaystackCheckoutResult = {
  paymentStatus: PaymentStatus;
  autoDismissed: boolean;
};

/**
 * Opens Paystack checkout and closes the browser as soon as the backend
 * confirms a terminal payment status. Paystack often keeps its success page
 * open until the user taps close, so polling is required for a smooth return.
 */
export async function openPaystackCheckout(input: {
  authorizationUrl: string;
  paymentId: string;
  returnUrlPrefix: string;
  pollIntervalMs?: number;
}): Promise<PaystackCheckoutResult> {
  let stop = false;
  let paymentStatus: PaymentStatus = "pending";
  let autoDismissed = false;

  const linkingSubscription = Linking.addEventListener("url", ({ url }) => {
    if (!url.startsWith(input.returnUrlPrefix)) {
      return;
    }

    stop = true;
    void WebBrowser.dismissBrowser().catch(() => undefined);
  });

  const pollVerification = async () => {
    while (!stop) {
      await delay(input.pollIntervalMs ?? 2000);
      if (stop) {
        return;
      }

      try {
        const verified = await verifyPayment(input.paymentId);
        if (TERMINAL_STATUSES.includes(verified.status)) {
          paymentStatus = verified.status;
          autoDismissed = true;
          stop = true;
          await WebBrowser.dismissBrowser().catch(() => undefined);
          return;
        }
      } catch {
        // Payment may still be processing on Paystack.
      }
    }
  };

  const pollTask = pollVerification();

  try {
    await WebBrowser.openBrowserAsync(input.authorizationUrl, {
      dismissButtonStyle: "close",
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  } finally {
    stop = true;
    linkingSubscription.remove();
    await pollTask.catch(() => undefined);
  }

  if (!TERMINAL_STATUSES.includes(paymentStatus)) {
    try {
      paymentStatus = (await verifyPayment(input.paymentId)).status;
    } catch {
      paymentStatus = "pending";
    }
  }

  return { paymentStatus, autoDismissed };
}

export function paystackReturnUrlPrefix() {
  return Linking.createURL("checkout/payment-return", {
    scheme: "learn2driveng",
  });
}
