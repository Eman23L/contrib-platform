create table public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organisation_role not null default 'member',
  is_active boolean not null default true,
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organisation_memberships_unique_user_per_org unique (organisation_id, user_id)
);

create index organisation_memberships_user_idx
  on public.organisation_memberships (user_id);

create index organisation_memberships_org_role_idx
  on public.organisation_memberships (organisation_id, role)
  where is_active = true;

create trigger set_organisation_memberships_updated_at
before update on public.organisation_memberships
for each row
execute function public.set_updated_at();
