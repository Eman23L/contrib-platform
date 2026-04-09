create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  legal_name text,
  country_code text,
  currency_code text not null default 'GBP',
  timezone text not null default 'Europe/London',
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organisations_slug_format_chk check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organisations_currency_code_chk check (currency_code ~ '^[A-Z]{3}$'),
  constraint organisations_country_code_chk check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  )
);

create unique index organisations_slug_key on public.organisations (slug);
create index organisations_active_idx on public.organisations (is_active) where is_active = true;

create trigger set_organisations_updated_at
before update on public.organisations
for each row
execute function public.set_updated_at();
