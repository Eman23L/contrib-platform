# Stripe and Payment Flow

## Current Checkout Flow

1. Guest submits `GuestGivingForm`.
2. Client posts to `POST /api/public/contribution-intents`.
3. Route calls `startContributionCheckout`.
4. Payload is validated in `src/lib/validators/contributionIntent.ts`.
5. Organisation and fund are loaded from Supabase.
6. A `contribution_intents` row is inserted with status `draft`.
7. Stripe Checkout session is created using `stripe.checkout.sessions.create`.
   - Checkout Session metadata includes intent/org/fund identifiers.
   - PaymentIntent metadata also includes intent/org/fund identifiers so later PaymentIntent webhooks can update the same contribution intent.
8. Contribution intent is updated with:
   - `status: checkout_created`
   - `stripe_checkout_session_id`
   - `checkout_url`
   - `expires_at`
9. API returns `checkoutUrl`.
10. Browser redirects to Stripe Checkout.

Key files:

- `src/components/giving/GuestGivingForm.tsx`
- `src/app/api/public/contribution-intents/route.ts`
- `src/lib/services/public/startContributionCheckout.ts`
- `src/lib/db/mutations/createContributionIntent.ts`
- `src/lib/stripe/server.ts`

Before validation, the route checks `src/lib/rateLimit/checkoutRateLimit.ts`:
a per-IP ceiling (30 / 10 min, generous enough for many concurrent
in-person QR givers on one shared network) and a tighter per-IP+email
ceiling (5 / 10 min, aimed at repeated-attempt/card-testing patterns).
Either limit returns HTTP 429 before a Stripe Checkout session is
created. Backed by the `checkout_rate_limit_events` table (service-role
only).

## Current Webhook Flow

1. Stripe sends event to `POST /api/webhooks/stripe`.
2. Webhook route verifies signature using Stripe webhook secret.
3. Processing is delegated through payment webhook service modules.
4. Webhook events are stored in `webhook_events`.
5. Payment completion updates contribution/payment records.
6. Supported non-completion events update contribution intent status where metadata is available:
   - `checkout.session.expired` -> `expired`
   - `checkout.session.async_payment_failed` -> `failed`
   - `payment_intent.payment_failed` -> `failed`
   - `payment_intent.canceled` -> `cancelled`
7. Refund/dispute events are matched by `stripe_payment_intent_id` on the `payments` row (not by Checkout metadata) and update both `payments.status` and `contribution_intents.status` together:
   - `charge.refunded` (full refund only; `charge.refunded === true`) -> `refunded`. A partial refund is intentionally left as `succeeded` since the schema has no partial-refund amount field.
   - `charge.dispute.created` -> `disputed`.
   - `charge.dispute.closed` -> `succeeded` if `dispute.status === "won"`, otherwise `refunded`.

Key files:

- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/payments/stripe/webhooks.ts`
- `src/lib/services/processStripeWebhook.ts`

## Payment Data Model

- Before checkout completion: `contribution_intents`.
- After Stripe event processing: `payments` plus updated contribution intent status.

## Current Limitations

Implemented:

- One-time Stripe Checkout payments.
- GBP-only guard in public checkout service.
- Stripe metadata includes intent/org/fund identifiers.
- Stripe webhook processing updates succeeded, expired, failed, cancelled, refunded, and disputed contribution intent states for supported events.
- Full-refund and dispute (created/closed) webhook handling, matched via `stripe_payment_intent_id`.

- The PaymentIntent's `receipt_email` is set to the giver's email, so Stripe sends its own automatic receipt email after a successful payment (no app-side email provider needed).
- `payments.stripe_charge_id` is populated from the PaymentIntent's `latest_charge` on `checkout.session.completed`, so a payment row can be matched to a Stripe payout via balance transactions.

Not implemented yet:

- Stripe subscriptions/recurring donations.
- A downloadable receipt PDF or an in-app "resend receipt" action (Stripe's automatic email covers the common case; the app itself does not generate or store a receipt document).
- Partial refund amounts (a partial refund does not change status; only a full refund does).
- Payout reconciliation beyond dashboard placeholder/status display.

## Environment Variables

Required server variables are validated in `src/lib/env/server.ts`.

Current payment-related names:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Do not commit real secrets.
