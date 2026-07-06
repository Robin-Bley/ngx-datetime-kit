/*
 * Public API Surface of ngx-datetime-kit
 *
 * Only items listed here are considered public API.
 * All other symbols are internal implementation details.
 */

// ── Module & Provider ─────────────────────────────────────────────────────────
export { NgxDatetimeKitModule } from './lib/ngx-datetime-kit.module';
export { provideNgxDatetimeKit } from './lib/provide-ngx-datetime-kit';
export type { NgxDatetimeKitConfig } from './lib/provide-ngx-datetime-kit';

// ── Components ────────────────────────────────────────────────────────────────
export { NgxDateTimeRangePickerComponent } from './lib/components/date-time-range-picker/ngx-date-time-range-picker.component';
export { NgxDateRangePickerComponent } from './lib/components/date-range-picker/ngx-date-range-picker.component';
export { NgxDateTimePickerComponent } from './lib/components/date-time-picker/ngx-date-time-picker.component';
export { NgxDatePickerComponent } from './lib/components/date-picker/ngx-date-picker.component';
export { NgxTimePickerComponent } from './lib/components/time-picker/ngx-time-picker.component';
export { NgxCalendarComponent } from './lib/components/shared/calendar/ngx-calendar.component';
export { NgxTimeSelectorComponent } from './lib/components/shared/time-selector/ngx-time-selector.component';
export { NgxPresetsPanelComponent } from './lib/components/shared/presets-panel/ngx-presets-panel.component';

// ── Adapter ───────────────────────────────────────────────────────────────────
export { NgxDateTimeAdapter } from './lib/adapters/date-time-adapter';
export { NgxNativeDateTimeAdapter } from './lib/adapters/native-date-time-adapter';

// ── Tokens ────────────────────────────────────────────────────────────────────
export { NGX_DATE_TIME_ADAPTER } from './lib/tokens/date-time-adapter.token';
export {
  NGX_DATE_TIME_FORMATS,
  NGX_DATE_TIME_FORMATS_DE,
  NGX_DATE_TIME_FORMATS_US,
  NGX_DATE_TIME_FORMATS_ISO,
} from './lib/tokens/date-time-formats.token';
export type { NgxDateTimeFormats } from './lib/tokens/date-time-formats.token';
export { NGX_LABELS, NGX_DEFAULT_LABELS } from './lib/tokens/labels.token';
export type { NgxLabels } from './lib/tokens/labels.token';

// ── Models ────────────────────────────────────────────────────────────────────
export type { TimeValue } from './lib/models/time-value.model';
export {
  createTimeValue,
  timeValueFromDate,
  applyTimeToDate,
  compareTimeValues,
  formatTimeValue,
  parseTimeValue,
} from './lib/models/time-value.model';
export type {
  DateRange,
  DateTimeRange,
} from './lib/models/date-range.model';
export {
  createEmptyDateRange,
  createEmptyDateTimeRange,
  isCompleteRange,
} from './lib/models/date-range.model';
export type { RangePreset } from './lib/models/preset.model';

// ── Validators ────────────────────────────────────────────────────────────────
export {
  ngxDateRangeValidator,
  endAfterStartValidator,
  ngxMinDateValidator,
  ngxMaxDateValidator,
  validateDateRangeCore,
} from './lib/validators/date-range.validator';

// ── Forms adapters ────────────────────────────────────────────────────────────
export {
  createSignalField,
  createDateTimeRangeSignalField,
  createDateRangeSignalField,
  toSignalValidator,
} from './lib/forms/signal-forms-adapter';
export type { NgxSignalField } from './lib/forms/signal-forms-adapter';

// ── Utilities ─────────────────────────────────────────────────────────────────
export { formatDuration, buildCalendarGrid, clampDate } from './lib/utilities/date-utils';

