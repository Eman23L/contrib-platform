create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  fund_id uuid not null,
  name text not null,
  slug text not null,
  description text,
  goal_amount_minor bigint,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint campaigns_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint campaigns_unique_slug_per_org unique (organisation_id, slug),
  constraint campaigns_goal_amount_minor_chk check (
    goal_amount_minor is null or goal_amount_minor > 0
  ),
  constraint campaigns_date_range_chk check (
    ends_at is null or starts_at is null or ends_at >= starts_at
  )
);

create index campaigns_org_active_idx
  on public.campaigns (organisation_id, is_active);

create index campaigns_org_fund_idx
  on public.campaigns (organisation_id, fund_id);

create unique index campaigns_org_id_id_key
  on public.campaigns (organisation_id, id);

alter table public.campaigns
  add constraint campaigns_org_fund_fk
  foreign key (organisation_id, fund_id)
  references public.funds (organisation_id, id)
  on delete cascade;

create trigger set_campaigns_updated_at
before update on public.campaigns
for each row
execute function public.set_updated_at();
