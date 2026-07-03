# Known Issues and Limitations

## Current Known Issues

- Supabase built-in email sender can hit strict magic-link rate limits. Custom SMTP should be configured in Supabase for real usage.
- Supporter receipts link to existing success pages, but downloadable receipt PDFs and email receipt sending are not implemented.
- Recurring gifts are not implemented; visible supporter recurring navigation/actions are hidden, and the direct recurring URL shows an honest no-recurring-records state.
- Admin sections for supporters, funds, campaigns, reports, and team are now section-specific read-only MVPs, not full CRUD workflows.
- Admin Settings has a safe editable MVP for owner/admin organisation identity and public wording, but it does not yet cover brand colour rendering, editable currency, fund/campaign visibility controls, audit logs, or payment setup health checks.
- Search boxes in admin/supporter/guest dashboard shells are visual only.
- `/admin/donations`, `/me`, and `/me/giving` still exist as legacy redirect routes for compatibility.
- Supporter profile editing is not implemented.
- Payout status in admin dashboard is derived/displayed at a high level, not a full Stripe payout reconciliation workflow.
- Custom SMTP is not represented as code; it must be configured in Supabase.
- Admin, supporter, and guest giving dashboards have compact mobile navigation.
- Guest checkout now requires email to satisfy contribution intent constraints and support giving history.
- Guest checkout API and UI validation both return receipt/history-focused email errors.
- Admin email detection still depends on Supabase Auth admin user lookup because the current app schema does not store member email addresses in `organisation_memberships` or a profile table.
- Admin Team rows now show the best available Supabase Auth email/name metadata with user ID as fallback, but the app still does not have an app-owned profile/member identity table.
- Admin campaign, fund, team, and report write workflows still need product/security decisions before CRUD/export/invite/edit actions are added.
- Settings writes are implemented for safe text/profile fields only; broader settings such as payment configuration, multi-currency checkout, and publication controls need separate decisions.
- Generic sign-in and supporter account no longer send users to a hard-coded Grace Community giving page when no organisation context exists.
- Supporter account still needs an explicit organisation selector or invite/context route for supporters with no giving history.

## Risk Areas

- Auth separation between supporter and admin sessions.
- Stripe webhook idempotency and payment status updates.
- RLS policies in `supabase/migrations/009_rls.sql`.
- Guest checkout email validation must keep satisfying `contribution_intents_guest_or_user_chk`.
- Email-based supporter history depends on consistent lower-cased `guest_email`.
- Admin detection by email should be revisited if a profile/member email table is added, so generic `/sign-in` can avoid scanning Supabase Auth users.
