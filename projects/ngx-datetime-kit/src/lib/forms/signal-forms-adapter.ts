/**
 * Signal Forms adapter for ngx-datetime-kit.
 *
 * ## Design rationale
 *
 * Angular's "Signal Forms" API (form()/field() with schema validators) is
 * evolving. Angular 22 ships with the `model()` primitive and experimental
 * signal-based form integrations. This adapter is intentionally isolated
 * so that when the Signal Forms API stabilises, only this file needs updating.
 *
 * ## Current strategy
 *
 * All picker components expose a `value` two-way signal via Angular's `model()`
 * primitive. This means they can be bound directly to a `signal<T>` without any
 * extra wrapper:
 *
 * ```ts
 * // In your component:
 * selectedRange = signal<DateTimeRange<Date> | null>(null);
 *
 * // In your template:
 * <ngx-date-time-range-picker [(value)]="selectedRange" />
 * ```
 *
 * ## Schema Validator integration (forward-compatible)
 *
 * The `toSignalValidator` helper below bridges the shared validation core
 * (validateDateRangeCore) to whatever Signal Forms schema validator shape
 * Angular ships. Update only this function when the API changes.
 */

import { signal, Signal, WritableSignal, computed } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { NgxDateTimeAdapter } from '../adapters/date-time-adapter';
import { DateRange, DateTimeRange } from '../models';
import { validateDateRangeCore } from '../validators/date-range.validator';

/**
 * Creates a signal that mirrors a WritableSignal<T> and validates it.
 * Use this as a lightweight replacement for FormControl in purely signal-based forms.
 *
 * @example
 * ```ts
 * const rangeField = createValidatedSignalField(
 *   null,
 *   (v) => validateDateRangeCore(v, adapter),
 * );
 *
 * // Bind in template:
 * <ngx-date-time-range-picker [(value)]="rangeField.value" />
 * @if (rangeField.errors()?.ngxEndBeforeStart) {
 *   <span>End must be after start</span>
 * }
 * ```
 */
export interface NgxSignalField<T> {
  /** The writable signal — bind directly to picker `[(value)]`. */
  value: WritableSignal<T>;
  /** Computed validation errors — null when valid. */
  errors: Signal<ValidationErrors | null>;
  /** Computed validity flag. */
  valid: Signal<boolean>;
  /** Marks the field as touched (sets a touched flag signal). */
  markAsTouched: () => void;
  /** Whether the field has been touched (interacted with). */
  touched: Signal<boolean>;
}

/**
 * Factory function for a validated signal field.
 *
 * @param initialValue  Initial value for the signal
 * @param validate      Validation function (use the core validators from validators/)
 */
export function createSignalField<T>(
  initialValue: T,
  validate?: (value: T) => ValidationErrors | null,
): NgxSignalField<T> {
  const value = signal<T>(initialValue);
  const touchedSignal = signal(false);
  const errors = computed<ValidationErrors | null>(() =>
    validate ? validate(value()) : null,
  );
  const valid = computed(() => errors() === null);

  return {
    value,
    errors,
    valid,
    touched: touchedSignal.asReadonly(),
    markAsTouched: () => touchedSignal.set(true),
  };
}

/**
 * Creates a pre-configured signal field for DateTimeRange with built-in validation.
 *
 * @example
 * ```ts
 * const range = createDateTimeRangeSignalField(adapter);
 * // Then in template: <ngx-date-time-range-picker [(value)]="range.value" />
 * ```
 */
export function createDateTimeRangeSignalField<D>(
  adapter: NgxDateTimeAdapter<D>,
  initialValue: DateTimeRange<D> | null = null,
  options?: { minDate?: D | null; maxDate?: D | null },
): NgxSignalField<DateTimeRange<D> | null> {
  return createSignalField<DateTimeRange<D> | null>(
    initialValue,
    (v) => validateDateRangeCore(v, adapter, options?.minDate, options?.maxDate),
  );
}

/**
 * Creates a pre-configured signal field for DateRange with built-in validation.
 */
export function createDateRangeSignalField<D>(
  adapter: NgxDateTimeAdapter<D>,
  initialValue: DateRange<D> | null = null,
  options?: { minDate?: D | null; maxDate?: D | null },
): NgxSignalField<DateRange<D> | null> {
  return createSignalField<DateRange<D> | null>(
    initialValue,
    (v) => validateDateRangeCore(v, adapter, options?.minDate, options?.maxDate),
  );
}

/**
 * Converts a core validate function into a shape compatible with future
 * Angular Signal Forms schema validators.
 *
 * Isolation point: update ONLY this function when Angular's signal-forms
 * validator shape changes (e.g. async, returning signal instead of plain obj).
 */
export function toSignalValidator<T>(
  validateFn: (v: T) => ValidationErrors | null,
): (v: T) => ValidationErrors | null {
  // Currently identical — adapter layer for future API changes
  return validateFn;
}

