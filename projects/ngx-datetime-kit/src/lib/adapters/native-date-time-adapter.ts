import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { NgxDateTimeAdapter } from './date-time-adapter';

/**
 * Default implementation of NgxDateTimeAdapter backed by native JS Date objects.
 *
 * Format token mapping (subset of Unicode CLDR):
 *   yyyy → 4-digit year     MM → 2-digit month (01-12)
 *   dd   → 2-digit day      HH → 2-digit hours (00-23)
 *   mm   → 2-digit minutes  ss → 2-digit seconds
 *   M    → month (1-12)     d  → day (1-31)
 *
 * Design decision: We deliberately avoid Intl.DateTimeFormat for
 * formatting so format strings remain predictable regardless of locale.
 * Locale is only used for weekday/month name generation via Intl.
 */
@Injectable()
export class NgxNativeDateTimeAdapter extends NgxDateTimeAdapter<Date> {
  private locale: string = inject(LOCALE_ID, { optional: true }) ?? 'en-US';

  // ── Introspection ─────────────────────────────────────────────────────────

  override getYear(date: Date): number { return date.getFullYear(); }
  override getMonth(date: Date): number { return date.getMonth(); }
  override getDate(date: Date): number { return date.getDate(); }
  override getDayOfWeek(date: Date): number { return date.getDay(); }
  override getHours(date: Date): number { return date.getHours(); }
  override getMinutes(date: Date): number { return date.getMinutes(); }
  override getSeconds(date: Date): number { return date.getSeconds(); }

  // ── Construction ──────────────────────────────────────────────────────────

  override createDate(year: number, month: number, day: number): Date {
    return new Date(year, month, day, 0, 0, 0, 0);
  }

  override createDateTime(
    year: number, month: number, day: number,
    hours: number, minutes: number, seconds: number,
  ): Date {
    return new Date(year, month, day, hours, minutes, seconds, 0);
  }

  override today(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  }

  override now(): Date { return new Date(); }

  override getNumDaysInMonth(year: number, month: number): number {
    // Day 0 of next month = last day of this month
    return new Date(year, month + 1, 0).getDate();
  }

  override setTime(date: Date, hours: number, minutes: number, seconds: number): Date {
    const d = new Date(date);
    d.setHours(hours, minutes, seconds, 0);
    return d;
  }

  override startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  override endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0);
  }

  // ── Arithmetic ────────────────────────────────────────────────────────────

  override addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  }

  override addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    const targetMonth = d.getMonth() + months;
    d.setDate(1); // Prevent day overflow when moving to shorter months
    d.setMonth(targetMonth);
    return d;
  }

  override addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  override addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 3_600_000);
  }

  override addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60_000);
  }

  override addSeconds(date: Date, seconds: number): Date {
    return new Date(date.getTime() + seconds * 1_000);
  }

  // ── Comparison ────────────────────────────────────────────────────────────

  override compare(a: Date, b: Date): number {
    return a.getTime() - b.getTime();
  }

  override compareDateOnly(a: Date, b: Date): number {
    return this.startOfDay(a).getTime() - this.startOfDay(b).getTime();
  }

  override diffInMs(a: Date, b: Date): number {
    return Math.abs(a.getTime() - b.getTime());
  }

  // ── Parsing / Formatting ──────────────────────────────────────────────────

  /**
   * Parses a string using a two-pass tokenizer.
   * Pass 1: replace format tokens with control-char placeholders (safe from re-replacement).
   * Pass 2: replace placeholders with named capture groups.
   * Supports: yyyy, MM, dd, HH, mm, ss (and their single-char unpadded variants M,d,H,m,s).
   */
  override parse(value: string, format: string): Date | null {
    if (!value || !value.trim()) return null;

    // Control-char placeholders that cannot appear in any format string
    const PH = { yyyy: '\x01', MM: '\x02', dd: '\x03', HH: '\x04', mm: '\x05', ss: '\x06' };

    // Escape regex special chars in the format string (but NOT our placeholders)
    let regexStr = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace two-char tokens first (order matters: MM before M, dd before d, etc.)
    regexStr = regexStr
      .replace(/yyyy/g, PH.yyyy)
      .replace(/MM/g,   PH.MM)
      .replace(/dd/g,   PH.dd)
      .replace(/HH/g,   PH.HH)
      .replace(/mm/g,   PH.mm)
      .replace(/ss/g,   PH.ss);

    // Replace remaining single-char tokens (safe now — control chars have no letters)
    regexStr = regexStr
      .replace(/M/g, PH.MM)
      .replace(/d/g, PH.dd)
      .replace(/H/g, PH.HH)
      .replace(/m/g, PH.mm)
      .replace(/s/g, PH.ss);

    // Replace placeholders with named capture groups (first occurrence gets the name)
    const used = new Set<string>();
    const cap = (name: string, pat: string) =>
      used.has(name) ? `(?:${pat})` : (used.add(name), `(?<${name}>${pat})`);

    const phRegex = new RegExp(`[${Object.values(PH).join('')}]`, 'g');
    regexStr = regexStr.replace(phRegex, (ph) => {
      switch (ph) {
        case PH.yyyy: return cap('yyyy', '\\d{4}');
        case PH.MM:   return cap('MM',   '\\d{1,2}');
        case PH.dd:   return cap('dd',   '\\d{1,2}');
        case PH.HH:   return cap('HH',   '\\d{1,2}');
        case PH.mm:   return cap('mm',   '\\d{1,2}');
        case PH.ss:   return cap('ss',   '\\d{1,2}');
        default:      return ph;
      }
    });

    let match: RegExpExecArray | null;
    try {
      match = new RegExp(`^${regexStr}$`).exec(value.trim());
    } catch {
      return null;
    }
    if (!match?.groups) return null;

    const g = match.groups;
    const year    = parseInt(g['yyyy'] ?? new Date().getFullYear().toString(), 10);
    const month   = parseInt(g['MM']   ?? '1',  10) - 1;
    const day     = parseInt(g['dd']   ?? '1',  10);
    const hours   = parseInt(g['HH']   ?? '0',  10);
    const minutes = parseInt(g['mm']   ?? '0',  10);
    const seconds = parseInt(g['ss']   ?? '0',  10);

    const date = new Date(year, month, day, hours, minutes, seconds, 0);
    return this.isValid(date) ? date : null;
  }

  override format(date: Date, format: string): string {
    if (!this.isValid(date)) return '';
    const pad2 = (n: number) => String(n).padStart(2, '0');

    return format
      .replace('yyyy', String(date.getFullYear()))
      .replace('MM', pad2(date.getMonth() + 1))
      .replace('dd', pad2(date.getDate()))
      .replace('HH', pad2(date.getHours()))
      .replace('mm', pad2(date.getMinutes()))
      .replace('ss', pad2(date.getSeconds()))
      .replace('M', String(date.getMonth() + 1))
      .replace('d', String(date.getDate()))
      .replace('H', String(date.getHours()))
      .replace('m', String(date.getMinutes()))
      .replace('s', String(date.getSeconds()));
  }

  // ── Validation ────────────────────────────────────────────────────────────

  override isValid(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  override isDateInstance(obj: unknown): obj is Date {
    return obj instanceof Date;
  }

  // ── Locale helpers ────────────────────────────────────────────────────────

  override setLocale(locale: string): void {
    this.locale = locale;
  }

  override getWeekdayNames(style: 'long' | 'short' | 'narrow', firstDayOfWeek: number): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { weekday: style });
    // Jan 5 2025 is a Sunday (day 0), so we offset from there
    const names: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayIndex = (i + firstDayOfWeek) % 7;
      // Jan 5 = Sun (0), Jan 6 = Mon (1), ...
      const date = new Date(2025, 0, 5 + dayIndex);
      names.push(formatter.format(date));
    }
    return names;
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    const formatter = new Intl.DateTimeFormat(this.locale, { month: style });
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2025, i, 1)));
  }

  override getFirstDayOfWeek(): number {
    // Use Intl.Locale if available (modern browsers), fallback to Monday (1)
    try {
      const locale = new Intl.Locale(this.locale) as Intl.Locale & { weekInfo?: { firstDay: number } };
      const firstDay = locale.weekInfo?.firstDay ?? 1;
      // Intl returns 7 for Sunday in some locales; normalize to 0
      return firstDay === 7 ? 0 : firstDay;
    } catch {
      return 1; // Default to Monday
    }
  }
}

