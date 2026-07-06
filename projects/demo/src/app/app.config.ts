import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Use the library with English defaults (the i18n page demonstrates overrides)
    provideNgxDatetimeKit(),
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
};
