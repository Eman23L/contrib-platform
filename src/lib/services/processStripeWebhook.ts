import type Stripe from "stripe";

import {
  getStripeWebhookSecret,
  getStripeServerClient,
} from "@/lib/stripe/server";
import { createServerSupabaseServiceClient } from "@/lib/supabase/server";
import type { ContributionIntent } from "@/types/domain";

type WebhookEventStatus = "received" | "processed" | "failed";

type WebhookEventRow = {
  id: string;
  organisation_id: string | null;
  status: WebhookEventStatus;
};

type ContributionIntentWebhookRow = {
  id: string;
  organisation_id: string;
  amount_minor: number;
  currency_code: string;
  status: ContributionIntent["status"];
  stripe_checkout_session_id: string | null;
};

type ProcessStripeWebhookResult = {
  ok: boolean;
  status: number;
  body: Record<string, unknown>;
};

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

async function findWebhookEvent(
  externalEventId: string,
): Promise<WebhookEventRow | null> {
  const supabase = createServerSupabaseServiceClient();
  const { data, error } = await supabase
    .from("webhook_events")
    .select("id, organisation_id, status")
    .eq("provider", "stripe")
    .eq("external_event_id", externalEventId)
    .maybeSingle<WebhookEventRow>();

  if (error) {
    throw new Error(`Failed to load webhook event: ${error.message}`);
  }

  return data;
}

async function ensureWebhookEvent(
  event: Stripe.Event,
): Promise<{ record: WebhookEventRow; shouldProcess: boolean }> {
  const supabase = createServerSupabaseServiceClient();
  const existing = await findWebhookEvent(event.id);

  if (existing) {
    if (existing.status === "processed" || existing.status === "received") {
      return {
        record: existing,
        shouldProcess: false,
      };
    }

    const { data, error } = await supabase
      .from("webhook_events")
      .update({
        status: "received",
        payload: event,
        last_error: null,
      })
      .eq("id", existing.id)
      .select("id, organisation_id, status")
      .single<WebhookEventRow>();

    if (error) {
      throw new Error(`Failed to reset webhook event: ${error.message}`);
    }

    return {
      record: data,
      shouldProcess: true,
    };
  }

  const { data, error } = await supabase
    .from("webhook_events")
    .insert({
      provider: "stripe",
      external_event_id: event.id,
      event_type: event.type,
      status: "received",
      payload: event,
    })
    .select("id, organisation_id, status")
    .single<WebhookEventRow>();

  if (!error) {
    return {
      record: data,
      shouldProcess: true,
    };
  }

  if (!isUniqueViolation(error)) {
    throw new Error(`Failed to create webhook event: ${error.message}`);
  }

  const current = await findWebhookEvent(event.id);

  if (!current) {
    throw new Error("Webhook event already exists but could not be reloaded.");
  }

  return {
    record: current,
    shouldProcess: current.status === "failed",
  };
}

async function updateWebhookEvent(
  webhookEventId: string,
  values: {
    organisationId?: string | null;
    status: WebhookEventStatus;
    lastError?: string | null;
    processedAt?: string | null;
  },
) {
  const supabase = createServerSupabaseServiceClient();
  const payload: Record<string, string | null> = {
    status: values.status,
    last_error: values.lastError ?? null,
    processed_at:
      values.status === "processed" ? values.processedAt ?? new Date().toISOString() : null,
  };

  if (values.organisationId !== undefined) {
    payload.organisation_id = values.organisationId;
  }

  const { error } = await supabase
    .from("webhook_events")
    .update(payload)
    .eq("id", webhookEventId);

  if (error) {
    throw new Error(`Failed to update webhook event: ${error.message}`);
  }
}

async function markIntentSucceeded(input: {
  intentId: string;
  sessionId: string;
  paidAt: string;
}) {
  const supabase = createServerSupabaseServiceClient();
  const { error } = await supabase
    .from("contribution_intents")
    .update({
      status: "succeeded",
      stripe_checkout_session_id: input.sessionId,
      paid_at: input.paidAt,
    })
    .eq("id", input.intentId);

  if (error) {
    throw new Error(`Failed to update contribution intent: ${error.message}`);
  }
}

async function markIntentTerminal(input: {
  intentId: string;
  organisationId?: string;
  sessionId?: string;
  status: Extract<ContributionIntent["status"], "cancelled" | "expired" | "failed">;
}) {
  const contributionIntent = await loadContributionIntent(input.intentId);

  if (
    input.organisationId &&
    contributionIntent.organisation_id !== input.organisationId
  ) {
    throw new Error("Stripe metadata organisation does not match the contribution intent.");
  }

  if (
    input.sessionId &&
    contributionIntent.stripe_checkout_session_id &&
    contributionIntent.stripe_checkout_session_id !== input.sessionId
  ) {
    throw new Error("Stripe Checkout session ID does not match the stored intent.");
  }

  if (contributionIntent.status === "succeeded") {
    return {
      organisationId: contributionIntent.organisation_id,
    };
  }

  const supabase = createServerSupabaseServiceClient();
  const { error } = await supabase
    .from("contribution_intents")
    .update({
      status: input.status,
      stripe_checkout_session_id:
        input.sessionId ?? contributionIntent.stripe_checkout_session_id,
    })
    .eq("id", contributionIntent.id);

  if (error) {
    throw new Error(`Failed to update contribution intent status: ${error.message}`);
  }

  return {
    organisationId: contributionIntent.organisation_id,
  };
}

async function insertOrUpdatePayment(input: {
  organisationId: string;
  contributionIntentId: string;
  amountMinor: number;
  currencyCode: string;
  sessionId: string;
  paymentIntentId: string | null;
  paidAt: string;
  eventId: string;
}) {
  const supabase = createServerSupabaseServiceClient();
  const { error } = await supabase.from("payments").upsert(
    {
      organisation_id: input.organisationId,
      contribution_intent_id: input.contributionIntentId,
      payment_provider: "stripe",
      status: "succeeded",
      amount_minor: input.amountMinor,
      currency_code: input.currencyCode,
      stripe_checkout_session_id: input.sessionId,
      stripe_payment_intent_id: input.paymentIntentId,
      paid_at: input.paidAt,
      metadata: {
        stripe_event_id: input.eventId,
      },
    },
    {
      onConflict: "contribution_intent_id",
    },
  );

  if (error) {
    throw new Error(`Failed to upsert payment: ${error.message}`);
  }
}

async function loadContributionIntent(
  intentId: string,
): Promise<ContributionIntentWebhookRow> {
  const supabase = createServerSupabaseServiceClient();
  const { data, error } = await supabase
    .from("contribution_intents")
    .select(
      "id, organisation_id, amount_minor, currency_code, status, stripe_checkout_session_id",
    )
    .eq("id", intentId)
    .single<ContributionIntentWebhookRow>();

  if (error) {
    throw new Error(`Failed to load contribution intent: ${error.message}`);
  }

  return data;
}

function getSessionPaymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) {
    return null;
  }

  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent.id;
}

async function processCompletedCheckout(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const intentId = session.metadata?.intent_id;
  const organisationId = session.metadata?.organisation_id;

  if (!intentId || !organisationId) {
    throw new Error("Stripe Checkout session is missing required metadata.");
  }

  const contributionIntent = await loadContributionIntent(intentId);

  if (contributionIntent.organisation_id !== organisationId) {
    throw new Error("Stripe metadata organisation does not match the contribution intent.");
  }

  if (
    contributionIntent.stripe_checkout_session_id &&
    contributionIntent.stripe_checkout_session_id !== session.id
  ) {
    throw new Error("Stripe Checkout session ID does not match the stored intent.");
  }

  const paidAt = new Date(event.created * 1000).toISOString();

  await markIntentSucceeded({
    intentId: contributionIntent.id,
    sessionId: session.id,
    paidAt,
  });

  await insertOrUpdatePayment({
    organisationId: contributionIntent.organisation_id,
    contributionIntentId: contributionIntent.id,
    amountMinor: contributionIntent.amount_minor,
    currencyCode: contributionIntent.currency_code,
    sessionId: session.id,
    paymentIntentId: getSessionPaymentIntentId(session),
    paidAt,
    eventId: event.id,
  });

  return {
    organisationId: contributionIntent.organisation_id,
  };
}

async function processCheckoutSessionStatus(
  event: Stripe.Event,
  status: Extract<ContributionIntent["status"], "expired" | "failed">,
) {
  const session = event.data.object as Stripe.Checkout.Session;
  const intentId = session.metadata?.intent_id;
  const organisationId = session.metadata?.organisation_id;

  if (!intentId || !organisationId) {
    throw new Error("Stripe Checkout session is missing required metadata.");
  }

  return markIntentTerminal({
    intentId,
    organisationId,
    sessionId: session.id,
    status,
  });
}

async function processPaymentIntentStatus(
  event: Stripe.Event,
  status: Extract<ContributionIntent["status"], "cancelled" | "failed">,
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const intentId = paymentIntent.metadata?.intent_id;
  const organisationId = paymentIntent.metadata?.organisation_id;

  if (!intentId) {
    return {
      organisationId: null,
    };
  }

  return markIntentTerminal({
    intentId,
    organisationId,
    status,
  });
}

export async function processStripeWebhook(
  payload: string,
  signature: string | null,
): Promise<ProcessStripeWebhookResult> {
  const stripe = getStripeServerClient();
  const webhookSecret = getStripeWebhookSecret();
  let event: Stripe.Event;

  if (!signature) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "Missing Stripe signature.",
      },
    };
  }

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      body: {
        error:
          error instanceof Error
            ? error.message
            : "Stripe signature verification failed.",
      },
    };
  }

  let webhookEvent: WebhookEventRow | null = null;

  try {
    const ensured = await ensureWebhookEvent(event);
    webhookEvent = ensured.record;

    if (!ensured.shouldProcess) {
      return {
        ok: true,
        status: 200,
        body: {
          received: true,
          duplicate: true,
        },
      };
    }

    let result: { organisationId: string | null } | null = null;

    switch (event.type) {
      case "checkout.session.completed":
        result = await processCompletedCheckout(event);
        break;
      case "checkout.session.expired":
        result = await processCheckoutSessionStatus(event, "expired");
        break;
      case "checkout.session.async_payment_failed":
        result = await processCheckoutSessionStatus(event, "failed");
        break;
      case "payment_intent.canceled":
        result = await processPaymentIntentStatus(event, "cancelled");
        break;
      case "payment_intent.payment_failed":
        result = await processPaymentIntentStatus(event, "failed");
        break;
      default:
        await updateWebhookEvent(webhookEvent.id, {
          status: "processed",
        });

        return {
          ok: true,
          status: 200,
          body: {
            received: true,
            ignored: true,
          },
        };
    }

    await updateWebhookEvent(webhookEvent.id, {
      organisationId: result.organisationId,
      status: "processed",
    });

    return {
      ok: true,
      status: 200,
      body: {
        received: true,
        processed: true,
      },
    };
  } catch (error) {
    if (webhookEvent) {
      await updateWebhookEvent(webhookEvent.id, {
        status: "failed",
        lastError: error instanceof Error ? error.message : "Unknown Stripe webhook error.",
      });
    }

    return {
      ok: false,
      status: 400,
      body: {
        error: error instanceof Error ? error.message : "Failed to process Stripe webhook.",
      },
    };
  }
}
