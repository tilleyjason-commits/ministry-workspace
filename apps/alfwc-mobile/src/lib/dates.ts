import type { EventItem } from './api';

function toGoogleCalendarDate(value: string): string {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function formatTimeRange(startsAt: string, endsAt?: string): string {
  const start = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startsAt));

  if (!endsAt) {
    return start;
  }

  const end = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(endsAt));

  return `${start}–${end}`;
}

export function dateChipParts(value: string): { month: string; day: string } {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
    day: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date),
  };
}

export function googleCalendarUrl(event: EventItem): string {
  const start = toGoogleCalendarDate(event.startsAt);
  const end = toGoogleCalendarDate(event.endsAt ?? event.startsAt);

  return `https://calendar.google.com/calendar/render?${new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: `${event.description ?? ''}\n\nRegistration: ${event.registrationUrl ?? 'Not configured yet.'}`,
    location: [event.locationName, event.address].filter(Boolean).join(', '),
  }).toString()}`;
}

export function shareMessage(title: string, url?: string, body?: string): string {
  return [title, body, url].filter(Boolean).join('\n\n');
}