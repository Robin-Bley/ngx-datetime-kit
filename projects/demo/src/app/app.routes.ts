import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    loadComponent: () =>
      import('./pages/overview/overview.component').then((m) => m.OverviewComponent),
  },
  {
    path: 'reactive-forms',
    loadComponent: () =>
      import('./pages/reactive-forms/reactive-forms.component').then((m) => m.ReactiveFormsPageComponent),
  },
  {
    path: 'signal-forms',
    loadComponent: () =>
      import('./pages/signal-forms/signal-forms.component').then((m) => m.SignalFormsPageComponent),
  },
  {
    path: 'custom-adapter',
    loadComponent: () =>
      import('./pages/custom-adapter/custom-adapter.component').then((m) => m.CustomAdapterComponent),
  },
  {
    path: 'i18n',
    loadComponent: () =>
      import('./pages/i18n/i18n.component').then((m) => m.I18nPageComponent),
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];

