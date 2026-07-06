# Date Format Configuration

The library separates **display format** (what users see) from the **internal data model** (always a strongly typed `D` instance).

## Format Token Reference

| Token | Meaning | Example |
|-------|---------|---------|
| `yyyy` | 4-digit year | `2026` |
| `MM` | 2-digit month | `07` |
| `dd` | 2-digit day | `03` |
| `HH` | 2-digit hours (24h) | `14` |
| `mm` | 2-digit minutes | `30` |
| `ss` | 2-digit seconds | `05` |
| `M` | Month without padding | `7` |
| `d` | Day without padding | `3` |

## Built-in Format Presets

### German (DE)

```typescript
import { NGX_DATE_TIME_FORMATS_DE } from 'ngx-datetime-kit';
// dateInput:     'dd.MM.yyyy'       → "03.07.2026"
// dateTimeInput: 'dd.MM.yyyy HH:mm:ss' → "03.07.2026 14:30:05"
```

### US

```typescript
import { NGX_DATE_TIME_FORMATS_US } from 'ngx-datetime-kit';
// dateInput:     'MM/dd/yyyy'       → "07/03/2026"
// dateTimeInput: 'MM/dd/yyyy HH:mm:ss' → "07/03/2026 14:30:05"
```

### ISO 8601

```typescript
import { NGX_DATE_TIME_FORMATS_ISO } from 'ngx-datetime-kit';
// dateInput:     'yyyy-MM-dd'       → "2026-07-03"
// dateTimeInput: 'yyyy-MM-dd HH:mm:ss' → "2026-07-03 14:30:05"
```

## Custom Format

```typescript
import { NGX_DATE_TIME_FORMATS, NgxDateTimeFormats } from 'ngx-datetime-kit';

const MY_FORMATS: NgxDateTimeFormats = {
  display: {
    dateInput: 'dd/MM/yyyy',
    timeInput: 'HH:mm',
    dateTimeInput: 'dd/MM/yyyy HH:mm',
    monthYearLabel: 'MM/yyyy',
  },
  parse: {
    dateInput: 'dd/MM/yyyy',
    timeInput: 'HH:mm',
    dateTimeInput: 'dd/MM/yyyy HH:mm',
  },
};

// Register globally:
provideNgxDatetimeKit({ formats: MY_FORMATS })

// Or as direct token:
{ provide: NGX_DATE_TIME_FORMATS, useValue: MY_FORMATS }
```

## Internal Model vs. Display

The internal value is always a `D` instance (e.g. native `Date`). The format string only affects how the value is displayed in the field trigger. When you read `component.value()` or bind to a `FormControl`, you always get the raw `D` object — not a formatted string. This ensures clean separation between presentation and data.

