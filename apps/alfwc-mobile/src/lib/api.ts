import * as seed from '../data/seed';
import type { NotificationPreferences, OnboardingState } from './storage';
import { createSupabaseClient, isBackendConfigured } from './supabase';

export type AppConfig = typeof seed.appConfig;

export type Sermon = {
  id: string;
  title: string;
  speaker: string;
  series?: string;
  scriptureReference?: string;
  description?: string;
  publishedAt: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  watchUrl: string;
  notesUrl?: string;
  discussionQuestions?: string[];
  prayerPrompt?: string;
  isLive?: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  locationName?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
  registrationUrl?: string;
  contactName?: string;
  contactEmail?: string;
  visibility: 'public' | 'members';
  featured?: boolean;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: string;
  destination: string;
};

export type MinistryHighlight = typeof seed.ministryHighlight;

type ContentRow = {
  slug: string;
  title?: string | null;
  content?: Record<string, unknown> | null;
  image_public_url?: string | null;
  published_at?: string | null;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseDiscussionQuestions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function mapSermon(row: ContentRow): Sermon | null {
  const content = asObject(row.content);
  if (!content) {
    return null;
  }

  const watchUrl =
    asString(content.watchUrl) ||
    (content.youtubeVideoId
      ? `https://www.youtube.com/watch?v=${asString(content.youtubeVideoId)}`
      : '');

  if (!watchUrl && !content.notesUrl) {
    return null;
  }

  return {
    id: asString(content.id) || asString(row.slug),
    title: asString(content.title ?? row.title, 'Untitled message'),
    speaker: asString(content.speaker, 'ALFWC'),
    series: asString(content.series) || undefined,
    scriptureReference: asString(content.scriptureReference) || undefined,
    description: asString(content.description) || undefined,
    publishedAt:
      asString(content.publishedAt) ||
      asString(row.published_at) ||
      new Date(0).toISOString(),
    durationSeconds:
      typeof content.durationSeconds === 'number' ? content.durationSeconds : undefined,
    thumbnailUrl: asString(content.thumbnailUrl) || asString(row.image_public_url) || undefined,
    youtubeVideoId: asString(content.youtubeVideoId) || undefined,
    watchUrl,
    notesUrl: asString(content.notesUrl) || undefined,
    discussionQuestions: parseDiscussionQuestions(content.discussionQuestions),
    prayerPrompt: asString(content.prayerPrompt) || undefined,
    isLive: asBoolean(content.isLive),
  };
}

const PRAYER_VISIBILITY_OPTIONS = [
  'elders_only',
  'prayer_team',
  'public_wall',
  'contact_me',
] as const;

type PrayerVisibility = (typeof PRAYER_VISIBILITY_OPTIONS)[number];

function isPublicEvent(event: EventItem): boolean {
  return event.visibility !== 'members';
}

function mapEvent(row: ContentRow): EventItem | null {
  const content = asObject(row.content);
  if (!content) {
    return null;
  }

  return {
    id: asString(content.id) || asString(row.slug),
    title: asString(content.title ?? row.title, 'Church event'),
    description: asString(content.description) || undefined,
    startsAt: asString(content.startsAt) || new Date(0).toISOString(),
    endsAt: asString(content.endsAt) || undefined,
    locationName: asString(content.locationName) || undefined,
    address: asString(content.address) || undefined,
    category: asString(content.category) || undefined,
    imageUrl: asString(content.imageUrl) || asString(row.image_public_url) || undefined,
    registrationUrl: asString(content.registrationUrl) || undefined,
    contactName: asString(content.contactName) || undefined,
    contactEmail: asString(content.contactEmail) || undefined,
    visibility: content.visibility === 'members' ? 'members' : 'public',
    featured: asBoolean(content.featured),
  };
}

async function fetchPublishedContent(
  section: string,
  slug: string,
): Promise<Record<string, unknown> | null> {
  if (!isBackendConfigured) {
    return null;
  }

  const { data, error } = await createSupabaseClient()
    .from('app_content')
    .select('*')
    .eq('section', section)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return null;
  }

  return asObject(data.content);
}

export async function fetchAppConfig(): Promise<AppConfig> {
  const [home, links] = await Promise.all([
    fetchPublishedContent('home', 'home'),
    fetchPublishedContent('links', 'links'),
  ]);

  const merged = {
    ...(home ?? {}),
    ...(links ?? {}),
    churchName: asString(home?.churchName, seed.appConfig.churchName),
    shortName: asString(home?.shortName, seed.appConfig.shortName),
    locationLabel: asString(home?.locationLabel, seed.appConfig.locationLabel),
    address: asString(home?.address, seed.appConfig.address),
    serviceTimes:
      Array.isArray(home?.serviceTimes) && home.serviceTimes.length
        ? (home.serviceTimes as string[])
        : seed.appConfig.serviceTimes,
    phone: asString(home?.phone) || asString(links?.phone) || seed.appConfig.phone,
    email: asString(home?.email) || asString(links?.email) || seed.appConfig.email,
    givingUrl: asString(links?.givingUrl) || undefined,
    youtubeChannelUrl: asString(links?.youtubeChannelUrl) || undefined,
    facebookUrl: asString(links?.facebookUrl) || undefined,
    instagramUrl: asString(links?.instagramUrl) || undefined,
    planningCenterUrl: asString(links?.planningCenterUrl) || undefined,
    ccbLoginUrl: asString(links?.ccbLoginUrl) || undefined,
    prayerUrl: asString(links?.prayerUrl) || undefined,
  };

  return { ...seed.appConfig, ...merged };
}

export async function fetchSermons(): Promise<Sermon[]> {
  if (!isBackendConfigured) {
    return seed.sermons;
  }

  const { data, error } = await createSupabaseClient()
    .from('app_content')
    .select('*')
    .eq('section', 'sermon')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('sort_order', { ascending: true, nullsFirst: true });

  if (error || !data?.length) {
    return seed.sermons;
  }

  const mapped = (data as ContentRow[]).map(mapSermon).filter(Boolean) as Sermon[];
  if (!mapped.length) {
    return seed.sermons;
  }

  return mapped.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function fetchEvents(): Promise<EventItem[]> {
  if (!isBackendConfigured) {
    return seed.events;
  }

  const { data, error } = await createSupabaseClient()
    .from('app_content')
    .select('*')
    .eq('section', 'event')
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('sort_order', { ascending: true, nullsFirst: true });

  if (error || !data?.length) {
    return seed.events;
  }

  const mapped = (data as ContentRow[])
    .map(mapEvent)
    .filter((event): event is EventItem => Boolean(event))
    .filter(isPublicEvent);
  if (!mapped.length) {
    return seed.events;
  }

  return mapped.sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export async function fetchQuickActions(): Promise<QuickAction[]> {
  const content = await fetchPublishedContent('quick_action', 'quick_actions');
  const items = Array.isArray(content?.items)
    ? (content.items as Array<Record<string, unknown>>).filter((item) => item.enabled !== false)
    : [];

  if (!items.length) {
    return seed.quickActions;
  }

  return items.map((item) => ({
    id: asString(item.destination),
    label: asString(item.label),
    icon: asString(item.icon),
    destination: asString(item.destination).replace(/^\//, ''),
  }));
}

export async function fetchMinistryHighlight(): Promise<MinistryHighlight> {
  const content = await fetchPublishedContent('home', 'home');
  const highlight = asObject(content?.ministryHighlight);
  if (!highlight) {
    return seed.ministryHighlight;
  }

  return {
    title: asString(highlight.title, seed.ministryHighlight.title),
    body: asString(highlight.body, seed.ministryHighlight.body),
    cta: asString(highlight.cta, seed.ministryHighlight.cta),
  };
}

export async function submitPrayerRequest(input: {
  name?: string;
  contact?: string;
  request: string;
  visibility: string;
}): Promise<{ ok: boolean; message: string }> {
  if (!isBackendConfigured) {
    return { ok: false, message: 'Supabase is not configured yet.' };
  }

  const visibility = PRAYER_VISIBILITY_OPTIONS.includes(input.visibility as PrayerVisibility)
    ? (input.visibility as PrayerVisibility)
    : null;

  if (!visibility) {
    return { ok: false, message: 'Please choose a sharing preference.' };
  }

  const { error } = await createSupabaseClient().from('prayer_requests').insert({
    name: input.name?.trim() || null,
    contact: input.contact?.trim() || null,
    request: input.request.trim(),
    visibility,
  });

  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: 'Prayer request submitted.' };
}

export async function submitConnectCard(input: {
  name: string;
  contact: string;
  message?: string;
  interests: string[];
}): Promise<{ ok: boolean; message: string }> {
  if (!isBackendConfigured) {
    return { ok: false, message: 'Supabase is not configured yet.' };
  }

  const { error } = await createSupabaseClient().from('connect_cards').insert({
    name: input.name.trim(),
    contact: input.contact.trim(),
    message: input.message?.trim() || null,
    interests: input.interests,
  });

  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: 'Connect card submitted.' };
}

export async function loadNotificationPreferencesForDevice(
  deviceId: string,
): Promise<NotificationPreferences | null> {
  if (!isBackendConfigured) {
    return null;
  }

  const { data, error } = await createSupabaseClient(deviceId)
    .from('user_notification_preferences')
    .select('*')
    .eq('device_id', deviceId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    allChurch: Boolean(data.all_church),
    sermonFollowUp: Boolean(data.sermon_follow_up),
    prayer: Boolean(data.prayer),
    events: Boolean(data.events),
    volunteerSchedule: Boolean(data.volunteer_schedule),
    youthKids: Boolean(data.youth_kids),
    menWomen: Boolean(data.men_women),
    emergencyWeather: Boolean(data.emergency_weather),
  };
}

export async function upsertNotificationPreferences(
  deviceId: string,
  prefs: NotificationPreferences,
): Promise<{ ok: boolean; message: string }> {
  if (!isBackendConfigured) {
    return { ok: false, message: 'Supabase is not configured yet.' };
  }

  const { error } = await createSupabaseClient(deviceId)
    .from('user_notification_preferences')
    .upsert(
      {
        device_id: deviceId,
        all_church: prefs.allChurch,
        sermon_follow_up: prefs.sermonFollowUp,
        prayer: prefs.prayer,
        events: prefs.events,
        volunteer_schedule: prefs.volunteerSchedule,
        youth_kids: prefs.youthKids,
        men_women: prefs.menWomen,
        emergency_weather: prefs.emergencyWeather,
      },
      { onConflict: 'device_id' },
    );

  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: 'Notification preferences saved.' };
}

export async function upsertOnboardingProfile(
  deviceId: string,
  profile: OnboardingState,
): Promise<{ ok: boolean; message: string }> {
  if (!isBackendConfigured) {
    return { ok: false, message: 'Supabase is not configured yet.' };
  }

  const { error } = await createSupabaseClient(deviceId)
    .from('onboarding_profiles')
    .upsert(
      {
        device_id: deviceId,
        role: profile.role,
        interests: profile.interests,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'device_id' },
    );

  return error
    ? { ok: false, message: error.message }
    : { ok: true, message: 'Onboarding saved.' };
}