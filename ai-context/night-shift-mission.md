# Night Shift Mission

Night Shift is an approved autonomous maintenance loop for GetFlow.

## Product Goal

GetFlow is a multi-community giving and contributions platform for churches, charities, and communities.

## Core Flows To Protect

- Admin account/password access.
- Supporter magic-link account flow.
- Guest giving flow.
- Stripe Checkout and webhook reliability.
- Payment status tracking.
- Admin dashboard data correctness.
- Supporter account giving history.
- Multi-community organisation support.
- Production readiness.
- Visible features that claim to work.

## Approved Operating Mode

- Push directly to `main` after focused changes pass checks.
- Continue after each successful push while safe useful work remains.
- If one task is blocked, log it in `night-shift-log.md` and continue to the next safe task.
- Do not stop the whole run because one item needs a morning decision.

## Scope

Allowed:

- Inspect code and project context.
- Fix safe bugs aligned with the product goal.
- Improve existing functionality without redesigning UI.
- Add or improve tests when supported by the project.
- Update `/ai-context`.
- Add safe, documented migrations when clearly required.
- Add a dependency only when necessary, lightweight, actively maintained, and justified.

Still blocked without explicit approval:

- RLS/security policy changes that could expose private data.
- Stripe payment logic changes that could affect real payments.
- Environment variable or secret changes.
- Deleting production data.
- Auth model changes.
- Deployment settings changes.
- Major visual redesign.
- Pushing when TypeScript fails, or when lint/build fails due to the new work.
