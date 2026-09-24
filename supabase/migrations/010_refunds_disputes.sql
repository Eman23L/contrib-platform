alter type public.contribution_intent_status add value if not exists 'refunded';
alter type public.contribution_intent_status add value if not exists 'disputed';
alter type public.payment_status add value if not exists 'refunded';
alter type public.payment_status add value if not exists 'disputed';
