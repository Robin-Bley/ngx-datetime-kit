import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGX_DATE_TIME_ADAPTER } from './tokens/date-time-adapter.token';
import { NGX_DATE_TIME_FORMATS, NgxDateTimeFormats } from './tokens/date-time-formats.token';
import { NGX_LABELS, NgxLabels } from './tokens/labels.token';
import { NgxDateTimeAdapter } from './adapters/date-time-adapter';
import { NgxNativeDateTimeAdapter } from './adapters/native-date-time-adapter';

export interface NgxDatetimeKitConfig {
  adapter?: new (...args: unknown[]) => NgxDateTimeAdapter<unknown>;
  formats?: Partial<NgxDateTimeFormats>;
  labels?: Partial<NgxLabels>;
}

/**
 * provideNgxDatetimeKit — the recommended way to configure the library in
 * standalone applications using bootstrapApplication().
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgxDatetimeKit({
 *       formats: NGX_DATE_TIME_FORMATS_DE,
 *       labels: { apply: 'Übernehmen', cancel: 'Abbrechen' },
 *     }),
 *   ]
 * });
 * ```
 */
export function provideNgxDatetimeKit(config?: NgxDatetimeKitConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGX_DATE_TIME_ADAPTER,
      useClass: (config?.adapter ?? NgxNativeDateTimeAdapter) as never,
    },
    ...(config?.formats
      ? [{ provide: NGX_DATE_TIME_FORMATS, useValue: config.formats }]
      : []),
    ...(config?.labels
      ? [{ provide: NGX_LABELS, useValue: config.labels }]
      : []),
  ]);
}

