import { InjectionToken } from '@angular/core';

/**
 * UI label strings used throughout the library.
 * Override globally (or per-component via the `labels` input) to support
 * languages other than the built-in defaults.
 *
 * Example:
 * ```ts
 * providers: [{ provide: NGX_LABELS, useValue: { apply: 'Confirmer', cancel: 'Annuler' } }]
 * ```
 */
export interface NgxLabels {
  // Panel actions
  apply: string;
  cancel: string;
  reset: string;

  // Panel header
  selectPeriod: string;
  selectDate: string;
  selectTime: string;
  selectDateTime: string;

  // Time blocks
  startTime: string;
  endTime: string;
  duration: string;

  // Presets
  today: string;
  last24h: string;
  thisWeek: string;
  last7Days: string;
  thisMonth: string;
  lastMonth: string;
  last30Days: string;
  custom: string;

  // Accessibility / screen-reader
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  closePanel: string;
  clearValue: string;
  increaseValue: string;
  decreaseValue: string;
  hours: string;
  minutes: string;
  seconds: string;
}

/** Default English labels. */
export const NGX_DEFAULT_LABELS: NgxLabels = {
  apply: 'Apply',
  cancel: 'Cancel',
  reset: 'Reset',
  selectPeriod: 'Select period',
  selectDate: 'Select date',
  selectTime: 'Select time',
  selectDateTime: 'Select date & time',
  startTime: 'Start time',
  endTime: 'End time',
  duration: 'Duration',
  today: 'Today',
  last24h: 'Last 24 hours',
  thisWeek: 'This week',
  last7Days: 'Last 7 days',
  thisMonth: 'This month',
  lastMonth: 'Last month',
  last30Days: 'Last 30 days',
  custom: 'Custom',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  closePanel: 'Close',
  clearValue: 'Clear',
  increaseValue: 'Increase',
  decreaseValue: 'Decrease',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
};

/** Injection token for UI labels. */
export const NGX_LABELS = new InjectionToken<NgxLabels>('NGX_LABELS', {
  providedIn: 'root',
  factory: () => NGX_DEFAULT_LABELS,
});

