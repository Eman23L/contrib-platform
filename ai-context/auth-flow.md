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

1. User enters email in `UnifiedSignInCard`.
2. Client calls `POST /auth/start`.
3. On the first email submission, `/auth/start` checks whether the email belongs to an active admin/member account. If it does, the client shows the password field.
4. If the email is not an admin account, `/auth/start` can return `create_account_prompt`.
5. User confirms by pressing the button again.
6. `/auth/start` calls Supabase `signInWithOtp` with `shouldCreateUser: true`.
7. User clicks the email link.
8. `/auth/callback` exchanges the code/token for a Supabase session.
9. `setSupporterSessionCookies` stores supporter cookies.
10. User is redirected to `/account`.
11. `/account` loads giving history by authenticated user ID and email.

Known external dependency:

- Supabase built-in email has strict rate limits. If custom SMTP is not configured in Supabase, magic links can fail with `email rate limit exceeded`.

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
