# Next Build Priorities

This file lists suggested next work. Items here are planned/not implemented unless explicitly marked current.

## Deep Research Priority Frame

`deep-research-feature-map.md` is the roadmap source of truth. It positions GetFlow as a multi-organisation, Stripe-native giving platform with light donor CRM capabilities.

The four non-negotiable product capabilities are:

1. Reliable payments core: webhook-driven status handling, idempotency, recoverability, refunds/failures, recurring lifecycle, and payout reconciliation.
2. Real supporter model: history, profiles, receipts/statements, recurring gifts, preferences, and safe matching of guest/account gifts.
3. Flexible organisation settings: editable organisation identity, public copy, support contact, branding, currency, timezone, visibility, and payment configuration state.
4. Reporting and reconciliation: paid-vs-pending/failure separation, exports, fund/campaign/supporter reporting, statements, and bank payout traceability.

## Must-Have Before Demo

1. Extend organisation settings beyond the safe MVP.
   - Current: owners/admins can edit display name, legal name, slug, timezone, public heading/copy, giving page heading/copy, thank-you copy, support email, giving action wording, and logo URL.
   - Current: public organisation, guest giving, and success pages use saved wording where available.
   - Planned: brand colour rendering, editable currency only after multi-currency checkout support, fund/campaign visibility controls, audit logging, and payment setup health checks.

2. Strengthen money-flow visibility.
   - Current: one-time Stripe Checkout, status webhooks, and paid-only admin totals exist.
   - Planned: internal payment detail/status view, webhook delivery visibility, clearer failed/cancelled/expired reporting, and first payout/reconciliation model.

3. Complete supporter profile basics.
   - Current: supporters are grouped from contribution records by email/name where available.
   - Planned: supporter detail page with giving history, first/last gift, average gift, receipt references, recurring state when implemented, and safe organisation scoping.

4. Improve public and guest organisation experience.
   - Current: public org and guest giving pages use organisation slug/name and active funds.
   - Planned: editable public page copy, visible funds/campaigns, support/contact details, legal/charity details where applicable, and stronger post-payment account claim path.

5. Make reports exportable.
   - Current: reports show paid totals, pending/not-completed counts, status/fund breakdowns, recent contributions, and an admin-only contribution CSV export.
   - Planned: filtered exports, supporter/fund/campaign exports, receipt status export when available, saved views, and payout/deposit detail.

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

1. Add settings audit and publication controls.
   - Current: safe Settings write workflow exists for owner/admin identity and public wording fields.
   - Planned: audit log entries, public fund/campaign visibility controls, brand colour usage, and payment setup status checks.

2. Build admin write workflows on top of the read-only MVP sections.
   - Current: Supporters, Giving, Funds, Campaigns, Reports, Team, and Settings show section-specific data from current tables.
   - Planned: add safe write workflows only after schema, RLS, and product decisions are clear.

3. Build CRUD for funds.
   - Current: funds exist in database, are displayed/selectable, and have admin read-only performance summaries.
   - Planned: admin create/edit/archive/reorder funds.

4. Build campaign management.
   - Current: campaigns table exists and admin campaign section shows campaign summaries or fund-based fundraising areas.
   - Planned: campaign create/edit/archive, goal, story, visibility, linked funds, public page, progress, share link, and contribution attribution.

5. Build team management.
   - Current: memberships determine access and the team section lists visible membership role/status records.
   - Planned: invite/remove/change roles, invite status, last active where available, and audit trail.

6. Improve reports.
   - Current: reports show paid totals, pending/not-completed counts, fund/status breakdowns, and recent contributions.
   - Current: contribution CSV export is available from Reports.
   - Planned: date ranges, filtered exports, charts, receipt/statement reports, recurring reports, and payout reconciliation reports.

## Technical Priorities

1. Add focused tests for auth flow, payment flow, and dashboard data mappers.
2. Review and document RLS assumptions for each service query.
3. Monitor legacy redirect routes `/me`, `/me/giving`, and `/admin/donations`; remove only if no production links depend on them.
4. Add focused empty states and detail pages where current read-only MVPs stop at summaries.
5. Audit all buttons/links for dead actions.
6. Add architecture notes for receipt records, recurring plans, payout reconciliation, Gift Aid declarations, and supporter identity before implementing those schemas.

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
- Planned: Gift Aid/tax workflows, receipt wording semantics, and retention/communication-preference policy need product/compliance decisions before pilot.
