import { InjectionToken } from '@angular/core';

/**
 * Format configuration for dates and times.
 * Analogous to Angular Material's MAT_DATE_FORMATS.
 *
 * All formats use Unicode CLDR-like tokens as implemented by NgxNativeDateTimeAdapter:
 *   yyyy, MM, dd, HH, mm, ss
 */
export interface NgxDateTimeFormats {
  /** Display format for date-only pickers (e.g. "dd.MM.yyyy"). */
  display: {
    dateInput: string;
    timeInput: string;
    dateTimeInput: string;
    /** Format for the calendar month/year header (e.g. "MMMM yyyy"). */
    monthYearLabel: string;
  };
  /** Parsing formats (used by adapters; can be a list of fallback formats). */
  parse: {
    dateInput: string;
    timeInput: string;
    dateTimeInput: string;
  };
}

/** German (DE) format set. */
export const NGX_DATE_TIME_FORMATS_DE: NgxDateTimeFormats = {
  display: {
    dateInput: 'dd.MM.yyyy',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'dd.MM.yyyy HH:mm:ss',
    monthYearLabel: 'MM.yyyy',
  },
  parse: {
    dateInput: 'dd.MM.yyyy',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'dd.MM.yyyy HH:mm:ss',
  },
};

/** US format set. */
export const NGX_DATE_TIME_FORMATS_US: NgxDateTimeFormats = {
  display: {
    dateInput: 'MM/dd/yyyy',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'MM/dd/yyyy HH:mm:ss',
    monthYearLabel: 'MM/yyyy',
  },
  parse: {
    dateInput: 'MM/dd/yyyy',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'MM/dd/yyyy HH:mm:ss',
  },
};

/** ISO 8601 format set. */
export const NGX_DATE_TIME_FORMATS_ISO: NgxDateTimeFormats = {
  display: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'yyyy-MM-dd HH:mm:ss',
    monthYearLabel: 'yyyy-MM',
  },
  parse: {
    dateInput: 'yyyy-MM-dd',
    timeInput: 'HH:mm:ss',
    dateTimeInput: 'yyyy-MM-dd HH:mm:ss',
  },
};

/**
 * Injection token for date-time formats.
 * Defaults to NGX_DATE_TIME_FORMATS_ISO when not provided.
 */
export const NGX_DATE_TIME_FORMATS = new InjectionToken<NgxDateTimeFormats>(
  'NGX_DATE_TIME_FORMATS',
  { providedIn: 'root', factory: () => NGX_DATE_TIME_FORMATS_ISO },
);

