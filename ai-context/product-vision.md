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
- Stripe Checkout session creation.
- Stripe webhook processing.
- Supporter account dashboard.
- Admin dashboard shell and contribution records page.
- Supabase-backed organisations, memberships, funds, campaigns, contribution intents, payments, webhooks, and audit log tables.

Not implemented yet:

- Real recurring gift management.
- Receipt PDF generation/download/email.
- Full supporter profile editing.
- Admin CRUD for campaigns, funds, team members, or settings.
- Search behavior in dashboard search boxes.
- Multi-organisation switching UI beyond links/query parameters.
- Production-ready custom SMTP setup in code; this is configured outside the app in Supabase.

