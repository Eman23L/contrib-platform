insert into public.organisations (
  id,
  name,
  slug,
  legal_name,
  country_code,
  currency_code,
  timezone,
  settings
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Grace Community Church',
  'grace-community',
  'Grace Community Church',
  'GB',
  'GBP',
  'Europe/London',
  jsonb_build_object(
    'public_giving_enabled', true,
    'receipt_emails_enabled', true,
    'default_source', 'qr'
  )
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  legal_name = excluded.legal_name,
  country_code = excluded.country_code,
  currency_code = excluded.currency_code,
  timezone = excluded.timezone,
  settings = excluded.settings,
  updated_at = timezone('utc', now());

insert into public.funds (
  id,
  organisation_id,
  name,
  slug,
  description,
  is_default,
  is_active,
  display_order
)
values
  (
    '22222222-2222-2222-2222-222222222221',
    '11111111-1111-1111-1111-111111111111',
    'Tithe',
    'tithe',
    'General tithe and regular giving.',
    true,
    true,
    1
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Offering',
    'offering',
    'General offering fund for weekly giving.',
    false,
    true,
    2
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '11111111-1111-1111-1111-111111111111',
    'Building Fund',
    'building-fund',
    'Restricted fund for building improvements and projects.',
    false,
    true,
    3
  )
on conflict (id) do update
set
  organisation_id = excluded.organisation_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  is_default = excluded.is_default,
  is_active = excluded.is_active,
  display_order = excluded.display_order,
  updated_at = timezone('utc', now());

insert into public.campaigns (
  id,
  organisation_id,
  fund_id,
  name,
  slug,
  description,
  goal_amount_minor,
  starts_at,
  is_active
)
values (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222223',
  'Hall Renovation 2026',
  'hall-renovation-2026',
  'Capital campaign for the main hall renovation.',
  5000000,
  timezone('utc', now()),
  true
)
on conflict (id) do update
set
  organisation_id = excluded.organisation_id,
  fund_id = excluded.fund_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  goal_amount_minor = excluded.goal_amount_minor,
  starts_at = excluded.starts_at,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());
