# Multi-Community Requirements

GetFlow is intended to serve multiple churches, charities, and communities. The app must not assume Grace Community Church is the only tenant.

Status labels:

- Current: implemented in the app today.
- Partial: some data/behavior exists, but admin configuration or full workflow is missing.
- Planned/not implemented: expected for the product but not built yet.

## Organisation Display Name

Requirement:

- Every public, supporter, and admin experience should display the selected organisation/community name.

Current status:

- Current: `organisations.name` is loaded by slug and used in admin dashboard and public giving.
- Partial: supporter account falls back to the organisation name from giving history, not a chosen current organisation.

## Organisation Slug

Requirement:

- Each organisation must have a unique public slug for routes like `/o/[orgSlug]` and admin scoping like `/admin?org=[slug]`.

Current status:

- Current: `organisations.slug` exists and is used by public and admin routes.
- Current: missing/invalid org slugs return not found or admin redirects depending on route.

## Public Giving Page Copy

Requirement:

- Each organisation should be able to configure giving page headings, helper text, assurance copy, scripture/value copy where relevant, and empty-state wording.

Current status:

- Partial: organisation name is dynamic.
- Planned/not implemented: editable per-organisation public wording is not built.

## Support/Contact Email

Requirement:

- Each organisation should define a support/contact email or contact instructions shown in supporter account and public giving support areas.

Current status:

- Planned/not implemented: support copy is generic and no support email setting is exposed in admin UI.

## Funds

Requirement:

- Each organisation should define active funds, default fund, display order, descriptions, and archive state.

Current status:

- Current: funds exist in database and active funds are shown on public giving pages.
- Partial: admin can see fund totals but cannot create/edit/archive/reorder funds through UI.

## Campaigns

Requirement:

- Organisations should be able to create campaigns, connect them to funds, set public copy/visibility, and attribute contributions to campaigns.

Current status:

- Partial: campaign table exists and contribution intents can reference campaigns.
- Planned/not implemented: campaign admin UI and public campaign giving are not built.

## Team Members

Requirement:

- Organisation owners/admins should manage team members, invitations, removal, and role changes.

Current status:

- Current: `organisation_memberships` controls admin access.
- Planned/not implemented: team management UI, invite flow, and role editing are not built.

## Roles

Requirement:

- Roles should control access and capabilities. Accepted admin roles currently include `owner`, `admin`, and `finance`.

Current status:

- Current: admin access checks active memberships with `owner`, `admin`, or `finance`.
- Planned/not implemented: role-specific UI permissions and team role management are not fully built.

## Basic Branding and Custom Wording

Requirement:

- Organisations should eventually configure basic branding/custom wording without changing global app design.

Current status:

- Partial: organisation name and initial letter are dynamic in some places.
- Planned/not implemented: logo, colours, brand copy, and wording settings are not editable.

## Settings Section Ownership

Requirement:

- The Settings section should own editable organisation profile settings, public giving copy, support/contact settings, and safe display/configuration state for payment-related setup.

Current status:

- Partial: Settings section shows current organisation name, slug, legal name, currency, timezone, and stored settings data where present.
- Planned/not implemented: editable settings forms, validation, permissions, public copy editing, and audit behavior.

## Product Rule for Multi-Community Work

- Do not hard-code Grace Community Church for new functionality unless it is seed/demo data.
- Prefer organisation-scoped queries and routes.
- Before adding a visible control, define whether it is implemented now, marked coming soon, or hidden.
- Admin functionality must respect organisation membership and role boundaries.
