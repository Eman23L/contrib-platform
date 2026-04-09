create extension if not exists pgcrypto;

create type public.organisation_role as enum (
  'owner',
  'admin',
  'finance',
  'member'
);

create type public.contribution_intent_status as enum (
  'draft',
  'checkout_created',
  'pending_payment',
  'succeeded',
  'failed',
  'cancelled',
  'expired'
);

create type public.payment_provider as enum (
  'stripe'
);

create type public.payment_status as enum (
  'pending',
  'succeeded',
  'failed',
  'cancelled'
);

create type public.webhook_event_status as enum (
  'received',
  'processed',
  'failed'
);

create type public.audit_action as enum (
  'create',
  'update',
  'delete',
  'publish',
  'archive',
  'login',
  'export',
  'status_change'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;
