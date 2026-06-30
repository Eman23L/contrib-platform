# Scaling And Multi-Community Notes

GetFlow should support multiple churches, charities, and communities without code changes per organisation.

## Current Strengths

- Organisations have database-backed names, slugs, currency, legal name, timezone, settings, and active state.
- Public giving pages load organisations by slug.
- Admin access and dashboards are scoped through `organisation_memberships`.
- Funds are organisation-scoped.
- Contributions and payments store `organisation_id`.

## Current Limitations

- Some fallback links still use `grace-community` when no organisation can be inferred.
- The `/sign-in` guest giving link uses the safe admin `next` path's `org` query parameter when present.
- Supporter account does not have an explicit current organisation selector.
- Organisation settings are read-only in the admin UI.
- Public giving copy and support contact details are not editable per organisation.
- Team member display lacks email/profile fields in app-owned tables.
- Admin write workflows for funds, campaigns, team, settings, and exports are not built.

## Scaling Priorities

- Reduce hard-coded fallback routes where current data can provide an organisation slug.
- Add safe organisation-aware supporter account navigation where a supporter has gifts to multiple communities.
- Keep all admin queries scoped by authorised organisation ID.
- Add settings/profile data only with clear RLS and privacy rules.
