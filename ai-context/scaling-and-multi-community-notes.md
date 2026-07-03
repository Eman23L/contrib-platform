# Scaling And Multi-Community Notes

GetFlow should support multiple churches, charities, and communities without code changes per organisation.

## Current Strengths

- Organisations have database-backed names, slugs, currency, legal name, timezone, settings, and active state.
- Public giving pages load organisations by slug.
- Admin access and dashboards are scoped through `organisation_memberships`.
- Funds are organisation-scoped.
- Contributions and payments store `organisation_id`.

## Current Limitations

- Generic sign-in hides the guest giving link when no organisation can be inferred.
- Supporter account hides giving links when no organisation can be inferred instead of routing to a hard-coded organisation.
- The `/sign-in` guest giving link uses the safe admin `next` path's `org` query parameter when present.
- Supporter account does not have an explicit current organisation selector.
- Supporter account give-again/support links use the best available giving-history organisation slug when available.
- Organisation settings are editable by owner/admin for safe public identity and wording fields.
- Public giving copy and support contact details are editable per organisation through Settings.
- Team member display lacks email/profile fields in app-owned tables.
- Admin write workflows for funds, campaigns, and team are not built; settings and contribution export have MVP write/export paths.
- Source code no longer contains `grace-community` as a user-facing fallback route or settings placeholder.

## Scaling Priorities

- Reduce hard-coded fallback routes where current data can provide an organisation slug.
- Add safe organisation-aware supporter account navigation where a supporter has gifts to multiple communities.
- Keep all admin queries scoped by authorised organisation ID.
- Add settings/profile data only with clear RLS and privacy rules.
