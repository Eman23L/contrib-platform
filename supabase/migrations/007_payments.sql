create table public.payments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  contribution_intent_id uuid not null,
  payment_provider public.payment_provider not null default 'stripe',
  status public.payment_status not null default 'pending',
  amount_minor bigint not null,
  currency_code text not null,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint payments_amount_minor_chk check (amount_minor > 0),
  constraint payments_currency_code_chk check (currency_code ~ '^[A-Z]{3}$')
);

create unique index payments_contribution_intent_id_key
  on public.payments (contribution_intent_id);

create unique index payments_stripe_checkout_session_id_key
  on public.payments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index payments_stripe_payment_intent_id_key
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create unique index payments_stripe_charge_id_key
  on public.payments (stripe_charge_id)
  where stripe_charge_id is not null;

create index payments_org_status_paid_at_idx
  on public.payments (organisation_id, status, paid_at desc);

create index payments_org_created_idx
  on public.payments (organisation_id, created_at desc);

alter table public.payments
  add constraint payments_org_contribution_intent_fk
  foreign key (organisation_id, contribution_intent_id)
  references public.contribution_intents (organisation_id, id)
  on delete cascade;

create trigger set_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();
