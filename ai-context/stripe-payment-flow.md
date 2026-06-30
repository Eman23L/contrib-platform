# Stripe and Payment Flow

## Current Checkout Flow

1. Guest submits `GuestGivingForm`.
2. Client posts to `POST /api/public/contribution-intents`.
3. Route calls `startContributionCheckout`.
4. Payload is validated in `src/lib/validators/contributionIntent.ts`.
5. Organisation and fund are loaded from Supabase.
6. A `contribution_intents` row is inserted with status `draft`.
7. Stripe Checkout session is created using `stripe.checkout.sessions.create`.
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

## Current Webhook Flow

1. Stripe sends event to `POST /api/webhooks/stripe`.
2. Webhook route verifies signature using Stripe webhook secret.
3. Processing is delegated through payment webhook service modules.
4. Webhook events are stored in `webhook_events`.
5. Payment completion updates contribution/payment records.

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

Not implemented yet:

- Stripe subscriptions/recurring donations.
- Receipt PDF generation.
- Email receipt sending from app code.
- Refund management.
- Payout reconciliation beyond dashboard placeholder/status display.

## Environment Variables

Required server variables are validated in `src/lib/env/server.ts`.

Current payment-related names:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Do not commit real secrets.

