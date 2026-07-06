/**
 * Represents an hour-minute-second time value (no date context).
 * Used internally by time-selector components.
 */
export interface TimeValue {
  hours: number;   // 0–23
  minutes: number; // 0–59
  seconds: number; // 0–59
}

/**
 * Creates a TimeValue, clamping each field to its valid range.
 */
export function createTimeValue(hours = 0, minutes = 0, seconds = 0): TimeValue {
  return {
    hours: Math.max(0, Math.min(23, Math.round(hours))),
    minutes: Math.max(0, Math.min(59, Math.round(minutes))),
    seconds: Math.max(0, Math.min(59, Math.round(seconds))),
  };
}

/**
 * Extracts a TimeValue from a native JS Date.
 */
export function timeValueFromDate(date: Date): TimeValue {
  return createTimeValue(date.getHours(), date.getMinutes(), date.getSeconds());
}

/**
 * Applies a TimeValue to a Date, returning a new Date.
 */
export function applyTimeToDate(date: Date, time: TimeValue): Date {
  const d = new Date(date);
  d.setHours(time.hours, time.minutes, time.seconds, 0);
  return d;
}

/**
 * Compares two TimeValues. Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareTimeValues(a: TimeValue, b: TimeValue): number {
  return a.hours !== b.hours
    ? a.hours - b.hours
    : a.minutes !== b.minutes
      ? a.minutes - b.minutes
      : a.seconds - b.seconds;
}

/**
 * Formats a TimeValue as HH:mm:ss or HH:mm depending on showSeconds.
 */
export function formatTimeValue(time: TimeValue, showSeconds = true): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const base = `${pad(time.hours)}:${pad(time.minutes)}`;
  return showSeconds ? `${base}:${pad(time.seconds)}` : base;
}

/**
 * Parses a time string (HH:mm or HH:mm:ss) to a TimeValue.
 * Returns null if the string is invalid.
 */
export function parseTimeValue(str: string): TimeValue | null {
  const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const s = match[3] ? parseInt(match[3], 10) : 0;
  if (h > 23 || m > 59 || s > 59) return null;
  return createTimeValue(h, m, s);
}

