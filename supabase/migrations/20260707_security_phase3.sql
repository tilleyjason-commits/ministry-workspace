-- Phase 3 security hardening (P2)
-- Run after 20260706_security_phase2.sql
--
-- Adds field length limits, basic per-IP form rate limiting, and rate-limit logging.

-- ---------------------------------------------------------------------------
-- 3.1: Field length limits
-- ---------------------------------------------------------------------------

alter table public.prayer_requests
  drop constraint if exists prayer_requests_request_len,
  drop constraint if exists prayer_requests_name_len,
  drop constraint if exists prayer_requests_contact_len;

alter table public.prayer_requests
  add constraint prayer_requests_request_len check (char_length(request) between 1 and 5000),
  add constraint prayer_requests_name_len check (name is null or char_length(name) <= 200),
  add constraint prayer_requests_contact_len check (contact is null or char_length(contact) <= 200);

alter table public.connect_cards
  drop constraint if exists connect_cards_name_len,
  drop constraint if exists connect_cards_contact_len,
  drop constraint if exists connect_cards_message_len,
  drop constraint if exists connect_cards_interests_len;

alter table public.connect_cards
  add constraint connect_cards_name_len check (char_length(name) between 1 and 200),
  add constraint connect_cards_contact_len check (char_length(contact) between 1 and 200),
  add constraint connect_cards_message_len check (message is null or char_length(message) <= 2000),
  add constraint connect_cards_interests_len check (coalesce(array_length(interests, 1), 0) <= 10);

-- ---------------------------------------------------------------------------
-- 3.2: Per-IP submission rate limiting (5 per form type per hour)
-- ---------------------------------------------------------------------------

create table if not exists public.form_rate_limit_log (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('prayer_request', 'connect_card')),
  client_ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_form_rate_limit_log_lookup
  on public.form_rate_limit_log (form_type, client_ip, created_at desc);

alter table public.form_rate_limit_log enable row level security;

create or replace function public.request_client_ip()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(
      trim(
        split_part(
          coalesce(current_setting('request.headers', true)::json->>'x-forwarded-for', ''),
          ',',
          1
        )
      ),
      ''
    ),
    nullif(trim(current_setting('request.headers', true)::json->>'cf-connecting-ip'), ''),
    nullif(trim(current_setting('request.headers', true)::json->>'x-real-ip'), ''),
    'unknown'
  );
$$;

create or replace function public.enforce_form_rate_limit(target_form_type text, max_per_hour integer default 5)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  request_ip text := public.request_client_ip();
  recent_count integer;
begin
  if request_ip = 'unknown' then
    return;
  end if;

  select count(*)::integer
  into recent_count
  from public.form_rate_limit_log
  where form_type = target_form_type
    and form_rate_limit_log.client_ip = request_ip
    and created_at > now() - interval '1 hour';

  if recent_count >= max_per_hour then
    raise exception 'Rate limit exceeded for % submissions. Please try again later.', target_form_type
      using errcode = 'P0001';
  end if;

  insert into public.form_rate_limit_log (form_type, client_ip)
  values (target_form_type, request_ip);
end;
$$;

create or replace function public.enforce_prayer_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.enforce_form_rate_limit('prayer_request', 5);
  return new;
end;
$$;

create or replace function public.enforce_connect_card_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.enforce_form_rate_limit('connect_card', 5);
  return new;
end;
$$;

drop trigger if exists enforce_prayer_submission_rate_limit on public.prayer_requests;
create trigger enforce_prayer_submission_rate_limit
before insert on public.prayer_requests
for each row execute function public.enforce_prayer_submission_rate_limit();

drop trigger if exists enforce_connect_card_submission_rate_limit on public.connect_cards;
create trigger enforce_connect_card_submission_rate_limit
before insert on public.connect_cards
for each row execute function public.enforce_connect_card_submission_rate_limit();