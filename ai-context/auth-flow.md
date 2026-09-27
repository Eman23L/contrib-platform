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

Auth flow type:

- `createServerSupabaseAuthClient` (used only for the magic-link flow: `/auth/start`, `/auth/magic-link`, `/auth/callback`) is deliberately configured with `flowType: "implicit"`, not `"pkce"`. PKCE magic links require the same browser/device that requested the link to still hold a matching code-verifier cookie when the link is opened, which reliably breaks when a supporter opens the email on a different device, or when their email provider pre-fetches/scans the link before the person clicks it (e.g. Outlook Safe Links) — both very common in practice, and both previously surfaced as "We could not complete sign-in. Please try again." with no clear cause. `/auth/callback` already supports both `code` (PKCE) and `token_hash` (implicit) callback formats; only the request-side client's flow type controls which one Supabase issues.

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
