create table public.funds (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint funds_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint funds_unique_slug_per_org unique (organisation_id, slug)
);

create index funds_org_active_idx
  on public.funds (organisation_id, is_active, display_order);

create index funds_org_default_idx
  on public.funds (organisation_id, is_default)
  where is_default = true;

create unique index funds_org_id_id_key
  on public.funds (organisation_id, id);

create trigger set_funds_updated_at
before update on public.funds
for each row
execute function public.set_updated_at();
