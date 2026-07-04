-- ALFWC mobile app tables: member submissions and device preferences.
-- Run after 20260620_alfwc_admin_schema.sql

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  request text not null,
  visibility text not null default 'elders_only' check (visibility in ('elders_only', 'prayer_team', 'public_wall')),
  status text not null default 'new' check (status in ('new', 'in_progress', 'answered', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.connect_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text not null,
  message text,
  interests text[] not null default '{}',
  status text not null default 'new' check (status in ('new', 'contacted', 'followed_up', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_notification_preferences (
  device_id text primary key,
  all_church boolean not null default true,
  sermon_follow_up boolean not null default false,
  prayer boolean not null default false,
  events boolean not null default true,
  volunteer_schedule boolean not null default false,
  youth_kids boolean not null default false,
  men_women boolean not null default false,
  emergency_weather boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_profiles (
  device_id text primary key,
  role text,
  interests text[] not null default '{}',
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_prayer_requests_created_at on public.prayer_requests(created_at desc);
create index if not exists idx_prayer_requests_status on public.prayer_requests(status);
create index if not exists idx_connect_cards_created_at on public.connect_cards(created_at desc);
create index if not exists idx_connect_cards_status on public.connect_cards(status);

create or replace function public.set_mobile_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_notification_preferences_updated_at on public.user_notification_preferences;
create trigger set_user_notification_preferences_updated_at
before update on public.user_notification_preferences
for each row execute function public.set_mobile_row_updated_at();

drop trigger if exists set_onboarding_profiles_updated_at on public.onboarding_profiles;
create trigger set_onboarding_profiles_updated_at
before update on public.onboarding_profiles
for each row execute function public.set_mobile_row_updated_at();

alter table public.prayer_requests enable row level security;
alter table public.connect_cards enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.onboarding_profiles enable row level security;

-- Anonymous app users can submit prayer requests and connect cards.
create policy "Anyone can submit prayer requests"
on public.prayer_requests
for insert
to anon, authenticated
with check (true);

create policy "Anyone can submit connect cards"
on public.connect_cards
for insert
to anon, authenticated
with check (true);

-- Staff can read and manage submissions.
create policy "Staff can view prayer requests"
on public.prayer_requests
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

create policy "Staff can update prayer requests"
on public.prayer_requests
for update
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]))
with check (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

create policy "Staff can view connect cards"
on public.connect_cards
for select
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

create policy "Staff can update connect cards"
on public.connect_cards
for update
to authenticated
using (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]))
with check (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

-- Device-scoped notification and onboarding prefs (anon mobile installs).
create policy "Anyone can upsert own notification preferences"
on public.user_notification_preferences
for insert
to anon, authenticated
with check (true);

create policy "Anyone can update own notification preferences"
on public.user_notification_preferences
for update
to anon, authenticated
using (true)
with check (true);

create policy "Anyone can read notification preferences"
on public.user_notification_preferences
for select
to anon, authenticated
using (true);

create policy "Anyone can upsert onboarding profile"
on public.onboarding_profiles
for insert
to anon, authenticated
with check (true);

create policy "Anyone can update onboarding profile"
on public.onboarding_profiles
for update
to anon, authenticated
using (true)
with check (true);

create policy "Anyone can read onboarding profile"
on public.onboarding_profiles
for select
to anon, authenticated
using (true);