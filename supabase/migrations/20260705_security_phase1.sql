-- Phase 1 security hardening (P0)
-- Run after 20260704_alfwc_mobile_tables.sql
--
-- Fixes:
-- 1. Block self-service admin role escalation on admin_profiles
-- 2. Scope device preference tables to the caller's x-device-id header

-- ---------------------------------------------------------------------------
-- C1: admin_profiles — prevent self role escalation
-- ---------------------------------------------------------------------------

drop policy if exists "Users can update their own profile" on public.admin_profiles;

create policy "Users can update own display name"
on public.admin_profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (
    select p.role
    from public.admin_profiles p
    where p.id = auth.uid()
  )
);

create or replace function public.prevent_admin_profile_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if not public.has_app_role(auth.uid(), array['admin']::app_role[]) then
      raise exception 'Only admins can change staff roles';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_admin_profile_role_escalation on public.admin_profiles;
create trigger prevent_admin_profile_role_escalation
before update on public.admin_profiles
for each row execute function public.prevent_admin_profile_role_escalation();

-- ---------------------------------------------------------------------------
-- C2: device tables — enforce x-device-id header (matches mobile client)
-- ---------------------------------------------------------------------------

create or replace function public.request_device_id()
returns text
language sql
stable
as $$
  select nullif(
    trim(
      coalesce(
        current_setting('request.headers', true)::json->>'x-device-id',
        ''
      )
    ),
    ''
  );
$$;

create or replace function public.is_valid_device_id(device_id text)
returns boolean
language sql
immutable
as $$
  select device_id ~ '^[a-zA-Z0-9-]{8,48}$';
$$;

create or replace function public.device_id_matches_request(requested_device_id text)
returns boolean
language sql
stable
as $$
  select public.is_valid_device_id(requested_device_id)
    and requested_device_id = public.request_device_id();
$$;

-- user_notification_preferences
drop policy if exists "Anyone can upsert own notification preferences" on public.user_notification_preferences;
drop policy if exists "Anyone can update own notification preferences" on public.user_notification_preferences;
drop policy if exists "Anyone can read notification preferences" on public.user_notification_preferences;

create policy "Device can insert own notification preferences"
on public.user_notification_preferences
for insert
to anon, authenticated
with check (public.device_id_matches_request(device_id));

create policy "Device can update own notification preferences"
on public.user_notification_preferences
for update
to anon, authenticated
using (public.device_id_matches_request(device_id))
with check (public.device_id_matches_request(device_id));

create policy "Device can read own notification preferences"
on public.user_notification_preferences
for select
to anon, authenticated
using (public.device_id_matches_request(device_id));

-- onboarding_profiles
drop policy if exists "Anyone can upsert onboarding profile" on public.onboarding_profiles;
drop policy if exists "Anyone can update onboarding profile" on public.onboarding_profiles;
drop policy if exists "Anyone can read onboarding profile" on public.onboarding_profiles;

create policy "Device can insert own onboarding profile"
on public.onboarding_profiles
for insert
to anon, authenticated
with check (public.device_id_matches_request(device_id));

create policy "Device can update own onboarding profile"
on public.onboarding_profiles
for update
to anon, authenticated
using (public.device_id_matches_request(device_id))
with check (public.device_id_matches_request(device_id));

create policy "Device can read own onboarding profile"
on public.onboarding_profiles
for select
to anon, authenticated
using (public.device_id_matches_request(device_id));