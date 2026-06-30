# Next Build Priorities

This file lists suggested next work. Items here are planned/not implemented unless explicitly marked current.

## High Priority

1. Configure custom SMTP in Supabase for reliable supporter magic-link sign-in.
   - Current: app handles rate-limit errors more clearly.
   - Planned: production email provider and tested magic-link delivery.

2. Implement real receipt generation.
   - Current: payments and contribution history exist.
   - Planned: downloadable receipt PDFs and email receipt action.

3. Decide and build recurring gifts.
   - Current: one-time Stripe Checkout only.
   - Current: visible supporter recurring navigation/actions are hidden; the direct recurring URL shows no recurring records instead of presenting one-time gifts as recurring gifts.
   - Planned: decide whether recurring gifts use Stripe subscriptions and implement end-to-end flow.

4. Complete supporter dashboard actions.
   - Current: profile is read-only, receipts link to success pages, recurring shows no connected recurring records, support uses generic organisation support copy.
   - Planned: functional profile editing, receipt PDF/email actions, recurring management, and configurable support/contact flows.

## Admin Priorities

1. Build admin write workflows on top of the read-only MVP sections.
   - Current: Supporters, Giving, Funds, Campaigns, Reports, Team, and Settings show section-specific data from current tables.
   - Planned: add safe write workflows only after schema, RLS, and product decisions are clear.

2. Build CRUD for funds.
   - Current: funds exist in database, are displayed/selectable, and have admin read-only performance summaries.
   - Planned: admin create/edit/archive/reorder funds.

3. Build campaign management.
   - Current: campaigns table exists and admin campaign section shows campaign summaries or fund-based fundraising areas.
   - Planned: campaign create/edit/archive and contribution attribution.

4. Build team management.
   - Current: memberships determine access and the team section lists visible membership role/status records.
   - Planned: invite/remove/change roles.

5. Improve reports.
   - Current: reports show paid totals, pending/not-completed counts, fund/status breakdowns, and recent contributions.
   - Planned: date ranges, exports, charts, and reconciliation reports.

## Technical Priorities

1. Add focused tests for auth flow, payment flow, and dashboard data mappers.
2. Review and document RLS assumptions for each service query.
3. Monitor legacy redirect routes `/me`, `/me/giving`, and `/admin/donations`; remove only if no production links depend on them.
4. Add focused empty states and detail pages where current read-only MVPs stop at summaries.
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
- Planned: deeper button/action audit as new workflows are added.
- Planned: Supabase custom SMTP setup outside app code.
