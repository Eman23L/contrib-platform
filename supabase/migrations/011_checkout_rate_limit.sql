create table public.checkout_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  client_key text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index checkout_rate_limit_events_client_key_created_idx
  on public.checkout_rate_limit_events (client_key, created_at desc);

-- Written and read only via the service role from server-side checkout
-- request handling; RLS is enabled with no policies so it is otherwise
-- inaccessible to anon/authenticated clients.
alter table public.checkout_rate_limit_events enable row level security;
