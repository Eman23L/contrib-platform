create or replace function public.is_org_member(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships membership
    where membership.organisation_id = target_organisation_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
  );
$$;

create or replace function public.has_org_role(
  target_organisation_id uuid,
  allowed_roles public.organisation_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organisation_memberships membership
    where membership.organisation_id = target_organisation_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
      and membership.role = any(allowed_roles)
  );
$$;

alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.funds enable row level security;
alter table public.campaigns enable row level security;
alter table public.contribution_intents enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_log enable row level security;

create policy "members can read their organisations"
on public.organisations
for select
to authenticated
using (public.is_org_member(id));

create policy "owners and admins can update organisations"
on public.organisations
for update
to authenticated
using (public.has_org_role(id, array['owner', 'admin']::public.organisation_role[]))
with check (public.has_org_role(id, array['owner', 'admin']::public.organisation_role[]));

create policy "members can read their memberships"
on public.organisation_memberships
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "owners and admins can manage memberships"
on public.organisation_memberships
for all
to authenticated
using (public.has_org_role(organisation_id, array['owner', 'admin']::public.organisation_role[]))
with check (public.has_org_role(organisation_id, array['owner', 'admin']::public.organisation_role[]));

create policy "members can read organisation funds"
on public.funds
for select
to authenticated
using (public.is_org_member(organisation_id));

create policy "finance roles can manage funds"
on public.funds
for all
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
)
with check (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "members can read organisation campaigns"
on public.campaigns
for select
to authenticated
using (public.is_org_member(organisation_id));

create policy "finance roles can manage campaigns"
on public.campaigns
for all
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
)
with check (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "users can read own contribution intents"
on public.contribution_intents
for select
to authenticated
using (user_id = auth.uid());

create policy "finance roles can read organisation contribution intents"
on public.contribution_intents
for select
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "finance roles can update organisation contribution intents"
on public.contribution_intents
for update
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
)
with check (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "users can read own payments"
on public.payments
for select
to authenticated
using (
  exists (
    select 1
    from public.contribution_intents contribution_intent
    where contribution_intent.id = contribution_intent_id
      and contribution_intent.user_id = auth.uid()
  )
);

create policy "finance roles can read organisation payments"
on public.payments
for select
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "finance roles can update organisation payments"
on public.payments
for update
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
)
with check (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "finance roles can read webhook events"
on public.webhook_events
for select
to authenticated
using (
  organisation_id is not null
  and public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "finance roles can read audit log"
on public.audit_log
for select
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);

create policy "finance roles can insert audit log"
on public.audit_log
for insert
to authenticated
with check (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
  and (actor_user_id is null or actor_user_id = auth.uid())
);
