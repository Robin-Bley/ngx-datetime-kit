import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgxNativeDateTimeAdapter } from '../adapters/native-date-time-adapter';
import { NGX_DATE_TIME_ADAPTER } from '../tokens/date-time-adapter.token';
import {
  ngxDateRangeValidator,
  endAfterStartValidator,
  ngxMinDateValidator,
  ngxMaxDateValidator,
} from './date-range.validator';
import type { DateTimeRange } from '../models/date-range.model';

describe('Reactive Forms Validators', () => {
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

  describe('ngxDateRangeValidator', () => {
    it('should return null for a null value', () => {
      const ctrl = new FormControl(null, ngxDateRangeValidator(adapter));
      expect(ctrl.errors).toBeNull();
    });

    it('should return null for a valid range', () => {
      const range: DateTimeRange<Date> = {
        start: new Date(2026, 0, 1),
        end: new Date(2026, 0, 31),
      };
      const ctrl = new FormControl(range, ngxDateRangeValidator(adapter));
      expect(ctrl.errors).toBeNull();
    });

    it('should return ngxEndBeforeStart error when end < start', () => {
      const range: DateTimeRange<Date> = {
        start: new Date(2026, 6, 10),
        end: new Date(2026, 6, 1),
      };
      const ctrl = new FormControl(range, ngxDateRangeValidator(adapter));
      expect(ctrl.errors?.['ngxEndBeforeStart']).toBeTruthy();
    });

    it('should return ngxStartBelowMin when start < minDate', () => {
      const minDate = new Date(2026, 0, 1);
      const range: DateTimeRange<Date> = {
        start: new Date(2025, 11, 31),
        end: new Date(2026, 0, 10),
      };
      const ctrl = new FormControl(range, ngxDateRangeValidator(adapter, minDate));
      expect(ctrl.errors?.['ngxStartBelowMin']).toBeTruthy();
    });

    it('should return ngxEndAboveMax when end > maxDate', () => {
      const maxDate = new Date(2026, 11, 31);
      const range: DateTimeRange<Date> = {
        start: new Date(2026, 0, 1),
        end: new Date(2027, 0, 1),
      };
      const ctrl = new FormControl(range, ngxDateRangeValidator(adapter, undefined, maxDate));
      expect(ctrl.errors?.['ngxEndAboveMax']).toBeTruthy();
    });
  });

  describe('endAfterStartValidator', () => {
    it('should return null when end > start', () => {
      const group = new FormGroup({
        start: new FormControl(new Date(2026, 0, 1)),
        end: new FormControl(new Date(2026, 6, 1)),
      }, endAfterStartValidator(adapter));
      expect(group.errors).toBeNull();
    });

    it('should return error when end < start', () => {
      const group = new FormGroup({
        start: new FormControl(new Date(2026, 6, 1)),
        end: new FormControl(new Date(2026, 0, 1)),
      }, endAfterStartValidator(adapter));
      expect(group.errors?.['ngxEndBeforeStart']).toBeTruthy();
    });
  });

  describe('ngxMinDateValidator', () => {
    it('should pass when date >= minDate', () => {
      const min = new Date(2026, 0, 1);
      const ctrl = new FormControl(new Date(2026, 6, 1), ngxMinDateValidator(adapter, min));
      expect(ctrl.errors).toBeNull();
    });

    it('should fail when date < minDate', () => {
      const min = new Date(2026, 0, 1);
      const ctrl = new FormControl(new Date(2025, 11, 31), ngxMinDateValidator(adapter, min));
      expect(ctrl.errors?.['ngxMinDate']).toBeTruthy();
    });
  });

  describe('ngxMaxDateValidator', () => {
    it('should pass when date <= maxDate', () => {
      const max = new Date(2026, 11, 31);
      const ctrl = new FormControl(new Date(2026, 6, 1), ngxMaxDateValidator(adapter, max));
      expect(ctrl.errors).toBeNull();
    });

    it('should fail when date > maxDate', () => {
      const max = new Date(2026, 11, 31);
      const ctrl = new FormControl(new Date(2027, 0, 1), ngxMaxDateValidator(adapter, max));
      expect(ctrl.errors?.['ngxMaxDate']).toBeTruthy();
    });
  });
});
