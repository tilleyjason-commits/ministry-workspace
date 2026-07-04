# ALFWC Supabase setup

Shared database for the church mobile app (`apps/alfwc-mobile`) and admin CMS (`alfwc-admin`).

## 1. Create project

Create a Supabase project at [supabase.com](https://supabase.com).

## 2. Run migrations (in order)

In the SQL editor, run:

1. Copy and run `alfwc-admin/supabase/migrations/20260620_alfwc_admin_schema.sql` (or the same file from this repo once synced).
2. Run `supabase/migrations/20260704_alfwc_mobile_tables.sql` from this directory.
3. Run `supabase/migrations/20260705_security_phase1.sql` (blocks role escalation + secures device tables).

## 3. Configure environment variables

### Mobile app (`apps/alfwc-mobile/.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_WEB_BASE_PATH=/ministry-workspace/
```

### Admin (`alfwc-admin/.env.local`)

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. GitHub Actions secrets

Add these repository secrets for CI deploys:

| Secret | Used by |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ministry-workspace mobile web build |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ministry-workspace mobile web build |
| `VITE_SUPABASE_URL` | alfwc-admin build |
| `VITE_SUPABASE_ANON_KEY` | alfwc-admin build |

## 5. First admin user

1. Enable Email (and optional Google) auth in Supabase.
2. Sign in to the admin app once.
3. Run `alfwc-admin/supabase/seed-initial-admin.sql` to promote that user to `admin`.

## Tables

| Table | Purpose |
|---|---|
| `app_content` | Published CMS content (home, sermons, events, etc.) |
| `prayer_requests` | Prayer form submissions from the app |
| `connect_cards` | Visitor connect form submissions |
| `user_notification_preferences` | Per-device notification toggles |
| `onboarding_profiles` | Per-device onboarding role + interests |