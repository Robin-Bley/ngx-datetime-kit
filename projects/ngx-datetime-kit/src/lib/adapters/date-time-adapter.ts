/**
 * Abstract date-time adapter following Angular Material's DateAdapter pattern,
 * extended to cover both date AND time operations.
 *
 * Consumers can provide their own adapter (e.g. for Luxon or date-fns) via DI:
 *
 * ```ts
 * providers: [
 *   { provide: NGX_DATE_TIME_ADAPTER, useClass: MyLuxonDateTimeAdapter }
 * ]
 * ```
 *
 * See docs/adapter.md for a complete guide on writing a custom adapter.
 */
export abstract class NgxDateTimeAdapter<D> {
  // ── Introspection ────────────────────────────────────────────────────────────

  /** Returns the year as a number. */
  abstract getYear(date: D): number;
  /** Returns the month (0-based, Jan = 0). */
  abstract getMonth(date: D): number;
  /** Returns the day of the month (1-based). */
  abstract getDate(date: D): number;
  /** Returns the day of the week (0 = Sun, 1 = Mon … 6 = Sat). */
  abstract getDayOfWeek(date: D): number;
  /** Returns the hours component (0–23). */
  abstract getHours(date: D): number;
  /** Returns the minutes component (0–59). */
  abstract getMinutes(date: D): number;
  /** Returns the seconds component (0–59). */
  abstract getSeconds(date: D): number;

  // ── Construction ─────────────────────────────────────────────────────────────

  /** Creates a date with the given year, month (0-based) and day; time is midnight. */
  abstract createDate(year: number, month: number, day: number): D;
  /** Creates a full date-time value. */
  abstract createDateTime(
    year: number, month: number, day: number,
    hours: number, minutes: number, seconds: number,
  ): D;
  /** Returns a new instance representing "right now". */
  abstract today(): D;
  /** Returns a new instance representing "right now" (with time). */
  abstract now(): D;
  /** Returns the number of days in the given month/year. */
  abstract getNumDaysInMonth(year: number, month: number): number;
  /** Returns a clone of the date with the time portion set to the given values. */
  abstract setTime(date: D, hours: number, minutes: number, seconds: number): D;
  /** Clones the date, stripping the time to midnight. */
  abstract startOfDay(date: D): D;
  /** Clones the date, setting time to 23:59:59. */
  abstract endOfDay(date: D): D;

  // ── Arithmetic ───────────────────────────────────────────────────────────────

  abstract addYears(date: D, years: number): D;
  abstract addMonths(date: D, months: number): D;
  abstract addDays(date: D, days: number): D;
  abstract addHours(date: D, hours: number): D;
  abstract addMinutes(date: D, minutes: number): D;
  abstract addSeconds(date: D, seconds: number): D;

  // ── Comparison ───────────────────────────────────────────────────────────────

  /**
   * Returns negative if a < b, 0 if same moment, positive if a > b.
   * Compares both date and time.
   */
  abstract compare(a: D, b: D): number;

  /** Same as compare but ignores the time component. */
  abstract compareDateOnly(a: D, b: D): number;

  /** Returns true if a and b represent the same calendar day. */
  isSameDay(a: D, b: D): boolean {
    return this.compareDateOnly(a, b) === 0;
  }

  /** Returns true if a comes strictly before b (date+time). */
  isBefore(a: D, b: D): boolean {
    return this.compare(a, b) < 0;
  }

  /** Returns true if a comes strictly after b (date+time). */
  isAfter(a: D, b: D): boolean {
    return this.compare(a, b) > 0;
  }

  /** Returns true if date is within [start, end] (inclusive, date+time). */
  isInRange(date: D, start: D, end: D): boolean {
    return this.compare(date, start) >= 0 && this.compare(date, end) <= 0;
  }

  /** Returns true if date is within [start, end] ignoring time. */
  isInRangeDateOnly(date: D, start: D, end: D): boolean {
    return this.compareDateOnly(date, start) >= 0 && this.compareDateOnly(date, end) <= 0;
  }

  // ── Duration ─────────────────────────────────────────────────────────────────

  /**
   * Returns the total number of milliseconds between a and b.
   * The result is always non-negative (abs value).
   */
  abstract diffInMs(a: D, b: D): number;

  // ── Parsing / Formatting ──────────────────────────────────────────────────────

  /**
   * Parses a string into a D, using the given display format.
   * Returns null if the string cannot be parsed.
   *
   * Decision: adapters receive the format string so they can delegate
   * format-aware parsing to their underlying library (e.g. Luxon).
   */
  abstract parse(value: string, format: string): D | null;

  /**
   * Formats a D to a human-readable string using the given display format.
   * Format tokens follow Unicode CLDR / date-fns conventions:
   *   yyyy, MM, dd, HH, mm, ss
   */
  abstract format(date: D, format: string): string;

  // ── Validation ────────────────────────────────────────────────────────────────

  /** Returns true if the value represents a valid date/time. */
  abstract isValid(date: D): boolean;

  /** Returns true if the value is a recognised date type for this adapter. */
  abstract isDateInstance(obj: unknown): obj is D;

  // ── Locale helpers ────────────────────────────────────────────────────────────

  /**
   * Sets the locale used for formatting/introspection.
   * Called automatically when LOCALE_ID changes.
   */
  abstract setLocale(locale: string): void;

  /** Returns an array of 7 narrow weekday names starting at `firstDayOfWeek`. */
  abstract getWeekdayNames(style: 'long' | 'short' | 'narrow', firstDayOfWeek: number): string[];

  /** Returns an array of 12 month names. */
  abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];

  /** Returns the index of the first day of the week (0=Sun, 1=Mon). */
  abstract getFirstDayOfWeek(): number;
}

