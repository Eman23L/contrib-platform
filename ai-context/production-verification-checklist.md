# Production Verification Checklist

Use this checklist after deploying GetFlow to production. It is a manual QA plan for verifying deployment, checkout, Stripe webhooks, Supabase auth, dashboard totals, and session separation.

## Vercel Deployment

### Test name: Confirm latest GitHub commit is deployed

Steps:

1. Open the Vercel project for GetFlow.
2. Go to Deployments.
3. Confirm the latest production deployment is from `main`.
4. Compare the deployed commit hash with the latest GitHub `main` commit.

Expected result:

- Production deployment uses the latest commit from GitHub.

Where to check if it fails:

- Vercel Deployments page.
- GitHub repo commit history.

Access needed:

- Vercel and GitHub.

### Test name: Confirm production environment variables

Steps:

1. In Vercel, open Project Settings -> Environment Variables.
2. Confirm production has:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `APP_URL` or `NEXT_PUBLIC_APP_URL`, if used for production origin

Expected result:

- All required production variables exist and match live Supabase/Stripe projects.

Where to check if it fails:

- Vercel Environment Variables.
- Supabase Project Settings/API.
- Stripe Developers/API keys and webhook endpoint signing secret.

Access needed:

- Vercel, Supabase, Stripe.

### Test name: Check deployment logs

Steps:

1. In Vercel, open the latest deployment.
2. Review Build Logs and Runtime Logs.
3. Trigger key pages: `/`, `/o/grace-community/give`, `/sign-in`, `/admin`.

Expected result:

- No build errors, missing env errors, or runtime crashes.

Where to check if it fails:

- Vercel Deployment Logs.
- Vercel Functions logs.

Access needed:

- Vercel.

## Guest Checkout

### Test name: Blank email blocked

Steps:

1. Open `https://getflow.thetechbuilder.co.uk/o/grace-community/give`.
2. Select a fund and amount.
3. Leave email blank.
4. Submit.

Expected result:

- Checkout does not start.
- User sees email-required message.
- Browser does not redirect to Stripe.

Where to check if it fails:

- Browser console/network tab for `/api/public/contribution-intents`.
- Vercel function logs.

Access needed:

- Vercel if backend call unexpectedly happens.

### Test name: Invalid email blocked

Steps:

1. Enter an invalid email like `test`.
2. Select fund and amount.
3. Submit.

Expected result:

- Browser/email validation or server validation blocks checkout.
- Stripe Checkout does not open.

Where to check if it fails:

- Browser console/network tab.
- Vercel logs for validation response.

Access needed:

- Vercel if backend error occurs.

### Test name: Valid email reaches Stripe Checkout

Steps:

1. Enter a valid test email.
2. Select fund and amount.
3. Submit.

Expected result:

- Browser redirects to Stripe Checkout.
- A `contribution_intents` row is created with `status = checkout_created`.
- Row has `guest_email`.

Where to check if it fails:

- Browser network tab.
- Vercel `/api/public/contribution-intents` logs.
- Supabase `contribution_intents`.
- Stripe Checkout Sessions.

Access needed:

- Vercel, Supabase, Stripe.

### Test name: Successful payment

Steps:

1. Complete checkout using Stripe test/live-safe method as appropriate.
2. Return to the success page.

Expected result:

- `contribution_intents.status = succeeded`.
- Matching `payments` row exists with `status = succeeded`.
- Admin dashboard Total Raised includes this amount.

Where to check if it fails:

- Stripe Checkout Session and PaymentIntent.
- Stripe webhook delivery logs.
- Supabase `contribution_intents`, `payments`, `webhook_events`.
- Vercel webhook logs.

Access needed:

- Stripe, Supabase, Vercel.

### Test name: Cancelled checkout

Steps:

1. Start checkout with a valid email.
2. On Stripe Checkout, cancel/back out to the app.

Expected result:

- User returns to the failed/cancel page.
- If Stripe sends a supported cancellation/expiry/failure webhook, contribution status updates accordingly.
- If no webhook is sent immediately, row may remain `checkout_created` until Stripe expiry/failure event arrives.

Where to check if it fails:

- Stripe Checkout Session status.
- Stripe webhook events.
- Supabase `contribution_intents`.

Access needed:

- Stripe, Supabase.

## Stripe Webhook

### Test name: Confirm webhook endpoint

Steps:

1. In Stripe Dashboard, go to Developers -> Webhooks.
2. Confirm endpoint URL is `https://getflow.thetechbuilder.co.uk/api/webhooks/stripe`.

Expected result:

- Endpoint exists and points to the production app.
- Signing secret matches Vercel `STRIPE_WEBHOOK_SECRET`.

Where to check if it fails:

- Stripe webhook endpoint config.
- Vercel env vars.

Access needed:

- Stripe, Vercel.

### Test name: Confirm enabled Stripe events

Steps:

1. Open webhook endpoint events in Stripe.
2. Confirm these are enabled:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`

Expected result:

- All listed events are enabled.

Where to check if it fails:

- Stripe webhook endpoint event selection.

Access needed:

- Stripe.

### Test name: Verify webhook delivery

Steps:

1. Complete a checkout.
2. Open Stripe webhook endpoint deliveries.
3. Find the corresponding event.

Expected result:

- Delivery returns HTTP `200`.
- Response body indicates processed/received.
- `webhook_events` row is created/updated.

Where to check if it fails:

- Stripe delivery attempt logs.
- Vercel `/api/webhooks/stripe` logs.
- Supabase `webhook_events`.

Access needed:

- Stripe, Vercel, Supabase.

### Test name: Verify contribution status after webhook

Steps:

1. In Supabase, query recent `contribution_intents`.
2. Compare against Stripe events.

Expected result:

- Completed payment -> `succeeded`.
- Expired checkout -> `expired`.
- Async checkout failure/payment failure -> `failed`.
- PaymentIntent canceled -> `cancelled`.

Where to check if it fails:

- Supabase `contribution_intents`.
- Supabase `webhook_events.last_error`.
- Stripe event payload metadata.

Access needed:

- Supabase, Stripe.

## Supabase Magic Link / Admin Auth

### Test name: Supporter sign-in magic link

Steps:

1. Go to `/sign-in`.
2. Enter a normal supporter email.
3. Confirm create/sign-in prompt.
4. Request sign-in link.
5. Open the email link.

Expected result:

- User lands on `/account`.
- Supporter session cookie is set.
- Giving history loads by user/email where records exist.

Where to check if it fails:

- Supabase Auth users/logs.
- Supabase email logs/settings.
- Vercel `/auth/start` and `/auth/callback` logs.

Access needed:

- Supabase, Vercel.

### Test name: Admin sign-in

Steps:

1. Go to `/admin?org=grace-community`.
2. Enter admin email.
3. Confirm password field appears.
4. Enter password.

Expected result:

- Admin reaches dashboard.
- Admin session cookie is set.
- Supporter magic link is not used for admin access.

Where to check if it fails:

- Supabase Auth user.
- `organisation_memberships`.
- Vercel `/auth/start` and `/auth/sign-in` logs.

Access needed:

- Supabase, Vercel.

### Test name: Admin redirect to contributions page

Steps:

1. Sign out.
2. Visit `/admin/contributions?org=grace-community`.
3. Complete admin sign-in.

Expected result:

- After sign-in, user returns to `/admin/contributions?org=grace-community`.

Where to check if it fails:

- Browser URL after login.
- Vercel `/auth/sign-in` logs.

Access needed:

- Vercel.

### Test name: SMTP need check

Steps:

1. Request several supporter magic links in production.
2. Watch for rate-limit or send failures.

Expected result:

- Emails arrive reliably.
- If failures mention rate limits/email sending, Supabase custom SMTP is needed.

Where to check if it fails:

- Supabase Auth email settings.
- Supabase logs.
- Vercel `/auth/start` logs.

Access needed:

- Supabase, Vercel.

## Admin Dashboard Totals

### Test name: Paid gifts count in Total Raised

Steps:

1. Complete a test payment.
2. Open `/admin?org=grace-community`.
3. Compare Total Raised with succeeded gifts in Supabase.

Expected result:

- Total Raised includes only `contribution_intents.status = succeeded`.

Where to check if it fails:

- Supabase `contribution_intents`.
- Admin dashboard.
- Vercel admin page logs.

Access needed:

- Supabase, Vercel.

### Test name: Pending/incomplete gifts not counted as raised

Steps:

1. Start checkout but do not pay.
2. Leave it as `checkout_created` or pending/incomplete.
3. Refresh admin dashboard.

Expected result:

- Total Gifts may include the record.
- Total Raised does not include the unpaid amount.

Where to check if it fails:

- Supabase `contribution_intents.status`.
- Admin dashboard totals.

Access needed:

- Supabase.

## Supporter Account / Session Separation

### Test name: Supporter remains signed in

Steps:

1. Sign in as supporter through magic link.
2. Open `/account`.
3. Refresh the page.

Expected result:

- Supporter remains on the account page.
- Giving history remains visible.

Where to check if it fails:

- Browser cookies.
- Vercel `/account` logs.
- Supabase Auth user/session validity.

Access needed:

- Supabase, Vercel.

### Test name: Failed admin login does not clear supporter session

Steps:

1. Sign in as supporter.
2. In the same browser, go to `/admin`.
3. Try an admin login with the wrong password or non-admin credentials.
4. Return to `/account`.

Expected result:

- Admin login fails.
- Supporter session remains active.
- `/account` still loads without requesting a new magic link.

Where to check if it fails:

- Browser cookies: supporter cookies should remain.
- Vercel `/auth/sign-in` logs.
- Supabase Auth logs.

Access needed:

- Vercel, Supabase.
