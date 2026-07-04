create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type app_role as enum ('editor', 'publisher', 'admin');
  end if;
end $$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role app_role not null default 'editor',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_content (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('home', 'sermon', 'event', 'quick_action', 'links', 'onboarding', 'image_asset')),
  slug text not null,
  title text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  content jsonb not null default '{}'::jsonb,
  image_public_url text,
  image_alt text,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section, slug)
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.app_content(id) on delete cascade,
  status text not null check (status in ('draft', 'published', 'archived')),
  content jsonb not null default '{}'::jsonb,
  image_public_url text,
  image_alt text,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_app_content_section_status on public.app_content(section, status);
create index if not exists idx_app_content_updated_at on public.app_content(updated_at desc);
create index if not exists idx_content_revisions_content_id on public.content_revisions(content_id, created_at desc);
create index if not exists idx_audit_events_created_at on public.audit_events(created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_admin_profiles_updated_at
before update on public.admin_profiles
for each row execute function public.set_updated_at();

create trigger set_app_content_updated_at
before update on public.app_content
for each row execute function public.set_updated_at();

create or replace function public.has_app_role(target_user_id uuid, allowed_roles app_role[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_profiles p
    where p.id = target_user_id
      and p.role = any(allowed_roles)
  );
$$;

create or replace function public.app_actor_email()
returns text
language sql
stable
as $$
  select auth.jwt() ->> 'email';
$$;

create or replace function public.ensure_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.ensure_admin_profile();

create or replace function public.log_content_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_row record;
  changed_action text;
begin
  if tg_op = 'DELETE' then
    changed_row := old;
    changed_action := 'delete';
  else
    changed_row := new;
    changed_action := case when tg_op = 'INSERT' then 'insert' else 'update' end;
  end if;

  insert into public.audit_events (
    actor_id,
    actor_email,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    public.app_actor_email(),
    changed_action,
    'app_content',
    changed_row.id,
    jsonb_build_object(
      'section', changed_row.section,
      'slug', changed_row.slug,
      'title', changed_row.title,
      'status', changed_row.status,
      'sort_order', changed_row.sort_order
    )
  );

  return changed_row;
end;
$$;

create trigger app_content_audit_events
after insert or update or delete on public.app_content
for each row execute function public.log_content_change();

create or replace function public.create_content_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.content_revisions (
    content_id,
    status,
    content,
    image_public_url,
    image_alt,
    created_by
  )
  values (
    new.id,
    new.status,
    new.content,
    new.image_public_url,
    new.image_alt,
    coalesce(new.updated_by, new.created_by, auth.uid())
  );

  return new;
end;
$$;

create trigger app_content_revision_history
after insert or update on public.app_content
for each row execute function public.create_content_revision();

alter table public.admin_profiles enable row level security;
alter table public.app_content enable row level security;
alter table public.content_revisions enable row level security;
alter table public.audit_events enable row level security;

create policy "Profiles are visible to authenticated users"
on public.admin_profiles
for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.admin_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Admins can manage roles"
on public.admin_profiles
for update
to authenticated
using (public.has_app_role(auth.uid(), array['admin']::app_role[]))
with check (public.has_app_role(auth.uid(), array['admin']::app_role[]));

create policy "Published content is public"
on public.app_content
for select
to anon
using (status = 'published');

create policy "Authenticated users can view content"
on public.app_content
for select
to authenticated
using (true);

create policy "Editors can create drafts"
on public.app_content
for insert
to authenticated
with check (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

create policy "Editors can update drafts"
on public.app_content
for update
to authenticated
using (
  status = 'draft'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
)
with check (
  status = 'draft'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
);

create policy "Publishers and admins can update published or archived content"
on public.app_content
for update
to authenticated
using (
  status in ('published', 'archived')
  and public.has_app_role(auth.uid(), array['publisher', 'admin']::app_role[])
)
with check (
  status in ('published', 'archived')
  and public.has_app_role(auth.uid(), array['publisher', 'admin']::app_role[])
);

create policy "Admins can delete content"
on public.app_content
for delete
to authenticated
using (public.has_app_role(auth.uid(), array['admin']::app_role[]));

create policy "Authenticated users can view revisions"
on public.content_revisions
for select
to authenticated
using (true);

create policy "Authenticated users can create revisions"
on public.content_revisions
for insert
to authenticated
with check (public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[]));

create policy "Admins can delete revisions"
on public.content_revisions
for delete
to authenticated
using (public.has_app_role(auth.uid(), array['admin']::app_role[]));

create policy "Authenticated users can view audit events"
on public.audit_events
for select
to authenticated
using (true);

insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

create policy "Public can read app assets"
on storage.objects
for select
to anon
using (bucket_id = 'app-assets');

create policy "Editors can upload app assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'app-assets'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
);

create policy "Editors can update app assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'app-assets'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
)
with check (
  bucket_id = 'app-assets'
  and public.has_app_role(auth.uid(), array['editor', 'publisher', 'admin']::app_role[])
);

create policy "Admins can delete app assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'app-assets'
  and public.has_app_role(auth.uid(), array['admin']::app_role[])
);

insert into public.app_content (section, slug, title, status, content, sort_order, published_at, created_at, updated_at)
values
(
  'home',
  'home',
  'Welcome home',
  'published',
  '{
    "welcomeTitle": "Welcome to Abundant Life",
    "welcomeBody": "Find service times, watch messages, connect, give, and stay up to date with what’s happening at our church family.",
    "locationLabel": "Cedar Grove, TN",
    "ctaLabel": "Plan a visit",
    "ctaUrl": "/PlanVisit",
    "serviceTimes": ["Sunday worship: 10:00 AM", "Sunday school: 9:00 AM"],
    "address": "Cedar Grove, TN",
    "phone": "",
    "email": ""
  }'::jsonb,
  0,
  now(),
  now(),
  now()
),
(
  'links',
  'links',
  'App links',
  'published',
  '{
    "givingUrl": "",
    "youtubeChannelUrl": "",
    "facebookUrl": "",
    "instagramUrl": "",
    "planningCenterUrl": "",
    "ccbLoginUrl": "",
    "prayerUrl": ""
  }'::jsonb,
  0,
  now(),
  now(),
  now()
),
(
  'onboarding',
  'onboarding',
  'Welcome to Abundant Life',
  'published',
  '{
    "welcomeTitle": "Welcome to Abundant Life",
    "welcomeBody": "Find service times, watch messages, connect, give, and stay up to date with what’s happening at our church family.",
    "location": "Cedar Grove, TN",
    "roleOptions": ["I’m visiting", "I attend ALFWC", "I serve or lead", "Skip for now"],
    "interests": ["Sermons", "Events", "Prayer", "Giving", "Kids", "Youth", "Small groups"],
    "notificationNotice": "This prototype includes preference settings but does not trigger the OS notification permission prompt yet. Real push notifications can be added in a future phase."
  }'::jsonb,
  0,
  now(),
  now(),
  now()
),
(
  'quick_action',
  'quick_actions',
  'Quick actions',
  'published',
  '{
    "items": [
      {"label": "Plan a visit", "icon": "map-marker-alt", "destination": "/PlanVisit", "enabled": true},
      {"label": "Prayer request", "icon": "pray", "destination": "/PrayerRequest", "enabled": true},
      {"label": "Connect card", "icon": "id-card", "destination": "/ConnectCard", "enabled": true},
      {"label": "Give", "icon": "hand-holding-heart", "destination": "/Give", "enabled": true}
    ]
  }'::jsonb,
  0,
  now(),
  now(),
  now()
)
on conflict (section, slug) do nothing;
