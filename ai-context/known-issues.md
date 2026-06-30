# Known Issues and Limitations

## Current Known Issues

- Supabase built-in email sender can hit strict magic-link rate limits. Custom SMTP should be configured in Supabase for real usage.
- Receipt download and email buttons exist in the supporter dashboard UI but do not generate or send real receipts yet.
- Recurring gift UI is a placeholder; Stripe subscriptions are not implemented.
- Admin sections for campaigns, team, reports, settings, supporters, and funds are mostly dashboard summaries/placeholders, not full CRUD workflows.
- Search boxes in admin/supporter/guest dashboard shells are visual only.
- `/admin/donations` is a placeholder page.
- `/me` and `/me/giving` routes still exist as legacy/static routes.
- Supporter profile editing is not implemented.
- Payout status in admin dashboard is derived/displayed at a high level, not a full Stripe payout reconciliation workflow.
- Custom SMTP is not represented as code; it must be configured in Supabase.
- Mobile navigation for dashboard sidebars is still deferred; desktop sidebar behavior is current.
- Guest checkout now requires email to satisfy contribution intent constraints and support giving history.

## Recent Worktree Note

Before creating this documentation, the working tree already had uncommitted app-code changes in:

- `src/app/account/page.tsx`
- `src/app/admin/page.tsx`

Future sessions should check `git status` before editing and must not accidentally stage unrelated app-code changes when committing docs or scoped work.

## Risk Areas

- Auth separation between supporter and admin sessions.
- Stripe webhook idempotency and payment status updates.
- RLS policies in `supabase/migrations/009_rls.sql`.
- Guest checkout email validation must keep satisfying `contribution_intents_guest_or_user_chk`.
- Email-based supporter history depends on consistent lower-cased `guest_email`.
