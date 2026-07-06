import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { NgxNativeDateTimeAdapter } from '../adapters/native-date-time-adapter';
import { NGX_DATE_TIME_ADAPTER } from '../tokens/date-time-adapter.token';

describe('NgxNativeDateTimeAdapter', () => {
  let adapter: NgxNativeDateTimeAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'en-US' },
        { provide: NGX_DATE_TIME_ADAPTER, useClass: NgxNativeDateTimeAdapter },
      ],
    });
    adapter = TestBed.inject(NGX_DATE_TIME_ADAPTER) as NgxNativeDateTimeAdapter;
  });

  // ── Construction ──────────────────────────────────────────────────────────

  it('should create a valid date', () => {
    const d = adapter.createDate(2026, 6, 3); // July 3 2026
    expect(adapter.isValid(d)).toBeTrue();
    expect(adapter.getYear(d)).toBe(2026);
    expect(adapter.getMonth(d)).toBe(6);
    expect(adapter.getDate(d)).toBe(3);
  });

  it('should create today with time 00:00:00', () => {
    const t = adapter.today();
    expect(adapter.getHours(t)).toBe(0);
    expect(adapter.getMinutes(t)).toBe(0);
    expect(adapter.getSeconds(t)).toBe(0);
  });

  // ── Arithmetic ────────────────────────────────────────────────────────────

  it('should add days correctly', () => {
    const d = adapter.createDate(2026, 6, 1);
    const plus5 = adapter.addDays(d, 5);
    expect(adapter.getDate(plus5)).toBe(6);
  });

  it('should handle month overflow when adding days', () => {
    const d = adapter.createDate(2026, 6, 30); // July 30
    const next = adapter.addDays(d, 5);
    expect(adapter.getMonth(next)).toBe(7); // August
    expect(adapter.getDate(next)).toBe(4);
  });

  it('should add months without day overflow', () => {
    const d = adapter.createDate(2026, 0, 31); // Jan 31
    const next = adapter.addMonths(d, 1); // Feb
    expect(adapter.getMonth(next)).toBe(1);
    expect(adapter.isValid(next)).toBeTrue();
  });

  // ── Comparison ────────────────────────────────────────────────────────────

  it('should correctly compare two dates', () => {
    const a = adapter.createDate(2026, 0, 1);
    const b = adapter.createDate(2026, 6, 1);
    expect(adapter.compare(a, b)).toBeLessThan(0);
    expect(adapter.compare(b, a)).toBeGreaterThan(0);
    expect(adapter.compare(a, adapter.createDate(2026, 0, 1))).toBe(0);
  });

  it('should detect if a date is in a range', () => {
    const start = adapter.createDate(2026, 0, 1);
    const end = adapter.createDate(2026, 11, 31);
    const mid = adapter.createDate(2026, 6, 1);
    expect(adapter.isInRangeDateOnly(mid, start, end)).toBeTrue();
    expect(adapter.isInRangeDateOnly(adapter.createDate(2025, 0, 1), start, end)).toBeFalse();
  });

  // ── Formatting ────────────────────────────────────────────────────────────

  it('should format date as dd.MM.yyyy', () => {
    const d = adapter.createDate(2026, 6, 3); // July 3
    expect(adapter.format(d, 'dd.MM.yyyy')).toBe('03.07.2026');
  });

  it('should format date as yyyy-MM-dd', () => {
    const d = adapter.createDate(2026, 6, 3);
    expect(adapter.format(d, 'yyyy-MM-dd')).toBe('2026-07-03');
  });

  it('should format time as HH:mm:ss', () => {
    const d = adapter.createDateTime(2026, 6, 3, 12, 30, 5);
    expect(adapter.format(d, 'HH:mm:ss')).toBe('12:30:05');
  });

  // ── Parsing ───────────────────────────────────────────────────────────────

  it('should parse dd.MM.yyyy', () => {
    const d = adapter.parse('03.07.2026', 'dd.MM.yyyy');
    expect(d).not.toBeNull();
    expect(adapter.getYear(d!)).toBe(2026);
    expect(adapter.getMonth(d!)).toBe(6); // July = 6
    expect(adapter.getDate(d!)).toBe(3);
  });

  it('should parse yyyy-MM-dd HH:mm:ss', () => {
    const d = adapter.parse('2026-07-03 12:30:05', 'yyyy-MM-dd HH:mm:ss');
    expect(d).not.toBeNull();
    expect(adapter.getHours(d!)).toBe(12);
    expect(adapter.getMinutes(d!)).toBe(30);
    expect(adapter.getSeconds(d!)).toBe(5);
  });

  it('should return null for invalid format', () => {
    const d = adapter.parse('invalid-date', 'dd.MM.yyyy');
    expect(d).toBeNull();
  });

  // ── Month days ────────────────────────────────────────────────────────────

  it('should return correct number of days in month', () => {
    expect(adapter.getNumDaysInMonth(2026, 0)).toBe(31); // Jan
    expect(adapter.getNumDaysInMonth(2026, 1)).toBe(28); // Feb non-leap
    expect(adapter.getNumDaysInMonth(2024, 1)).toBe(29); // Feb leap
    expect(adapter.getNumDaysInMonth(2026, 6)).toBe(31); // July
  });

  // ── Duration ─────────────────────────────────────────────────────────────

  it('should calculate diff in ms', () => {
    const a = adapter.createDateTime(2026, 0, 1, 0, 0, 0);
    const b = adapter.createDateTime(2026, 0, 2, 0, 0, 0);
    expect(adapter.diffInMs(a, b)).toBe(86_400_000);
  });
});
