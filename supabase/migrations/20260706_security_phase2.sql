-- Phase 2 security hardening (P1)
-- Run after 20260705_security_phase1.sql
--
-- Fixes:
-- 1. app_content inserts must be drafts
-- 2. Stop auto-provisioning editor role for every new auth user
-- 3. Narrow staff-only SELECT policies
-- 4. Add contact_me prayer visibility option
-- 5. Allow authenticated staff to read app-assets bucket

-- ---------------------------------------------------------------------------
-- H2: Inserts into app_content must start as drafts
-- ---------------------------------------------------------------------------

drop policy if exists "Editors can create drafts" on public.app_content;

create policy "Editors can create drafts"
on public.app_content
for insert
to authenticated
with check (
  public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
  and status = 'draft'
);

-- ---------------------------------------------------------------------------
-- H1: Only invited staff accounts receive admin_profiles rows
-- Set user metadata {"alfwc_staff": "true"} when inviting from Supabase.
-- Or run seed-initial-admin.sql after the first admin signs in.
-- ---------------------------------------------------------------------------

create or replace function public.ensure_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'alfwc_staff', '') <> 'true' then
    return new;
  end if;

  insert into public.admin_profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'editor'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- M4: Restrict reads to staff roles
-- ---------------------------------------------------------------------------

drop policy if exists "Profiles are visible to authenticated users" on public.admin_profiles;

create policy "Staff can view admin profiles"
on public.admin_profiles
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

drop policy if exists "Authenticated users can view content" on public.app_content;

create policy "Staff can view all content"
on public.app_content
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

drop policy if exists "Authenticated users can view revisions" on public.content_revisions;

create policy "Staff can view content revisions"
on public.content_revisions
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

drop policy if exists "Authenticated users can view audit events" on public.audit_events;

create policy "Staff can view audit events"
on public.audit_events
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

-- ---------------------------------------------------------------------------
-- H4: Prayer visibility enum alignment with mobile UI
-- ---------------------------------------------------------------------------

alter table public.prayer_requests
  drop constraint if exists prayer_requests_visibility_check;

alter table public.prayer_requests
  add constraint prayer_requests_visibility_check
  check (visibility in ('elders_only', 'prayer_team', 'public_wall', 'contact_me'));

-- ---------------------------------------------------------------------------
-- M7: Staff can read uploaded assets when signed in
-- ---------------------------------------------------------------------------

drop policy if exists "Authenticated staff can read app assets" on storage.objects;

create policy "Authenticated staff can read app assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'app-assets'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
);