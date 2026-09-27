# Auth Flow

## Current Auth Model

The app uses Supabase Auth.

There are two session categories:

- Supporter session: email magic-link login, stored with supporter cookies.
- Admin session: password login for an admin/member account, stored with admin cookies.

This separation is important. Admin pages must not accept a supporter magic-link session.

## Key Files

- `src/components/auth/UnifiedSignInCard.tsx`
- `src/app/sign-in/page.tsx`
- `src/app/auth/start/route.ts`
- `src/app/auth/sign-in/route.ts`
- `src/app/auth/callback/route.ts`
- `src/app/auth/sign-out/route.ts`
- `src/lib/auth/requireAdminRole.ts`
- `src/lib/auth/adminAccess.ts`
- `src/lib/supabase/server.ts`

## Supporter Sign-In

Current flow:

1. User enters email in `UnifiedSignInCard` (name fields are hidden at this point).
2. Client calls `POST /auth/start`.
3. On the first email submission, `/auth/start` checks whether the email belongs to an active admin/member account. If it does, the client shows the password field.
4. If not an admin account, `/auth/start` checks (via `findUserByEmail`) whether the email already has any Supabase Auth account:
   - If yes (returning supporter), the magic link is sent immediately with no name required, and the existing account's stored name is left untouched.
   - If no (brand new supporter), `/auth/start` returns `create_account_prompt`; the client reveals first/last name fields, and the user confirms by pressing the button again, which sends `createAccount: true`.
5. `/auth/start` calls Supabase `signInWithOtp` with `shouldCreateUser: true`.
6. User clicks the email link.
7. `/auth/callback` verifies it via `verifyOtp`/`token_hash` and creates a Supabase session.
8. `setSupporterSessionCookies` stores supporter cookies.
9. User is redirected to `/account`.
10. `/account` loads giving history by authenticated user ID and email.

Known external dependency:

- Supabase built-in email has strict rate limits. If custom SMTP is not configured in Supabase, magic links can fail with `email rate limit exceeded`.

Auth flow type and a known operator setup step:

- Clicking a Supabase magic link does not go straight to this app. It goes to Supabase's own hosted `/auth/v1/verify` endpoint first (using the stock email template's `{{ .ConfirmationURL }}`), which verifies the token server-side and *then* redirects to `emailRedirectTo` (this app's `/auth/callback`). That hosted redirect carries the session back in one of two forms depending on the requesting client's `flowType`:
  - `"pkce"`: a `?code=...` query param — visible to a server-side route, exchangeable via `exchangeCodeForSession`.
  - `"implicit"`: a `#access_token=...` URL **fragment** — browsers never send fragments to a server, so a fragment-based session can never reach a route handler like `/auth/callback`, on any device, under any circumstance. (This was tried and reverted; it surfaced as `Missing auth callback credentials` on every single attempt.)
  - `createServerSupabaseAuthClient` must therefore stay `flowType: "pkce"`.
- PKCE still has a real limitation: it requires the same browser/device that requested the link to still hold a matching code-verifier cookie when the link is opened. That breaks when a supporter opens the email on a different device, or when their email provider pre-fetches/scans the link before they click it (e.g. Outlook Safe Links) — both common, and both previously surfaced as an opaque "We could not complete sign-in."
- **The robust fix, not yet applied, is an operator-side Supabase Dashboard change**: edit the "Magic Link" email template (Authentication → Email Templates) so its link points directly at this app instead of Supabase's hosted verify-and-redirect, e.g.:
  ```
  {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
  ```
  `/auth/callback` already supports this (`exchangeCallbackForSession` checks for `token_hash` and calls `verifyOtp`) — no app code change needed once the template is updated. This verifies server-side directly, has no code-verifier cookie to lose across devices, and is not defeated by link pre-fetching the same way a single-use `code`/fragment can be. Trade-off: the template link above omits the dynamic `next` redirect target, so a verified supporter lands on the default `/account` rather than back on the specific page they started from; `/auth/callback` already defaults `next` to `/account` when absent, so this degrades gracefully rather than breaking.

## Admin Sign-In

Current flow:

1. Admin visits `/admin` or `/admin?org=[slug]`.
2. `requireAdminRole` checks for an admin session through `getAuthenticatedAdminUser`.
3. If unauthenticated, redirects to `/sign-in?next=[admin path]`.
4. `/auth/start` checks whether the email has an active `owner`, `admin`, or `finance` membership.
5. If yes, client shows password field.
6. Client posts email/password to `/auth/sign-in`.
7. `/auth/sign-in` calls Supabase `signInWithPassword`.
8. It verifies admin membership and stores admin cookies using `setAdminSessionCookies`.
9. Admin is redirected to admin dashboard.

## Important Constraints

- Do not collapse supporter and admin cookies into one session type.
- Do not let magic-link sessions authorize admin pages.
- Do not send admin password sign-in to normal supporter users.
- Supabase service role key is used server-side only for admin lookups and service queries.
- `/auth/start` performs admin access lookup for admin destination paths and for the first generic `/sign-in` email submission, so admin emails show the password field even outside `/admin`.
- The follow-up supporter magic-link request skips the admin lookup after the user has confirmed the create/sign-in prompt.
- Admin-password failure clears admin session cookies only; full sign-out clears both admin and supporter cookies.
- `/auth/sign-in` preserves safe internal admin paths including `/admin`, `/admin/...`, `/admin?...`, and `/admin#...`.
