import { Component, inject, LOCALE_ID, signal } from '@angular/core';
import {
  DateTimeRange,
  NGX_DATE_TIME_FORMATS,
  NGX_DATE_TIME_FORMATS_DE,
  NGX_DATE_TIME_FORMATS_ISO,
  NGX_DATE_TIME_FORMATS_US,
  NgxDateTimeRangePickerComponent,
} from 'ngx-datetime-kit';

/**
 * Demo page: Shows three different date/time formats (DE, US, ISO) using
 * component-level provider overrides.
 */
@Component({
  selector: 'demo-i18n',
  standalone: true,
  imports: [NgxDateTimeRangePickerComponent],
  templateUrl: './i18n.component.html',
  styleUrl: './i18n.component.scss',
})
export class I18nPageComponent {
  public readonly localeId: string = inject(LOCALE_ID);
  public readonly rangeDE = signal<DateTimeRange<Date> | null>(null);
  public readonly rangeUS = signal<DateTimeRange<Date> | null>(null);
  public readonly rangeISO = signal<DateTimeRange<Date> | null>(null);

  // Expose format tokens to the template so child components can override
  public readonly formatsDE: typeof NGX_DATE_TIME_FORMATS_DE = NGX_DATE_TIME_FORMATS_DE;
  public readonly formatsUS: typeof NGX_DATE_TIME_FORMATS_US = NGX_DATE_TIME_FORMATS_US;
  public readonly formatsISO: typeof NGX_DATE_TIME_FORMATS_ISO = NGX_DATE_TIME_FORMATS_ISO;
  public readonly formatToken: typeof NGX_DATE_TIME_FORMATS = NGX_DATE_TIME_FORMATS;
}
