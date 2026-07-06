import { JsonPipe } from '@angular/common';
import { Component, inject, Injectable, signal } from '@angular/core';
import {
  DateTimeRange,
  NGX_DATE_TIME_ADAPTER,
  NgxDateTimeAdapter,
  NgxDateTimeRangePickerComponent,
} from 'ngx-datetime-kit';

@Injectable()
class LoggingDateTimeAdapter extends NgxDateTimeAdapter<Date> {
  private readonly base: NgxDateTimeAdapter<Date> = inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER, { skipSelf: true } as never);

  getYear(date: Date): number { return this.base.getYear(date); }
  getMonth(date: Date): number { return this.base.getMonth(date); }
  getDate(date: Date): number { return this.base.getDate(date); }
  getDayOfWeek(date: Date): number { return this.base.getDayOfWeek(date); }
  getHours(date: Date): number { return this.base.getHours(date); }
  getMinutes(date: Date): number { return this.base.getMinutes(date); }
  getSeconds(date: Date): number { return this.base.getSeconds(date); }
  createDate(year: number, month: number, day: number): Date { return this.base.createDate(year, month, day); }
  createDateTime(year: number, month: number, day: number, hours: number, minutes: number, seconds: number): Date { return this.base.createDateTime(year, month, day, hours, minutes, seconds); }
  today(): Date { return this.base.today(); }
  now(): Date { return this.base.now(); }
  getNumDaysInMonth(year: number, month: number): number { return this.base.getNumDaysInMonth(year, month); }
  setTime(date: Date, hours: number, minutes: number, seconds: number): Date { return this.base.setTime(date, hours, minutes, seconds); }
  startOfDay(date: Date): Date { return this.base.startOfDay(date); }
  endOfDay(date: Date): Date { return this.base.endOfDay(date); }
  addYears(date: Date, years: number): Date { return this.base.addYears(date, years); }
  addMonths(date: Date, months: number): Date { return this.base.addMonths(date, months); }
  addDays(date: Date, days: number): Date { return this.base.addDays(date, days); }
  addHours(date: Date, hours: number): Date { return this.base.addHours(date, hours); }
  addMinutes(date: Date, minutes: number): Date { return this.base.addMinutes(date, minutes); }
  addSeconds(date: Date, seconds: number): Date { return this.base.addSeconds(date, seconds); }
  compare(a: Date, b: Date): number { return this.base.compare(a, b); }
  compareDateOnly(a: Date, b: Date): number { return this.base.compareDateOnly(a, b); }
  diffInMs(a: Date, b: Date): number { return this.base.diffInMs(a, b); }
  isValid(date: Date): boolean { return this.base.isValid(date); }
  isDateInstance(obj: unknown): obj is Date { return this.base.isDateInstance(obj); }
  setLocale(locale: string): void { this.base.setLocale(locale); }
  getWeekdayNames(style: 'long' | 'short' | 'narrow', firstDayOfWeek: number): string[] { return this.base.getWeekdayNames(style, firstDayOfWeek); }
  getMonthNames(style: 'long' | 'short' | 'narrow'): string[] { return this.base.getMonthNames(style); }
  getFirstDayOfWeek(): number { return this.base.getFirstDayOfWeek(); }

  override parse(value: string, format: string): Date | null {
    console.log(`[LoggingAdapter] parse("${value}", "${format}")`);
    return this.base.parse(value, format);
  }

  override format(date: Date, format: string): string {
    const result: string = this.base.format(date, format);
    console.log(`[LoggingAdapter] format(${date.toISOString()}, "${format}") → "${result}"`);
    return result;
  }
}

@Component({
  selector: 'demo-custom-adapter',
  standalone: true,
  imports: [JsonPipe, NgxDateTimeRangePickerComponent],
  providers: [
    { provide: NGX_DATE_TIME_ADAPTER, useClass: LoggingDateTimeAdapter },
  ],
  templateUrl: './custom-adapter.component.html',
  styleUrl: './custom-adapter.component.scss',
})
export class CustomAdapterComponent {
  public readonly range = signal<DateTimeRange<Date> | null>(null);
}
