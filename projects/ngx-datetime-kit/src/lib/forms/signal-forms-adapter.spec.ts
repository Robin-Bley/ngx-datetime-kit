import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { NgxNativeDateTimeAdapter } from '../adapters/native-date-time-adapter';
import { NGX_DATE_TIME_ADAPTER } from '../tokens/date-time-adapter.token';
import {
  createSignalField,
  createDateTimeRangeSignalField,
  createDateRangeSignalField,
} from './signal-forms-adapter';
import type { DateTimeRange, DateRange } from '../models/date-range.model';

describe('Signal Forms Adapter', () => {
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

  describe('createSignalField', () => {
    it('should create a signal field with initial value', () => {
      const field = createSignalField<string>('hello');
      expect(field.value()).toBe('hello');
    });

    it('should be valid when no validator provided', () => {
      const field = createSignalField<string>('anything');
      expect(field.valid()).toBeTrue();
      expect(field.errors()).toBeNull();
    });

    it('should validate on value change', () => {
      const field = createSignalField<string>(
        '',
        (v) => v.length > 0 ? null : { required: true },
      );
      expect(field.errors()).toEqual({ required: true });
      field.value.set('hello');
      expect(field.errors()).toBeNull();
    });

    it('should track touched state', () => {
      const field = createSignalField<string>('');
      expect(field.touched()).toBeFalse();
      field.markAsTouched();
      expect(field.touched()).toBeTrue();
    });
  });

  describe('createDateTimeRangeSignalField', () => {
    it('should initialise as null with no errors', () => {
      const field = createDateTimeRangeSignalField(adapter);
      expect(field.value()).toBeNull();
      expect(field.errors()).toBeNull();
    });

    it('should report error when end is before start', () => {
      const range: DateTimeRange<Date> = {
        start: new Date(2026, 6, 10),
        end: new Date(2026, 6, 1),
      };
      const field = createDateTimeRangeSignalField(adapter, range);
      expect(field.errors()?.['ngxEndBeforeStart']).toBeTruthy();
      expect(field.valid()).toBeFalse();
    });

    it('should become valid when a correct range is set', () => {
      const field = createDateTimeRangeSignalField(adapter);
      field.value.set({ start: new Date(2026, 0, 1), end: new Date(2026, 6, 1) });
      expect(field.valid()).toBeTrue();
    });

    it('should enforce minDate', () => {
      const minDate = new Date(2026, 0, 1);
      const field = createDateTimeRangeSignalField(adapter, null, { minDate });
      field.value.set({ start: new Date(2025, 11, 31), end: new Date(2026, 0, 31) });
      expect(field.errors()?.['ngxStartBelowMin']).toBeTruthy();
    });
  });

  describe('createDateRangeSignalField', () => {
    it('should validate DateRange correctly', () => {
      const field = createDateRangeSignalField(adapter);
      field.value.set({ start: new Date(2026, 6, 10), end: new Date(2026, 6, 1) });
      expect(field.errors()?.['ngxEndBeforeStart']).toBeTruthy();
    });
  });
});
