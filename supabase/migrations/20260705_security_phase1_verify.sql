-- Optional verification queries after running 20260705_security_phase1.sql
-- Run in Supabase SQL Editor. These should succeed without errors.

-- Helpers exist
select proname
from pg_proc
where proname in (
  'request_device_id',
  'is_valid_device_id',
  'device_id_matches_request',
  'prevent_admin_profile_role_escalation'
)
order by proname;

-- Old permissive device policies are gone
select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('user_notification_preferences', 'onboarding_profiles')
  and policyname like 'Anyone can%';

-- Expected: 0 rows

-- New device policies are present
select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('user_notification_preferences', 'onboarding_profiles')
  and policyname like 'Device can%'
order by tablename, policyname;

-- admin_profiles self-update policy renamed
select policyname
from pg_policies
where schemaname = 'public'
  and tablename = 'admin_profiles'
  and cmd = 'UPDATE'
order by policyname;