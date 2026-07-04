const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

export function isSafeExternalUrl(value?: string | null): boolean {
  if (!value?.trim()) return false;

  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:') return false;
    if (BLOCKED_HOSTS.has(parsed.hostname.toLowerCase())) return false;
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function safeExternalUrl(value?: string | null): string | null {
  return isSafeExternalUrl(value) ? value!.trim() : null;
}