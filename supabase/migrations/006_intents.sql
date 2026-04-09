create table public.contribution_intents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  fund_id uuid,
  campaign_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  amount_minor bigint not null,
  currency_code text not null,
  status public.contribution_intent_status not null default 'draft',
  payment_provider public.payment_provider not null default 'stripe',
  guest_email text,
  donor_name text,
  donor_note text,
  is_anonymous boolean not null default false,
  source text not null default 'qr',
  stripe_checkout_session_id text,
  checkout_url text,
  expires_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contribution_intents_amount_minor_chk check (amount_minor > 0),
  constraint contribution_intents_currency_code_chk check (currency_code ~ '^[A-Z]{3}$'),
  constraint contribution_intents_source_chk check (
    source in ('qr', 'web', 'admin')
  ),
  constraint contribution_intents_guest_or_user_chk check (
    user_id is not null or guest_email is not null
  )
);

comment on table public.contribution_intents is
  'Stores a pre-payment intent for both guest and authenticated giving flows.';

create unique index contribution_intents_stripe_checkout_session_id_key
  on public.contribution_intents (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index contribution_intents_org_created_idx
  on public.contribution_intents (organisation_id, created_at desc);

create index contribution_intents_org_status_idx
  on public.contribution_intents (organisation_id, status, created_at desc);

create index contribution_intents_user_created_idx
  on public.contribution_intents (user_id, created_at desc)
  where user_id is not null;

create index contribution_intents_fund_idx
  on public.contribution_intents (fund_id, created_at desc)
  where fund_id is not null;

create unique index contribution_intents_org_id_id_key
  on public.contribution_intents (organisation_id, id);

alter table public.contribution_intents
  add constraint contribution_intents_org_fund_fk
  foreign key (organisation_id, fund_id)
  references public.funds (organisation_id, id)
  on delete set null;

alter table public.contribution_intents
  add constraint contribution_intents_org_campaign_fk
  foreign key (organisation_id, campaign_id)
  references public.campaigns (organisation_id, id)
  on delete set null;

create trigger set_contribution_intents_updated_at
before update on public.contribution_intents
for each row
execute function public.set_updated_at();
