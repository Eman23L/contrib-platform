# Database Map

Database is Supabase Postgres. Migrations live in `supabase/migrations`.

## Core Tables

### `organisations`

Defined in `002_orgs.sql`.

Stores organisation identity:

- `id`
- `name`
- `slug`
- `legal_name`
- `country_code`
- `currency_code`
- `timezone`
- `settings`
- `is_active`

Used by public org lookup, admin dashboard scoping, and payment records.

### `organisation_memberships`

Defined in `003_memberships.sql`.

Links Supabase Auth users to organisations:

- `organisation_id`
- `user_id`
- `role`
- `is_active`

Admin access currently accepts active roles: `owner`, `admin`, `finance`.

### `funds`

Defined in `004_funds.sql`.

Funds are donation destinations within an organisation:

- `organisation_id`
- `name`
- `slug`
- `description`
- `is_default`
- `is_active`
- `display_order`

Public giving only lists active funds.

### `campaigns`

Defined in `005_campaigns.sql`.

Campaign table exists and contribution intents can reference campaigns, but campaign management UI is not implemented yet.

### `contribution_intents`

Defined in `006_intents.sql`.

Pre-payment donation records:

- `organisation_id`
- `fund_id`
- `campaign_id`
- `user_id`
- `amount_minor`
- `currency_code`
- `status`
- `payment_provider`
- `guest_email`
- `donor_name`
- `donor_note`
- `is_anonymous`
- `source`
- `stripe_checkout_session_id`
- `checkout_url`
- `expires_at`
- `paid_at`
- `metadata`

Important constraint:

- `user_id is not null or guest_email is not null`

Current guest checkout requires `guest_email` and can store `donor_name`.

### `payments`

Defined in `007_payments.sql`.

Post-payment records created/updated from Stripe webhook processing:

- `organisation_id`
- `contribution_intent_id`
- `status`
- `amount_minor`
- `currency_code`
- Stripe checkout/payment/charge IDs
- `paid_at`
- `metadata`

One payment per contribution intent.

### `webhook_events`

Defined in `008_webhooks.sql`.

Stores Stripe webhook event receipt and processing state.

### `audit_log`

Defined in `008_webhooks.sql`.

Audit table exists, but broad audit logging is not fully built out in app workflows.

## RLS

RLS policies are in `009_rls.sql`. Future Codex sessions should inspect this file before changing query behavior.

## Query/Service Modules

- Public organisation: `src/lib/services/public/getPublicOrganisation.ts`
- Public funds: `src/lib/services/public/listPublicFunds.ts`
- Contribution intent mutation: `src/lib/db/mutations/createContributionIntent.ts`
- Admin dashboard queries: `src/lib/db/queries/admin.ts`
- Admin contribution list queries: `src/lib/db/queries/adminContributions.ts`
- Membership queries: `src/lib/db/queries/memberships.ts`
- Supporter history: `src/lib/services/account/getSupporterGivingHistory.ts`
