import { InjectionToken } from '@angular/core';
import { NgxDateTimeAdapter } from '../adapters/date-time-adapter';

/**
 * Injection token for the date-time adapter.
 * Replace globally:
 * ```ts
 * providers: [{ provide: NGX_DATE_TIME_ADAPTER, useClass: MyLuxonAdapter }]
 * ```
 */
export const NGX_DATE_TIME_ADAPTER = new InjectionToken<NgxDateTimeAdapter<unknown>>(
  'NGX_DATE_TIME_ADAPTER',
);

