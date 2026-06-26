import "server-only";

import Stripe from "stripe";

import {
  getRequiredServerEnv,
  logServerEnvPresence,
} from "@/lib/env/server";

let stripeClient: Stripe | null = null;

export function getStripeServerClient() {
  if (stripeClient) {
    return stripeClient;
  }

  const context = "getStripeServerClient";

  logServerEnvPresence(context);

  stripeClient = new Stripe(getRequiredServerEnv("STRIPE_SECRET_KEY", context), {
    maxNetworkRetries: 2,
  });

  return stripeClient;
}

export function getStripeWebhookSecret() {
  return getRequiredServerEnv("STRIPE_WEBHOOK_SECRET", "getStripeWebhookSecret");
}
