create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  provider public.payment_provider not null default 'stripe',
  external_event_id text not null,
  event_type text not null,
  status public.webhook_event_status not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint webhook_events_provider_external_event_key unique (provider, external_event_id)
);

create index webhook_events_status_created_idx
  on public.webhook_events (status, created_at desc);

create index webhook_events_org_created_idx
  on public.webhook_events (organisation_id, created_at desc)
  where organisation_id is not null;

create trigger set_webhook_events_updated_at
before update on public.webhook_events
for each row
execute function public.set_updated_at();

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action public.audit_action not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_log_org_created_idx
  on public.audit_log (organisation_id, created_at desc);

create index audit_log_actor_created_idx
  on public.audit_log (actor_user_id, created_at desc)
  where actor_user_id is not null;
