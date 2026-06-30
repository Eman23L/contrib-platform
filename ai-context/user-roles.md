# User Roles

## Guest Supporter

Current behavior:

- Can visit `/o/[orgSlug]/give`.
- Can choose a fund, enter an amount, enter an email address, optionally enter first name and last name, then continue to Stripe Checkout.
- Email is required because contribution records must have either `user_id` or `guest_email`, and supporter history is linked by matching `contribution_intents.guest_email`.

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
- The account dashboard has visible sections for Home, My Giving, Receipts, Profile, and Support.
- The direct recurring section URL remains available as an honest no-recurring-records view, but recurring navigation/actions are hidden until subscriptions exist.

Limits:

- Profile editing is not implemented.
- Receipts currently link to existing success pages; PDF download and email receipt sending are not implemented.
- Recurring gift management is not connected to Stripe subscriptions and is not shown as an active management action.

## Organisation Admin / Finance / Owner

Current behavior:

- Admin access is based on rows in `organisation_memberships`.
- Roles accepted by `listAdminMembershipsForUser`: `owner`, `admin`, `finance`.
- Admin pages use `requireAdminRole`.
- Admin sessions are password-backed and stored separately from supporter sessions with admin cookies.
- Admin dashboard is available at `/admin?org=[slug]`.
- Contribution records are available at `/admin/contributions?org=[slug]`.

Limits:

- Team section is read-only and lists visible membership records; invite/remove/change role workflows are not implemented.
- Settings section is read-only and shows organisation data; editing workflows are not implemented.
- Admin password setup/invitation flows are not built in the app.

## Anonymous/Unauthenticated Visitor

Current behavior:

- Can access public landing and giving routes.
- Is redirected to `/sign-in` when visiting `/account` or admin pages without an appropriate session.
