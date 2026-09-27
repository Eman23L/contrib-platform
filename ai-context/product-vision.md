# Product Vision

## Current Product

GetFlow is a giving platform for community organisations, currently shaped around church giving.

The app supports:

- Public organisation giving pages.
- Guest contributions through Stripe Checkout.
- Optional receipt/account linkage through guest email.
- Supporter account pages showing giving history linked by authenticated user ID and email.
- Admin dashboards for organisations with giving summaries, contribution records, fund breakdowns, and status summaries.

The current seed/example organisation is Grace Community Church.

## Product Goal

GetFlow should make giving simple for supporters and operationally clear for organisation admins:

- Supporters should be able to give quickly without creating an account first.
- Supporters should later be able to sign in by email and see past gifts linked to that email.
- Admins should be able to monitor giving, funds, supporters, payout state, and payment status from a dashboard.
- Stripe should remain the payment processor and source of payment completion events.

## Current Scope

Implemented:

- Guest giving form with fund selection, amount selection, optional first name, last name, and email.
- Stripe Checkout session creation, one-time and monthly recurring (sign-in required for recurring).
- Stripe webhook processing, including refunds, disputes, and recurring lifecycle events.
- Stripe automatic receipt emails; `payments.stripe_charge_id` capture for payout reconciliation.
- Admin payout reconciliation against the platform's single shared Stripe account.
- Supporter account dashboard, including recurring gift management/cancellation.
- Admin dashboard shell and contribution records page.
- Supabase-backed organisations, memberships, funds, campaigns, contribution intents, payments, recurring plans, webhooks, and audit log tables.

Not implemented yet:

- Recurring intervals other than monthly, and guest (no-account) recurring gifts.
- A downloadable receipt PDF or an in-app "resend receipt" action.
- Full supporter profile editing.
- Admin CRUD for campaigns, funds, team members, or settings.
- Search behavior in dashboard search boxes.
- Multi-organisation switching UI beyond links/query parameters.
- Per-organisation payouts (Stripe Connect) — there is one shared Stripe account for the whole platform today, by explicit decision, until a second real organisation is onboarded.
- Production-ready custom SMTP setup in code; this is configured outside the app in Supabase.

