create type public.recurring_plan_status as enum (
  'active',
  'past_due',
  'canceled'
);

create table public.recurring_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  fund_id uuid,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_minor bigint not null,
  currency_code text not null,
  interval text not null default 'month',
  status public.recurring_plan_status not null default 'active',
  donor_name text,
  stripe_subscription_id text not null,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  canceled_at timestamptz,
  constraint recurring_plans_amount_minor_chk check (amount_minor > 0),
  constraint recurring_plans_currency_code_chk check (currency_code ~ '^[A-Z]{3}$'),
  constraint recurring_plans_interval_chk check (interval = 'month')
);

create unique index recurring_plans_stripe_subscription_id_key
  on public.recurring_plans (stripe_subscription_id);

create unique index recurring_plans_stripe_checkout_session_id_key
  on public.recurring_plans (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index recurring_plans_org_status_idx
  on public.recurring_plans (organisation_id, status, created_at desc);

create index recurring_plans_user_idx
  on public.recurring_plans (user_id, created_at desc);

alter table public.recurring_plans
  add constraint recurring_plans_org_fund_fk
  foreign key (organisation_id, fund_id)
  references public.funds (organisation_id, id)
  on delete set null;

create trigger set_recurring_plans_updated_at
before update on public.recurring_plans
for each row
execute function public.set_updated_at();

alter table public.contribution_intents
  add column recurring_plan_id uuid references public.recurring_plans(id) on delete set null;

create index contribution_intents_recurring_plan_idx
  on public.contribution_intents (recurring_plan_id)
  where recurring_plan_id is not null;

alter table public.contribution_intents
  drop constraint contribution_intents_source_chk;

alter table public.contribution_intents
  add constraint contribution_intents_source_chk check (
    source in ('qr', 'web', 'admin', 'recurring')
  );

alter table public.recurring_plans enable row level security;

create policy "users can read own recurring plans"
on public.recurring_plans
for select
to authenticated
using (user_id = auth.uid());

create policy "finance roles can read organisation recurring plans"
on public.recurring_plans
for select
to authenticated
using (
  public.has_org_role(
    organisation_id,
    array['owner', 'admin', 'finance']::public.organisation_role[]
  )
);
