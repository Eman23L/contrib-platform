# Next Build Priorities

This file lists suggested next work. Items here are planned/not implemented unless explicitly marked current.

## High Priority

1. Configure custom SMTP in Supabase for reliable supporter magic-link sign-in.
   - Current: app handles rate-limit errors more clearly.
   - Planned: production email provider and tested magic-link delivery.

2. Implement real receipt generation.
   - Current: payments and contribution history exist.
   - Planned: downloadable receipt PDFs and email receipt action.

3. Replace placeholder recurring gift UI with real product decisions.
   - Current: one-time Stripe Checkout only.
   - Planned: decide whether recurring gifts use Stripe subscriptions and implement end-to-end flow.

4. Complete supporter dashboard actions.
   - Current: profile/receipt/recurring/support sections render.
   - Planned: functional edit profile, receipt actions, and support/contact flows.

## Admin Priorities

1. Build CRUD for funds.
   - Current: funds exist in database and are displayed/selectable.
   - Planned: admin create/edit/archive/reorder funds.

2. Build campaign management.
   - Current: campaigns table exists and admin campaign section is placeholder-level.
   - Planned: campaign create/edit/archive and contribution attribution.

3. Build team management.
   - Current: memberships determine access, but team UI is placeholder-level.
   - Planned: invite/remove/change roles.

4. Improve reports.
   - Current: dashboard summaries and contribution table exist.
   - Planned: date ranges, exports, charts, and reconciliation reports.

## Technical Priorities

1. Add focused tests for auth flow, payment flow, and dashboard data mappers.
2. Review and document RLS assumptions for each service query.
3. Remove or complete legacy routes `/me`, `/me/giving`, and `/admin/donations`.
4. Add user-facing empty states for all placeholder sections.
5. Audit all buttons/links for dead actions.

## Recently Completed Functional Fixes

- Current: guest checkout requires email before creating a contribution intent.
- Current: admin password sign-in preserves safe internal `/admin` paths.
- Current: admin-password failure clears admin cookies without clearing supporter cookies.
- Current: normal supporter sign-in avoids the service-role admin user scan unless the requested destination is an admin path.
- Current: admin dashboard raised/fund amount totals use succeeded gifts only.
- Current: Stripe webhook processing tracks supported expired, failed, and cancelled checkout/payment events.

## Deferred by Product Decision

- Planned: mobile navigation improvements for hidden sidebar sections.
- Planned: placeholder/coming-soon treatment for non-functional UI actions.
- Planned: Supabase custom SMTP setup outside app code.
