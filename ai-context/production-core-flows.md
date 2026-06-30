# Production Core Flows

Use this file to audit GetFlow before making production-facing changes.

## Admin Password Access

- `/admin` and `/admin/contributions` must require an admin session.
- Admin access is based on active `organisation_memberships` with `owner`, `admin`, or `finance` roles.
- Supporter magic-link sessions must not authorize admin pages.
- Admin redirects must preserve safe internal `/admin` destinations.

## Supporter Magic-Link Access

- Normal supporters use email magic links.
- Admin-capable emails should be detected and sent through password sign-in.
- Supporter session cookies are separate from admin cookies.
- Giving history is loaded by authenticated user ID and matching email.

## Guest Giving

- Public giving pages load by organisation slug.
- Guest checkout requires a valid email.
- Contribution intents must satisfy the database rule that either `user_id` or `guest_email` is present.
- Checkout must create a Stripe Checkout Session and redirect only after validation succeeds.

## Stripe Checkout And Webhooks

- Checkout completion should mark the contribution intent and payment succeeded.
- Expired, failed, and cancelled events should update contribution status where supported.
- Webhook idempotency must be preserved.
- Stripe metadata must keep enough identifiers to update the correct contribution intent.

## Admin Data

- Admin totals must be scoped to the selected organisation.
- Raised/paid totals should count succeeded gifts only.
- Pending/incomplete gifts should be shown separately where relevant.
- Supporter lists should group by supporter/email where possible.

## Supporter Account

- The account page must only show the signed-in supporter their own linked contribution history.
- Receipt links may point to existing success pages, but PDF/email receipt actions must not be shown until implemented.
- Recurring-gift UI must not imply active subscriptions until Stripe subscriptions exist.

## Multi-Community Support

- Public, admin, and account flows should prefer organisation data from routes or records.
- Avoid new Grace Community-only assumptions except seed/demo fallback behavior.
- Organisation scoping must be explicit in admin queries.
