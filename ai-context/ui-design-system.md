# UI Design System

## Current Visual Direction

The product uses a clean dashboard style:

- White cards on pale blue/grey page background.
- Blue and emerald accents.
- Rounded panels, usually `rounded-2xl`.
- Soft shadows.
- Left navigation for admin/supporter/guest dashboard shells.
- Top bar with organisation context, search-style input, and account/sign-in actions.

## Tailwind and Global Styles

Global styles are in `src/app/globals.css`.

Reusable classes include:

- `gf-page`
- `gf-shell`
- `gf-frame`
- `gf-card`
- `gf-card-soft`
- `gf-kicker`
- `gf-title`
- `gf-section-title`
- `gf-copy`
- `gf-helper`
- `gf-label`
- `gf-input`
- `gf-button-primary`
- `gf-button-secondary`
- `gf-link`
- `gf-notice`

Tailwind theme extensions are in `tailwind.config.ts`:

- `surface`
- `ink`
- `accent`
- `accentSoft`

## Admin UI

Current files:

- `src/app/admin/page.tsx`
- `src/app/admin/contributions/page.tsx`
- `src/components/admin/AdminDashboardChrome.tsx`
- Admin table/filter/summary components in `src/components/admin`.

Admin uses a dashboard shell with:

- Left nav.
- Top toolbar.
- Overview cards.
- Giving trends/fund/status panels.
- Section-specific content via query string.

## Supporter UI

Current file:

- `src/app/account/page.tsx`

Supporter account uses a dashboard shell with:

- Left nav sections.
- Top organisation/search/profile bar.
- Home/giving/receipts/recurring/profile/support content sections.
- Giving stat cards and recent contributions table.

Some actions are visual placeholders:

- Download receipt.
- Email receipt.
- Manage recurring gift.
- Edit profile.

## Guest UI

Current files:

- `src/app/o/[orgSlug]/give/page.tsx`
- `src/components/giving/GuestGivingForm.tsx`
- `src/components/giving/FundCard.tsx`
- `src/components/giving/QuickAmounts.tsx`

Guest giving uses a dashboard-like shell but remains focused on public checkout:

- Organisation context.
- Public navigation.
- Assurance cards.
- Giving form panels.
- Right-side helper rail.

## Design Constraints for Future Work

- Keep admin, supporter, and guest shells visually related.
- Do not add marketing landing-page sections where a functional dashboard/form is expected.
- Avoid dead buttons: if a feature is not implemented, make the UI explicit or link to an existing safe route.
- Avoid changing production logic while making style-only changes.

