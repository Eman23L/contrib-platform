import { NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/auth/urls";
import { startContributionCheckout } from "@/lib/services/public/startContributionCheckout";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await startContributionCheckout(
      payload,
      getRequestOrigin(request),
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? getPublicCheckoutErrorMessage(error.message)
        : "We could not start secure checkout. Please try again.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 },
    );
  }
}

function getPublicCheckoutErrorMessage(message: string) {
  const allowedMessages = new Set([
    "Amount must be greater than zero.",
    "Contribution amount is too large.",
    "Email address is required for receipts and giving history.",
    "Enter a valid email address.",
    "Fund selection is required.",
    "Minimum contribution amount is 1.00.",
    "Organisation not found.",
    "Organisation slug is required.",
    "Please sign in before starting checkout.",
    "Selected fund was not found.",
    "Stripe Checkout is currently configured only for GBP.",
  ]);

  if (message.endsWith(" must be 80 characters or fewer.")) {
    return message;
  }

  if (allowedMessages.has(message)) {
    return message;
  }

  console.error("[api/public/contribution-intents] Checkout start failed", {
    message,
  });

  return "We could not start secure checkout. Please try again.";
}
