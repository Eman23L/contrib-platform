# Feature Contracts

Every visible feature, page, navigation item, button, and section must either do what it appears to do, be clearly marked as not implemented/coming soon, or be hidden until ready.

Status labels:

- Working: the visible feature performs its core expected job.
- Partial: the feature has real data or navigation but is incomplete.
- Placeholder: the feature mostly reuses generic content, static estimates, or non-functional actions.
- Missing: the expected feature is not implemented.

## Product Specification Source

`deep-research-feature-map.md` is now the product specification for intended feature depth, naming, acceptance criteria, and build order. Before changing any visible section, compare the current implementation against both that file and this contract. If the two disagree, prefer the Deep Research feature map and update this file in the same task.

Deep Research defines four non-negotiable product capabilities for GetFlow:

- A reliable Stripe-native payments core with webhook-driven status, recoverability, and reconciliation.
- A real supporter model rather than payment-only history.
- Flexible organisation settings for multi-community identity, wording, branding, and operational defaults.
- Admin reporting that closes the loop from donation intent to bank payout.

## Admin Overview

User expectation:

- See high-level organisation giving performance, recent activity, fund breakdown, payout/payment status, and shortcuts to real admin tasks.

Current behavior:

- Shows organisation name, summary cards, trend chart, fund breakdown, recent giving, recent activity, quick actions, and payout status using dashboard aggregates.
- Total Raised and fund amount totals use succeeded gifts only.
- Quick actions link to real admin sections or the contribution list.
- Some trend percentages and payout presentation are derived/static rather than full workflows.

Status: Partial.

Acceptance criteria:

- Summary metrics are derived from real payments and labelled accurately.
- Paid, pending, failed, cancelled, expired, refunded, and payout/reconciliation states are separated where the data exists.
- Trend chart uses real date-range data.
- Date, organisation, fund, and campaign filters update dashboard widgets consistently when those filters are added.
- Quick actions link to real section-specific workflows or are marked coming soon/hidden.
- Payout status is reconciled against Stripe payout/payment data or clearly labelled as an estimate.

## Admin Contributions

User expectation:

- View contribution records, filter by status/date/fund, inspect payment state, and reconcile against Stripe.

Current behavior:

- `/admin/contributions?org=[slug]` exists inside admin chrome.
- Shows contribution records and summary cards from contribution intent data.
- Supports admin route protection and preserves deeper admin redirect paths.

Status: Partial.

Acceptance criteria:

- Filters work reliably for org, status, fund, and date.
- Payment status matches Stripe webhook/payment data.
- One Stripe payment maps to one canonical contribution/donation record.
- Rows expose relevant Stripe references, receipt state, refund state, and source/method details where the current schema supports them.
- Rows expose enough detail for support/reconciliation without leaking sensitive data.
- Export/reporting actions are either implemented or not visible.

## Admin Giving

User expectation:

- See recent giving activity, supporter count, paid totals, pending gifts, and payment status for the selected organisation.

Current behavior:

- `/admin?org=[slug]&section=giving` is parsed as a real section.
- Shows paid total, total contribution records, unique supporter emails, pending count, recent giving, and payment status breakdown from contribution intent data.
- The deeper `/admin/contributions?org=[slug]` page remains the detailed contribution list.

Status: Partial.

Acceptance criteria:

- Giving metrics remain organisation-scoped and do not include other communities.
- Recent gifts and payment statuses match contribution intent/payment state.
- The section links naturally to detailed contribution records and filters.

## Supporters

User expectation:

- See unique supporters, names/emails, total given, last gift, recurring status, communication/receipt status, and supporter detail history.

Current behavior:

- Visible admin nav section exists at `/admin?org=[slug]&section=supporters`.
- Shows unique supporter emails from contribution records, supporter display names where captured, paid total, gift count, last gift date, and latest contribution status.
- Active supporter count is based on unique `guest_email`, not a full supporter profile model.
- No supporter detail page or communication/receipt status workflow is implemented.

Status: Partial.

Acceptance criteria:

- Lists unique supporter records by verified user/email.
- Shows supporter name, email, gift count, total paid amount, last gift date, and status.
- Has supporter detail view with giving history and receipt references.
- Long-term supporter profiles include first gift, average gift, active recurring state, preferences, declarations, admin notes, and safe segmentation.
- Distinguishes supporter records from individual contribution rows.

## Funds

User expectation:

- View, create, edit, archive, reorder, and choose default funds for an organisation.

Current behavior:

- Public giving lists active funds from database.
- Admin funds section shows fund breakdown totals, paid totals, gift counts, and latest activity from contribution records.
- No admin CRUD for funds is implemented.

Status: Partial.

Acceptance criteria:

- Admin can create/edit/archive/reorder funds.
- Admin can set default fund.
- Admin can control public visibility and default ask amounts once settings schema supports it.
- Public giving immediately reflects active fund configuration.
- Archived funds remain valid for historical contribution records.
- Fund totals reconcile with contribution allocations and paid payment status.

## Campaigns

User expectation:

- Create and manage campaigns with names, descriptions, dates, target amounts, public visibility, and attribution for gifts.

Current behavior:

- Campaign table exists and contribution intents can reference campaigns.
- Admin campaign section shows campaign summaries where campaign records exist.
- When no campaign records exist, it shows fund-based fundraising areas from contribution data rather than fake campaigns.
- No campaign CRUD or public campaign giving flow is implemented.

Status: Partial.

Acceptance criteria:

- Admin can create/edit/archive campaigns.
- Campaigns can be linked to funds and contribution intents.
- Campaigns have goal amount, public story/description, status, start/end dates, visibility, progress, and share URL when campaign schema supports them.
- Public campaign pages or campaign-selectable giving are supported.
- Campaign metrics are specific to campaign gifts.
- Campaign progress reflects paid gifts by default.

## Reports

User expectation:

- View giving reports by date range, fund, campaign, payment status, and export data for finance/reconciliation.

Current behavior:

- Reports section shows paid total, all gift records, pending count, failed/cancelled/expired count, breakdown by fund, breakdown by status, and recent contributions.
- No true report builder, date range controls, export, or Stripe payout reconciliation report exists.

Status: Partial.

Acceptance criteria:

- Reports have date-range filters and breakdowns by fund/campaign/status.
- Export produces useful CSV or similar files for donations, supporters, funds, campaigns, receipts/statements, and payout/deposit detail as each data model becomes available.
- Reports clearly separate paid, pending, failed, cancelled, and expired amounts.
- Data can be reconciled against Stripe payments/payouts.
- Saved views, scheduled reports, statements, and Gift Aid/tax reporting are V1 targets, not current behavior.

## Team

User expectation:

- Manage organisation admins/finance users, invite team members, remove users, and change roles.

Current behavior:

- Access control uses `organisation_memberships`.
- Team section lists visible organisation membership records with user ID, role, active status, and joined date.
- Member email addresses are not available from the current app-owned membership schema.
- No invite/remove/change role UI is implemented.

Status: Partial.

Acceptance criteria:

- Owner/admin can invite members.
- Roles are visible and editable according to permissions.
- Team rows eventually show user, role, organisation/site access, invite status, last active, and security status where available.
- Removing/deactivating team members updates access safely.
- Invite flow is auditable and does not expose service-role capabilities client-side.

## Settings

User expectation:

- Configure organisation identity, public copy, support contact, Stripe/payment settings display, giving page wording, branding/custom wording, and defaults.

Current behavior:

- Settings section shows organisation display name, public slug, legal name, currency, timezone, and stored settings JSON where present.
- Public wording and branding settings are not editable through UI.

Status: Partial.

Acceptance criteria:

- Admin can edit supported organisation settings.
- Settings ownership/permissions are clear.
- Public pages use configured copy and support contact details.
- Sensitive payment/environment settings are displayed safely or managed externally.
- MVP settings include organisation display name, legal name, slug, public copy, thank-you copy, support email, currency, timezone, logo/brand colour, fund/campaign visibility, and payment configuration status where schema supports them.

## Supporter Account

User expectation:

- Sign in, view contribution history, see receipts, manage recurring gifts, update profile/preferences, and get support.

Current behavior:

- `/account` loads giving history by authenticated user ID and email.
- Home and My Giving show real contribution history.
- Receipts section links to existing success pages for paid gifts, but real receipt PDFs/email receipts are not implemented.
- Recurring gift navigation/actions are hidden because subscriptions are not implemented; the direct recurring URL shows a factual no-records state.
- Profile is read-only and side actions link to real account sections or giving pages.

Status: Partial.

Acceptance criteria:

- Giving history is accurate across user ID and email-linked gifts.
- Receipts can be downloaded/emailed as real receipt artifacts.
- Recurring gift management is either real or hidden/marked not implemented.
- Profile/preferences can be updated or are clearly read-only.
- Support contact points to configured organisation support details.
- Long-term account self-service delegates sensitive payment method and subscription management to Stripe Customer Portal or an equivalent secure Stripe-backed flow.

## Guest Giving Page

User expectation:

- Choose an organisation fund, enter amount and email/name, and proceed to secure Stripe Checkout.

Current behavior:

- `/o/[orgSlug]/give` loads organisation by slug and active funds.
- Email is required before checkout.
- Creates contribution intent and Stripe Checkout session.
- Shows static helper/assurance content.
- Public copy is not yet editable per organisation beyond organisation name and active funds.

Status: Working for one-time giving; partial for configurable public experience.

Acceptance criteria:

- Active funds are shown accurately per organisation.
- Email validation prevents invalid records.
- Checkout succeeds and webhook updates payment state.
- Public wording/support copy can be configured per organisation or is intentionally standard.
- Guest giving remains friction-light and does not require account creation before first gift.
- Post-payment supporter account claiming/history matching remains email-based until a fuller supporter identity model exists.

## Auth/Sign-In

User expectation:

- Admin users get password sign-in; supporter users get magic-link sign-in; redirects are safe and preserve intended internal destinations.

Current behavior:

- Generic `/sign-in` checks whether email belongs to active admin/owner/finance user and shows password field.
- Supporters use magic-link flow.
- Admin sessions and supporter sessions use separate cookies.
- External redirects are blocked by safe internal path handling.
- Admin detection by email still depends on Supabase Auth admin lookup because member emails are not stored in app tables.

Status: Working with known performance/schema caveat.

Acceptance criteria:

- Admin emails always show password flow.
- Non-admin emails use supporter magic-link flow.
- Admin pages never accept supporter sessions.
- Redirects preserve safe `/admin` paths and block external redirects.
- Long-term: admin email detection uses direct app-owned profile/member email data.

## Stripe Checkout

User expectation:

- Payments are secure, contribution status updates after success/failure/cancel/expiry, and admin/supporter views reflect payment state.

Current behavior:

- One-time Stripe Checkout is implemented for GBP organisations.
- Checkout Session and PaymentIntent metadata include intent/org/fund identifiers.
- Webhook handles completed, expired, async failed, payment failed, and payment canceled events where metadata is available.
- Subscriptions/recurring gifts are not implemented.

Status: Working for one-time payments; partial for broader payment product.

Acceptance criteria:

- Completed checkout creates/upserts payment and marks contribution succeeded.
- Expired/failed/canceled events update contribution status safely.
- Webhook delivery is monitored and retry-safe.
- Recurring/subscription behavior is either implemented or removed/marked not implemented.
- Stripe remains the financial source of truth; webhook processing must be idempotent and resilient to retries or out-of-order events.
- Payout, refund, dispute, subscription, and customer portal workflows are planned before pilot/V1 and must not be faked in UI.

## Public Organisation Page

User expectation:

- See organisation-specific entry point, sign in, and continue to giving for the selected community.

Current behavior:

- `/o/[orgSlug]` loads organisation by slug and renders sign-in card.
- Continue as guest points to that organisation's giving page.
- Public landing copy is generic and not configurable.

Status: Partial.

Acceptance criteria:

- Organisation name, slug, and giving link are correct.
- Public copy and support contact can be configured per organisation.
- Sign-in flow respects organisation context for admin destination and guest giving.
- Public page eventually supports visible funds, campaigns, trust/support information, legal/charity details where relevant, and mobile-first giving CTAs.

## Receipts / Statements / Gift Aid

User expectation:

- Receive prompt receipts for successful gifts, access annual or date-bounded statements, and support UK Gift Aid/tax evidence where relevant.

Current behavior:

- Stripe Checkout and success pages exist for one-time gifts.
- The app does not yet generate first-class receipt records, downloadable receipt PDFs, annual statements, Gift Aid declarations, or Gift Aid claim/export workflows.

Status: Missing for GetFlow-owned receipt/tax artifacts; partial for Stripe-hosted payment acknowledgement.

Acceptance criteria:

- Every successful donation creates or links to a receipt record.
- Admins can view receipt status and resend receipts when delivery exists.
- Supporters can download or view prior receipts/statements.
- Gift Aid/tax declaration data is structured, auditable, and organisation-scoped before UK charity pilot use.

## Multi-Community Platform

User expectation:

- Each church, charity, or community has isolated organisation data, public identity, settings, funds, campaigns, roles, reports, receipts, and payment configuration.

Current behavior:

- Organisation slugs and organisation-scoped contribution/admin queries exist.
- Some public/supporter/admin copy still relies on generic defaults or Grace Community seed data where editable settings are not implemented.
- Full per-organisation branding, settings, payment account health, receipt wording, and content controls are planned.

Status: Partial.

Acceptance criteria:

- No cross-organisation data leakage in admin, supporter, public, or reporting views.
- Organisation slug, display name, public copy, support contact, currency, timezone, funds, campaigns, team roles, reports, receipts, and payment configuration are scoped per organisation.
- One auth user can safely belong to multiple organisations without leaking supporter or admin data between them.
