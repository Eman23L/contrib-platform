# Night Shift Safety Rules

## Git Rules

- Start by checking `git status --short --branch`.
- Record the starting commit hash in `night-shift-log.md`.
- Stage only files related to the current focused task.
- Commit with a clear professional message.
- Push directly to `main` only after checks pass.
- After each push, run `git status --short --branch` and confirm the tree is clean.

## Checks

Before pushing app-code changes:

- Run `.\node_modules\.bin\tsc.cmd --noEmit`.
- Run `npm run lint`.
- Run `npm run build` where possible.
- If `next build` fails only because of the known Windows sandbox `spawn EPERM`, rerun outside the sandbox with approval.

Do not push if:

- TypeScript fails.
- Lint fails because of the new work.
- Build fails for a reason other than the known sandbox issue.

## Blocked Task Rule

If a useful task is blocked by a safety rule:

- Do not implement the risky part.
- Add it to `night-shift-log.md`.
- Explain what was intended.
- Explain why it was blocked.
- Explain the permission or decision needed in the morning.
- Continue to the next safe useful task.

## Database And Schema

- Schema changes are allowed only when clearly needed and safe.
- Never make destructive schema changes.
- Never delete production data.
- If a migration affects auth, payment, supporter privacy, organisation scoping, or Supabase security/RLS, log the risk clearly.

## Dependencies

- New dependencies are allowed only when necessary, lightweight, actively maintained, and justified.
- Avoid dependencies for simple code that can be implemented safely in the existing stack.

## UI

- Do not redesign the app.
- Do not change colours, fonts, spacing, cards, sidebars, or the layout system.
- Small copy/layout changes are allowed only to make visible behavior truthful and functional.
- Do not add fake placeholder features.
- If a feature can be made useful with current data, make it useful instead of parking it.
