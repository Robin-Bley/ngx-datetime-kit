import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DateRange, DateTimeRange } from '../models';
import { NgxDateTimeAdapter } from '../adapters/date-time-adapter';

/**
 * Core validation logic shared by both Reactive Forms validators and Signal Forms validators.
 * Keep all business rules here — the form-specific wrappers are thin adapters.
 */
export function validateDateRangeCore<D>(
  range: DateRange<D> | DateTimeRange<D> | null | undefined,
  adapter: NgxDateTimeAdapter<D>,
  minDate?: D | null,
  maxDate?: D | null,
): ValidationErrors | null {
  if (!range) return null;

  const errors: ValidationErrors = {};

  if (range.start !== null && !adapter.isValid(range.start as D)) {
    errors['ngxInvalidStart'] = { value: range.start };
  }
  if (range.end !== null && !adapter.isValid(range.end as D)) {
    errors['ngxInvalidEnd'] = { value: range.end };
  }

  if (range.start !== null && range.end !== null &&
      adapter.isValid(range.start as D) && adapter.isValid(range.end as D)) {
    if (adapter.compare(range.start as D, range.end as D) > 0) {
      errors['ngxEndBeforeStart'] = {
        start: range.start,
        end: range.end,
      };
    }
  }

  if (minDate && range.start !== null && adapter.isValid(range.start as D)) {
    if (adapter.compare(range.start as D, minDate) < 0) {
      errors['ngxStartBelowMin'] = { min: minDate, actual: range.start };
    }
  }

  if (maxDate && range.end !== null && adapter.isValid(range.end as D)) {
    if (adapter.compare(range.end as D, maxDate) > 0) {
      errors['ngxEndAboveMax'] = { max: maxDate, actual: range.end };
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Reactive Forms validator factory for DateRange controls.
 *
 * Usage:
 * ```ts
 * new FormControl(null, ngxDateRangeValidator(adapter))
 * ```
 */
export function ngxDateRangeValidator<D>(
  adapter: NgxDateTimeAdapter<D>,
  minDate?: D | null,
  maxDate?: D | null,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return validateDateRangeCore<D>(control.value, adapter, minDate, maxDate);
  };
}

/**
 * Convenience alias — validates that end is after start.
 * Can be used on a FormGroup with `start` and `end` controls.
 */
export function endAfterStartValidator<D>(adapter: NgxDateTimeAdapter<D>): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('start')?.value as D | null;
    const end = group.get('end')?.value as D | null;
    if (!start || !end) return null;
    if (!adapter.isValid(start) || !adapter.isValid(end)) return null;
    if (adapter.compare(start, end) > 0) {
      return { ngxEndBeforeStart: { start, end } };
    }
    return null;
  };
}

/**
 * Reactive Forms min-date validator for single date/datetime controls.
 */
export function ngxMinDateValidator<D>(
  adapter: NgxDateTimeAdapter<D>,
  minDate: D,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as D | null;
    if (!value || !adapter.isValid(value)) return null;
    if (adapter.compare(value, minDate) < 0) {
      return { ngxMinDate: { min: minDate, actual: value } };
    }
    return null;
  };
}

/**
 * Reactive Forms max-date validator for single date/datetime controls.
 */
export function ngxMaxDateValidator<D>(
  adapter: NgxDateTimeAdapter<D>,
  maxDate: D,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as D | null;
    if (!value || !adapter.isValid(value)) return null;
    if (adapter.compare(value, maxDate) > 0) {
      return { ngxMaxDate: { max: maxDate, actual: value } };
    }
    return null;
  };
}

