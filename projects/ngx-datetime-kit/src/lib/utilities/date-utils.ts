import { NgxDateTimeAdapter } from '../adapters/date-time-adapter';

/**
 * Formats a duration (in milliseconds) as a human-readable string.
 * E.g. "65 days, 9 h, 31 min, 30 sec"
 */
export function formatDuration(ms: number, labels: {
  days: string; hours: string; minutes: string; seconds: string;
} = { days: 'd', hours: 'h', minutes: 'min', seconds: 'sec' }): string {
  const totalSeconds = Math.floor(ms / 1000);
  const secs = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mins = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${labels.days}`);
  if (hours > 0) parts.push(`${hours} ${labels.hours}`);
  if (mins > 0) parts.push(`${mins} ${labels.minutes}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} ${labels.seconds}`);
  return parts.join(', ');
}

/**
 * Returns an array of Date objects representing the calendar grid for a given
 * month/year, padded to full weeks based on firstDayOfWeek.
 *
 * @param year        Full year number
 * @param month       0-based month index
 * @param firstDayOfWeek  0=Sun, 1=Mon
 * @param adapter     Adapter used to create Date instances
 */
export function buildCalendarGrid<D>(
  year: number,
  month: number,
  firstDayOfWeek: number,
  adapter: NgxDateTimeAdapter<D>,
): Array<{ date: D; isCurrentMonth: boolean }> {
  const firstOfMonth = adapter.createDate(year, month, 1);
  const numDays = adapter.getNumDaysInMonth(year, month);
  const dayOfWeekFirst = adapter.getDayOfWeek(firstOfMonth);

  // How many days to prepend from the previous month
  let leadingDays = (dayOfWeekFirst - firstDayOfWeek + 7) % 7;

  const cells: Array<{ date: D; isCurrentMonth: boolean }> = [];

  // Leading days from the previous month
  for (let i = leadingDays; i > 0; i--) {
    cells.push({
      date: adapter.addDays(firstOfMonth, -i),
      isCurrentMonth: false,
    });
  }

  // Days of the current month
  for (let d = 1; d <= numDays; d++) {
    cells.push({
      date: adapter.createDate(year, month, d),
      isCurrentMonth: true,
    });
  }

  // Trailing days to complete the last row (always fill to 6 rows = 42 cells)
  const totalCells = 42;
  let trailingDay = 1;
  while (cells.length < totalCells) {
    const lastDate = cells[cells.length - 1].date;
    cells.push({
      date: adapter.addDays(lastDate, 1),
      isCurrentMonth: false,
    });
    trailingDay++;
  }

  return cells;
}

/**
 * Clamps a value within a [min, max] range using the adapter's compare method.
 * Returns the value if within range, min if below, max if above.
 */
export function clampDate<D>(
  value: D,
  min: D | null | undefined,
  max: D | null | undefined,
  adapter: NgxDateTimeAdapter<D>,
): D {
  if (min && adapter.compare(value, min) < 0) return min;
  if (max && adapter.compare(value, max) > 0) return max;
  return value;
}

/** Returns true if two optional dates represent the same calendar day. */
export function isSameDayOrNull<D>(
  a: D | null | undefined,
  b: D | null | undefined,
  adapter: NgxDateTimeAdapter<D>,
): boolean {
  if (!a || !b) return false;
  return adapter.isSameDay(a, b);
}

