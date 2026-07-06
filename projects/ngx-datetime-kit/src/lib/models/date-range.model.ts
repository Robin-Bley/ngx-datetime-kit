/**
 * A date-only range (no time component). The type parameter D is the date type
 * used by the active NgxDateTimeAdapter (e.g. native Date, Luxon DateTime, ...).
 */
export interface DateRange<D> {
  start: D | null;
  end: D | null;
}

/**
 * A date+time range. Internally both start and end carry full date+time info,
 * but they're separated here to make binding to components straightforward.
 */
export interface DateTimeRange<D> {
  start: D | null;
  end: D | null;
}

/**
 * Creates a new empty DateRange.
 */
export function createEmptyDateRange<D>(): DateRange<D> {
  return { start: null, end: null };
}

/**
 * Creates a new empty DateTimeRange.
 */
export function createEmptyDateTimeRange<D>(): DateTimeRange<D> {
  return { start: null, end: null };
}

/**
 * Returns true if both start and end of the range are non-null.
 */
export function isCompleteRange<D>(range: DateRange<D> | DateTimeRange<D>): boolean {
  return range.start !== null && range.end !== null;
}

