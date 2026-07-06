# Custom DateTimeAdapter Guide

The adapter pattern allows ngx-datetime-kit to work with any date library.

## The Interface

```typescript
abstract class NgxDateTimeAdapter<D> {
  // Introspection
  abstract getYear(date: D): number;
  abstract getMonth(date: D): number;  // 0-based
  abstract getDate(date: D): number;
  abstract getHours(date: D): number;
  abstract getMinutes(date: D): number;
  abstract getSeconds(date: D): number;

  // Construction
  abstract createDate(year: number, month: number, day: number): D;
  abstract createDateTime(...): D;
  abstract today(): D;
  abstract now(): D;

  // Arithmetic
  abstract addDays(date: D, days: number): D;
  abstract addHours(date: D, hours: number): D;
  // ...

  // Comparison
  abstract compare(a: D, b: D): number;
  abstract compareDateOnly(a: D, b: D): number;

  // Parsing / Formatting
  abstract parse(value: string, format: string): D | null;
  abstract format(date: D, format: string): string;

  // Locale
  abstract setLocale(locale: string): void;
  abstract getWeekdayNames(...): string[];
  abstract getMonthNames(...): string[];
  abstract getFirstDayOfWeek(): number;
}
```

## Example: Luxon Adapter

```typescript
import { Injectable, LOCALE_ID, inject } from '@angular/core';
import { DateTime } from 'luxon';
import { NgxDateTimeAdapter } from 'ngx-datetime-kit';

@Injectable()
export class LuxonDateTimeAdapter extends NgxDateTimeAdapter<DateTime> {
  private locale = inject(LOCALE_ID);

  getYear(date: DateTime): number { return date.year; }
  getMonth(date: DateTime): number { return date.month - 1; } // 0-based!
  getDate(date: DateTime): number { return date.day; }
  getHours(date: DateTime): number { return date.hour; }
  getMinutes(date: DateTime): number { return date.minute; }
  getSeconds(date: DateTime): number { return date.second; }
  getDayOfWeek(date: DateTime): number { return date.weekday % 7; } // Sun=0

  createDate(y: number, m: number, d: number): DateTime {
    return DateTime.local(y, m + 1, d);
  }
  createDateTime(y: number, mo: number, d: number, h: number, mi: number, s: number): DateTime {
    return DateTime.local(y, mo + 1, d, h, mi, s);
  }
  today(): DateTime { return DateTime.local().startOf('day'); }
  now(): DateTime { return DateTime.local(); }

  addDays(date: DateTime, days: number): DateTime { return date.plus({ days }); }
  addHours(date: DateTime, hours: number): DateTime { return date.plus({ hours }); }
  // ... implement all other abstract methods

  compare(a: DateTime, b: DateTime): number { return a.toMillis() - b.toMillis(); }
  compareDateOnly(a: DateTime, b: DateTime): number {
    return a.startOf('day').toMillis() - b.startOf('day').toMillis();
  }

  parse(value: string, format: string): DateTime | null {
    // Map our format tokens to Luxon tokens
    const luxonFormat = format
      .replace('yyyy', 'yyyy').replace('MM', 'MM').replace('dd', 'dd')
      .replace('HH', 'HH').replace('mm', 'mm').replace('ss', 'ss');
    const result = DateTime.fromFormat(value, luxonFormat);
    return result.isValid ? result : null;
  }

  format(date: DateTime, format: string): string {
    const luxonFormat = format; // adjust token mapping as needed
    return date.toFormat(luxonFormat);
  }

  isValid(date: DateTime): boolean { return date.isValid; }
  isDateInstance(obj: unknown): obj is DateTime { return obj instanceof DateTime; }
  setLocale(locale: string): void { this.locale = locale; }
  getWeekdayNames(...): string[] { /* use Luxon Info */ }
  getMonthNames(...): string[] { /* use Luxon Info */ }
  getFirstDayOfWeek(): number { /* use locale info */ }
  getNumDaysInMonth(y: number, m: number): number {
    return DateTime.local(y, m + 1).daysInMonth!;
  }
  setTime(date: DateTime, h: number, m: number, s: number): DateTime {
    return date.set({ hour: h, minute: m, second: s });
  }
  startOfDay(date: DateTime): DateTime { return date.startOf('day'); }
  endOfDay(date: DateTime): DateTime { return date.endOf('day'); }
  addYears(date: DateTime, years: number): DateTime { return date.plus({ years }); }
  addMonths(date: DateTime, months: number): DateTime { return date.plus({ months }); }
  addMinutes(date: DateTime, minutes: number): DateTime { return date.plus({ minutes }); }
  addSeconds(date: DateTime, seconds: number): DateTime { return date.plus({ seconds }); }
  diffInMs(a: DateTime, b: DateTime): number { return Math.abs(a.toMillis() - b.toMillis()); }
}
```

## Registration

### Global (recommended)

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideNgxDatetimeKit({ adapter: LuxonDateTimeAdapter }),
  ],
});
```

### Per-Component (override for subtree)

```typescript
@Component({
  providers: [
    { provide: NGX_DATE_TIME_ADAPTER, useClass: LuxonDateTimeAdapter },
  ],
})
export class MyComponent {}
```

## date-fns Adapter

A `date-fns` adapter follows the same pattern. Key notes:
- date-fns is immutable by default — no cloning needed
- Use `parse()` from `date-fns` with the format tokens mapped to date-fns format strings
- `getDay()` in date-fns returns 0=Sun, same as native Date

