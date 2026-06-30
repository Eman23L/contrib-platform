# Codex Loop Instructions

Use this file as operating guidance for future Codex sessions.

## Before Editing

1. Run `git status --short --branch`.
2. Inspect relevant files before assuming behavior.
3. Check `/ai-context` for current project memory.
4. Identify whether the task is documentation-only, UI-only, auth/payment/database, or mixed.
5. Do not stage unrelated user changes.

## Documentation-Only Tasks

For documentation-only tasks:

- Only edit docs.
- Do not edit app code, config, routes, schema, environment files, auth, Stripe, or Supabase logic.
- Commit only the documentation files requested.

## Auth Tasks

Before changing auth:

- Read `auth-flow.md`.
- Inspect `src/lib/supabase/server.ts`, `src/app/auth/start/route.ts`, `src/app/auth/sign-in/route.ts`, `src/app/auth/callback/route.ts`, and `src/lib/auth/requireAdminRole.ts`.
- Preserve supporter/admin cookie separation.
- Do not let supporter magic-link sessions authorize admin pages.

## Stripe/Payment Tasks

Before changing payment logic:

- Read `stripe-payment-flow.md`.
- Inspect `startContributionCheckout`, `createContributionIntent`, webhook route, and webhook processing service.
- Preserve idempotency assumptions and database constraints.
- Do not change environment variable names casually.

## Database Tasks

Before changing database behavior:

- Read `database-map.md`.
- Inspect migrations and RLS policies.
- Add migrations for schema changes; do not rely on untracked manual database edits.
- Update TypeScript mappers/types in the same task.

## UI Tasks

Before changing UI:

- Read `ui-design-system.md`.
- Read `feature-contracts.md` when the task touches a visible page, section, navigation item, button, or workflow.
- Keep admin, supporter, and guest dashboard shells visually consistent.
- Avoid dead links/buttons. If an action is planned but not implemented, make the state clear or link to a safe current route.
- Verify desktop and mobile responsiveness.

## Feature Contract Rule

Before implementing new work, Codex must check whether the visible feature already does what it claims to do. If a feature is only a placeholder, Codex must propose one of these paths before changing functionality:

- Make it real.
- Disable it.
- Hide it.
- Clearly mark it as coming soon.

Do not add new visible controls or sections that imply working functionality unless the implementation is included in the same approved task.

## Verification

Use the available local commands:

- `.\node_modules\.bin\tsc.cmd --noEmit`
- `.\node_modules\.bin\next.cmd build`

Known environment issue:

- On this Windows sandbox, `next build` may fail with `spawn EPERM`; rerun outside the sandbox with approval when needed.

## Committing

1. Run `git status --short --branch`.
2. Stage only files relevant to the task.
3. Commit with the requested message when provided.
4. Push only after the commit is correct.
5. In the final response, include changed files, verification, commit hash, and push status.
