const FALLBACK_TIME_ZONE = 'Asia/Tashkent';

export function resolveTimeZone(): string {
  const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return resolved.length > 0 ? resolved : FALLBACK_TIME_ZONE;
}
