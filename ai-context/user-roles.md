# User Roles

## Guest Supporter

Current behavior:

- Can visit `/o/[orgSlug]/give`.
- Can choose a fund, enter an amount, optionally enter first name, last name, and email, then continue to Stripe Checkout.
- If email is supplied, the contribution can later appear in a supporter account by matching `contribution_intents.guest_email`.

Limits:

- Guest identity is not verified during checkout.
- Guest can give without account creation.

## Authenticated Supporter

Current behavior:

- Signs in through email magic link.
- Session is stored using supporter cookies from `setSupporterSessionCookies`.
- Can visit `/account`.
- Giving history is loaded from `getSupporterGivingHistory`, matching both:
  - `contribution_intents.user_id`
  - `contribution_intents.guest_email`
- The account dashboard has sections for Home, My Giving, Receipts, Recurring Gifts, Profile, and Support.

Limits:

- Profile editing is not implemented.
- Receipt download/email buttons are UI only.
- Recurring gift management is not connected to Stripe subscriptions.

## Organisation Admin / Finance / Owner

Current behavior:

- Admin access is based on rows in `organisation_memberships`.
- Roles accepted by `listAdminMembershipsForUser`: `owner`, `admin`, `finance`.
- Admin pages use `requireAdminRole`.
- Admin sessions are password-backed and stored separately from supporter sessions with admin cookies.
- Admin dashboard is available at `/admin?org=[slug]`.
- Contribution records are available at `/admin/contributions?org=[slug]`.

Limits:

- Team management is not implemented.
- Settings section is only a dashboard section, not a real settings editor.
- Admin password setup/invitation flows are not built in the app.

## Anonymous/Unauthenticated Visitor

Current behavior:

- Can access public landing and giving routes.
- Is redirected to `/sign-in` when visiting `/account` or admin pages without an appropriate session.

