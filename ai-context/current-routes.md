# Current Routes

Routes are Next.js App Router routes under `src/app`.

## Public Routes

- `/` - root page.
- `/sign-in` - unified sign-in UI.
- `/o/[orgSlug]` - public organisation landing/sign-in card for an organisation.
- `/o/[orgSlug]/give` - guest giving page.
- `/o/[orgSlug]/success` - post-checkout success page.
- `/o/[orgSlug]/failed` - failed/cancelled checkout page.

## Supporter Routes

- `/account` - authenticated supporter dashboard.
- `/account?section=giving` - supporter giving history section.
- `/account?section=receipts` - supporter receipts section.
- `/account?section=recurring` - direct no-recurring-records view; recurring navigation/actions are hidden until subscriptions exist.
- `/account?section=profile` - supporter profile section.
- `/account?section=support` - support section.
- `/me` - legacy route that redirects to `/account`.
- `/me/giving` - legacy route that redirects to `/account?section=giving`.

## Admin Routes

- `/admin` - admin dashboard. If no org is provided and there is one membership, redirects to that organisation.
- `/admin?org=[slug]` - admin overview dashboard for the organisation.
- `/admin?org=[slug]&section=giving|supporters|funds|campaigns|reports|team|settings` - section-specific admin dashboard content.
- `/admin/contributions?org=[slug]` - contribution records page inside admin dashboard chrome.
- `/admin/donations` - legacy route that redirects to `/admin/contributions`.
- `/admin/reports/contributions?org=[slug]` - admin-only CSV export of scoped contribution records.

## Auth Routes

- `POST /auth/start` - starts sign-in. Detects admin-capable email, otherwise prompts/sends supporter magic link.
- `POST /auth/sign-in` - admin password sign-in.
- `GET /auth/callback` - Supabase magic-link callback.
- `POST /auth/sign-out` - clears session cookies and redirects to `/sign-in`.
- `POST /auth/magic-link` - older/direct magic-link endpoint, still present.

## API Routes

- `POST /api/public/contribution-intents` - validates guest giving payload, creates contribution intent, creates Stripe Checkout session.
- `POST /api/webhooks/stripe` - receives Stripe webhook events and processes payment state.

## Error Routes

- `src/app/error.tsx` - app error boundary.
- `src/app/not-found.tsx` - not found page.
