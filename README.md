# ngx-datetime-kit

<!-- TODO: Replace with actual badge URLs after first CI run and npm publish -->
[![CI](https://github.com/Robin-Bley/ngx-datetime-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/Robin-Bley/ngx-datetime-kit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ngx-datetime-kit.svg)](https://www.npmjs.com/package/ngx-datetime-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Production-ready Angular 22+ library for **Date**, **Time**, **DateTime**, **Date Range**, and **DateTime Range** pickers — with full accessibility, i18n, Reactive Forms **and** Signal Forms support.

> 📸 **Screenshot placeholder**
> ![DateTime Range Picker](docs/assets/screenshot-datetime-range-picker.png)
> <!-- TODO: Replace with actual screenshot after first run -->

## Live Demo

> 🔗 **[StackBlitz Live Demo](https://stackblitz.com/github/Robin-Bley/ngx-datetime-kit?file=README.md)**
> <!-- TODO: Create actual StackBlitz project and replace URL -->

## npm Package

> 📦 **[https://www.npmjs.com/package/ngx-datetime-kit](https://www.npmjs.com/package/ngx-datetime-kit)**

## Features

- ✅ **5 Picker Components**: `ngx-time-picker`, `ngx-date-picker`, `ngx-date-time-picker`, `ngx-date-range-picker`, `ngx-date-time-range-picker`
- ✅ **No free text input** — all values via picker UI only
- ✅ **Full keyboard accessibility** (arrow keys, Tab, Enter, Escape)
- ✅ **ARIA roles, labels, focus trapping** via Angular CDK a11y
- ✅ **24h format, optional seconds**
- ✅ **Responsive**: Desktop popover, Mobile bottom-sheet, Tablet adaptive
- ✅ **Adapter pattern** — pluggable adapter for Luxon, date-fns, or any custom type
- ✅ **i18n** — locale-aware weekday/month names, first-day-of-week, configurable labels
- ✅ **Configurable date formats** (DE, US, ISO and custom)
- ✅ **Reactive Forms** — `ControlValueAccessor`, custom validators
- ✅ **Signal Forms** — `model()` two-way binding, `NgxSignalField`, signal validators
- ✅ **Angular Package Format** (APF) — tree-shakeable, no side effects
- ✅ **Min/Max, disabled, required, custom validators**
- ✅ **Range presets** (Today, Last 7 days, This month, Custom, …)
- ✅ **Duration display** in range pickers

## Installation

```bash
npm install ngx-datetime-kit
```

## Quick Start

### 1. Configure in `app.config.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideNgxDatetimeKit, NGX_DATE_TIME_FORMATS_DE } from 'ngx-datetime-kit';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgxDatetimeKit({
      formats: NGX_DATE_TIME_FORMATS_DE,
    }),
  ],
});
```

### 2. Import styles in `styles.scss`

```scss
@use 'ngx-datetime-kit/styles/index';
```

### 3. Use Components

```html
<ngx-date-time-range-picker [(value)]="myRange" />
<ngx-date-picker [(value)]="myDate" [minDate]="today" />
<ngx-time-picker [(value)]="myTime" [showSeconds]="true" />
```

## Forms Integration

### Reactive Forms

```typescript
form = new FormGroup({
  range: new FormControl(null, [ngxDateRangeValidator(this.adapter)]),
});
```

### Signal Forms

```typescript
rangeField = createDateTimeRangeSignalField(this.adapter);
// Template: <ngx-date-time-range-picker [(value)]="rangeField.value" />
```

See [docs/forms.md](docs/forms.md) for full examples and comparison.

## Custom Adapter

```typescript
@Injectable()
class LuxonDateTimeAdapter extends NgxDateTimeAdapter<DateTime> { /* ... */ }

provideNgxDatetimeKit({ adapter: LuxonDateTimeAdapter })
```

See [docs/adapter.md](docs/adapter.md).

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `NPM_TOKEN` | npm automation token for publishing |

## Documentation

- [Getting Started](docs/getting-started.md) | [Architecture](docs/architecture.md)
- [Adapter Guide](docs/adapter.md) | [i18n Guide](docs/i18n.md)
- [Format Configuration](docs/formats.md) | [Forms Guide](docs/forms.md)
- [Full API Reference](docs/api.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

**Author:** [Robin Bley](https://github.com/Robin-Bley) · **Repo:** [github.com/Robin-Bley/ngx-datetime-kit](https://github.com/Robin-Bley/ngx-datetime-kit)
