import { beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";

import { FakeSupabase } from "@/lib/services/testUtils/fakeSupabase";

const constructEvent = vi.fn();

vi.mock("@/lib/stripe/server", () => ({
  getStripeServerClient: () => ({
    webhooks: { constructEvent },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

let fakeSupabase: FakeSupabase;

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseServiceClient: () => fakeSupabase,
}));

const { processStripeWebhook } = await import("@/lib/services/processStripeWebhook");

const ORG_ID = "org-1";
const INTENT_ID = "intent-1";
const FUND_ID = "fund-1";

function seedIntent(overrides: Record<string, unknown> = {}) {
  fakeSupabase.seed("contribution_intents", [
    {
      id: INTENT_ID,
      organisation_id: ORG_ID,
      fund_id: FUND_ID,
      amount_minor: 1000,
      currency_code: "GBP",
      status: "checkout_created",
      stripe_checkout_session_id: null,
      ...overrides,
    },
  ]);
}

function seedSucceededPayment(overrides: Record<string, unknown> = {}) {
  fakeSupabase.seed("payments", [
    {
      id: "payment-1",
      organisation_id: ORG_ID,
      contribution_intent_id: INTENT_ID,
      status: "succeeded",
      amount_minor: 1000,
      currency_code: "GBP",
      stripe_checkout_session_id: "cs_test_1",
      stripe_payment_intent_id: "pi_test_1",
      ...overrides,
    },
  ]);
}

function checkoutCompletedEvent(overrides: Partial<Stripe.Checkout.Session> = {}): Stripe.Event {
  return {
    id: "evt_1",
    type: "checkout.session.completed",
    created: 1_700_000_000,
    data: {
      object: {
        id: "cs_test_1",
        payment_intent: "pi_test_1",
        metadata: {
          intent_id: INTENT_ID,
          organisation_id: ORG_ID,
        },
        ...overrides,
      },
    },
  } as unknown as Stripe.Event;
}

beforeEach(() => {
  fakeSupabase = new FakeSupabase();
  fakeSupabase.setUniqueColumns("webhook_events", ["external_event_id"]);
  fakeSupabase.setUniqueColumns("payments", ["contribution_intent_id"]);
  constructEvent.mockReset();
});

describe("processStripeWebhook", () => {
  it("rejects a request with no Stripe signature", async () => {
    const result = await processStripeWebhook("{}", null);

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("Missing Stripe signature.");
  });

  it("rejects a request that fails signature verification", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });

    const result = await processStripeWebhook("{}", "sig_bad");

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("bad signature");
  });

  it("marks the contribution intent succeeded and records a payment on checkout.session.completed", async () => {
    seedIntent();
    const event = checkoutCompletedEvent();
    constructEvent.mockReturnValue(event);

    const result = await processStripeWebhook("{}", "sig_ok");

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ received: true, processed: true });

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("succeeded");
    expect(intent.stripe_checkout_session_id).toBe("cs_test_1");

    const [payment] = fakeSupabase.rows("payments");
    expect(payment).toMatchObject({
      organisation_id: ORG_ID,
      contribution_intent_id: INTENT_ID,
      status: "succeeded",
      amount_minor: 1000,
      stripe_payment_intent_id: "pi_test_1",
    });
  });

  it("is idempotent: replaying the same Stripe event does not double-process it", async () => {
    seedIntent();
    const event = checkoutCompletedEvent();
    constructEvent.mockReturnValue(event);

    const first = await processStripeWebhook("{}", "sig_ok");
    const second = await processStripeWebhook("{}", "sig_ok");

    expect(first.body).toMatchObject({ processed: true });
    expect(second.body).toMatchObject({ received: true, duplicate: true });

    expect(fakeSupabase.rows("payments")).toHaveLength(1);
    expect(fakeSupabase.rows("webhook_events")).toHaveLength(1);
  });

  it("refuses to process a checkout session whose org metadata does not match the stored intent", async () => {
    seedIntent();
    const event = checkoutCompletedEvent({
      metadata: { intent_id: INTENT_ID, organisation_id: "some-other-org" },
    });
    constructEvent.mockReturnValue(event);

    const result = await processStripeWebhook("{}", "sig_ok");

    expect(result.status).toBe(400);
    expect(String(result.body.error)).toContain(
      "Stripe metadata organisation does not match",
    );

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("checkout_created");
    expect(fakeSupabase.rows("payments")).toHaveLength(0);

    const [webhookEvent] = fakeSupabase.rows("webhook_events");
    expect(webhookEvent.status).toBe("failed");
  });

  it("marks the contribution intent expired on checkout.session.expired", async () => {
    seedIntent();
    const event: Stripe.Event = {
      id: "evt_2",
      type: "checkout.session.expired",
      created: 1_700_000_000,
      data: {
        object: {
          id: "cs_test_1",
          metadata: { intent_id: INTENT_ID, organisation_id: ORG_ID },
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    const result = await processStripeWebhook("{}", "sig_ok");

    expect(result.status).toBe(200);
    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("expired");
  });

  it("never downgrades a succeeded gift back to a terminal failure state", async () => {
    seedIntent({ status: "succeeded", stripe_checkout_session_id: "cs_test_1" });
    const event: Stripe.Event = {
      id: "evt_3",
      type: "checkout.session.async_payment_failed",
      created: 1_700_000_000,
      data: {
        object: {
          id: "cs_test_1",
          metadata: { intent_id: INTENT_ID, organisation_id: ORG_ID },
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    await processStripeWebhook("{}", "sig_ok");

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("succeeded");
  });

  it("marks the payment and contribution intent refunded on a full charge.refunded event", async () => {
    seedIntent({ status: "succeeded", stripe_checkout_session_id: "cs_test_1" });
    seedSucceededPayment();
    const event: Stripe.Event = {
      id: "evt_refund_1",
      type: "charge.refunded",
      created: 1_700_000_000,
      data: {
        object: {
          id: "ch_test_1",
          payment_intent: "pi_test_1",
          refunded: true,
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    const result = await processStripeWebhook("{}", "sig_ok");

    expect(result.status).toBe(200);
    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("refunded");
    const [payment] = fakeSupabase.rows("payments");
    expect(payment.status).toBe("refunded");
  });

  it("leaves a succeeded gift untouched on a partial charge.refunded event", async () => {
    seedIntent({ status: "succeeded", stripe_checkout_session_id: "cs_test_1" });
    seedSucceededPayment();
    const event: Stripe.Event = {
      id: "evt_refund_2",
      type: "charge.refunded",
      created: 1_700_000_000,
      data: {
        object: {
          id: "ch_test_1",
          payment_intent: "pi_test_1",
          refunded: false,
          amount_refunded: 200,
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    await processStripeWebhook("{}", "sig_ok");

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("succeeded");
    const [payment] = fakeSupabase.rows("payments");
    expect(payment.status).toBe("succeeded");
  });

  it("marks a gift disputed on charge.dispute.created", async () => {
    seedIntent({ status: "succeeded", stripe_checkout_session_id: "cs_test_1" });
    seedSucceededPayment();
    const event: Stripe.Event = {
      id: "evt_dispute_1",
      type: "charge.dispute.created",
      created: 1_700_000_000,
      data: {
        object: {
          id: "dp_test_1",
          payment_intent: "pi_test_1",
          status: "needs_response",
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    await processStripeWebhook("{}", "sig_ok");

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("disputed");
  });

  it("restores succeeded status when a dispute is closed as won", async () => {
    seedIntent({ status: "disputed", stripe_checkout_session_id: "cs_test_1" });
    seedSucceededPayment({ status: "disputed" });
    const event: Stripe.Event = {
      id: "evt_dispute_2",
      type: "charge.dispute.closed",
      created: 1_700_000_000,
      data: {
        object: {
          id: "dp_test_1",
          payment_intent: "pi_test_1",
          status: "won",
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    await processStripeWebhook("{}", "sig_ok");

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("succeeded");
  });

  it("marks a gift refunded when a dispute is closed as lost", async () => {
    seedIntent({ status: "disputed", stripe_checkout_session_id: "cs_test_1" });
    seedSucceededPayment({ status: "disputed" });
    const event: Stripe.Event = {
      id: "evt_dispute_3",
      type: "charge.dispute.closed",
      created: 1_700_000_000,
      data: {
        object: {
          id: "dp_test_1",
          payment_intent: "pi_test_1",
          status: "lost",
        },
      },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    await processStripeWebhook("{}", "sig_ok");

    const [intent] = fakeSupabase.rows("contribution_intents");
    expect(intent.status).toBe("refunded");
  });

  it("ignores event types it does not handle, but still records the webhook event", async () => {
    const event: Stripe.Event = {
      id: "evt_4",
      type: "customer.created",
      created: 1_700_000_000,
      data: { object: {} },
    } as unknown as Stripe.Event;
    constructEvent.mockReturnValue(event);

    const result = await processStripeWebhook("{}", "sig_ok");

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ received: true, ignored: true });
    const [webhookEvent] = fakeSupabase.rows("webhook_events");
    expect(webhookEvent.status).toBe("processed");
  });
});
