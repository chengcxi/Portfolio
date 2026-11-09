const STORAGE_KEY = 'xp-timezone';

const FALLBACK_ZONES = [
  'UTC',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Sao_Paulo',
  'Atlantic/Azores',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** The zone the visitor's computer is set to. */
export function systemTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Every IANA zone the browser knows about. */
export function listTimeZones(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (supported) {
      const zones = supported('timeZone');
      if (zones.length) return zones.includes('UTC') ? zones : ['UTC', ...zones];
    }
  } catch {
    /* fall back to the short list */
  }
  return FALLBACK_ZONES;
}

export function loadTimeZone(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && isValidTimeZone(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return systemTimeZone();
}

export function saveTimeZone(tz: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, tz);
  } catch {
    /* ignore */
  }
}

/** UTC offset of `tz` at `date`, in minutes (includes daylight saving). */
export function offsetMinutes(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
  const truncated = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((asUtc - truncated) / 60000);
}

export function gmtLabel(date: Date, tz: string): string {
  const minutes = offsetMinutes(date, tz);
  const sign = minutes < 0 ? '-' : '+';
  const abs = Math.abs(minutes);
  return `GMT${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

export function formatClock(date: Date, tz: string, seconds = false): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
  }).format(date);
}

export function formatLongDate(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function zoneCity(tz: string): string {
  return tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
}
