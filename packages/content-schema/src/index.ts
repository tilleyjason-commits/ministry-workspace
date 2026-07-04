export type ContentStatus = 'draft' | 'published' | 'archived';

export type ContentSection =
  | 'home'
  | 'sermon'
  | 'event'
  | 'quick_action'
  | 'links'
  | 'onboarding'
  | 'image_asset';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

export type HomeContent = {
  welcomeTitle?: string;
  welcomeBody?: string;
  locationLabel?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  serviceTimes?: string[];
  address?: string;
  phone?: string;
  email?: string;
  ministryHighlight?: MinistryHighlightContent;
};

export type MinistryHighlightContent = {
  title: string;
  body: string;
  cta?: string;
};

export type LinksContent = {
  givingUrl?: string;
  youtubeChannelUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  planningCenterUrl?: string;
  ccbLoginUrl?: string;
  prayerUrl?: string;
  phone?: string;
  email?: string;
};

export type SermonContent = {
  speaker?: string;
  series?: string;
  scriptureReference?: string;
  description?: string;
  watchUrl?: string;
  discussionQuestions?: string | string[];
  prayerPrompt?: string;
  publishedAt?: string;
};

export type EventContent = {
  category?: string;
  startsAt?: string;
  endsAt?: string;
  locationName?: string;
  address?: string;
  description?: string;
  registrationUrl?: string;
  contactName?: string;
  contactEmail?: string;
  featured?: boolean;
  visibility?: 'public' | 'members';
};

export type QuickActionItem = {
  label: string;
  icon: string;
  destination: string;
  enabled?: boolean;
};

export type QuickActionsContent = {
  items: QuickActionItem[];
};

export type OnboardingContent = {
  welcomeTitle?: string;
  welcomeBody?: string;
  location?: string;
  roleOptions?: string[];
  interests?: string[];
  notificationNotice?: string;
};

export function parseStringList(value: unknown): string[] {
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

export function parseDiscussionQuestions(value: unknown): string[] {
  return parseStringList(value);
}

export function serializeDiscussionQuestions(value: string | string[]): string {
  return Array.isArray(value) ? value.join('\n') : value;
}