# API Reference

## Components

### `ngx-date-time-range-picker`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `[(value)]` | `DateTimeRange<D> \| null` | `null` | Selected range (two-way) |
| `placeholder` | `string` | format string | Field placeholder |
| `disabled` | `boolean` | `false` | Disables the picker |
| `invalid` | `boolean` | `false` | Marks field as invalid (red border) |
| `showSeconds` | `boolean` | `true` | Show seconds in time selectors |
| `minDate` | `D \| null` | `null` | Minimum selectable date |
| `maxDate` | `D \| null` | `null` | Maximum selectable date |
| `customPresets` | `RangePreset<D>[] \| null` | `null` | Custom presets (replaces defaults) |

### `ngx-date-range-picker`

Same inputs as above except no `showSeconds`.

### `ngx-date-time-picker`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `[(value)]` | `D \| null` | `null` | Selected date+time |
| `placeholder` | `string` | — | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `showSeconds` | `boolean` | `true` | Show seconds |
| `minDate` | `D \| null` | `null` | Min date |
| `maxDate` | `D \| null` | `null` | Max date |

### `ngx-date-picker`

Same as `ngx-date-time-picker` but no `showSeconds`.

### `ngx-time-picker`

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `[(value)]` | `TimeValue \| null` | `null` | Selected time |
| `showSeconds` | `boolean` | `true` | Show seconds spinner |
| `disabled` | `boolean` | `false` | Disabled state |

## Models

### `TimeValue`

```typescript
interface TimeValue { hours: number; minutes: number; seconds: number; }
```

### `DateRange<D>`

```typescript
interface DateRange<D> { start: D | null; end: D | null; }
```

### `DateTimeRange<D>`

```typescript
interface DateTimeRange<D> { start: D | null; end: D | null; }
```

### `RangePreset<D>`

```typescript
interface RangePreset<D> {
  label: string;
  key: string;
  getRangeFn: () => { start: D; end: D };
}
```

## Tokens

| Token | Type | Default |
|-------|------|---------|
| `NGX_DATE_TIME_ADAPTER` | `NgxDateTimeAdapter<D>` | `NgxNativeDateTimeAdapter` |
| `NGX_DATE_TIME_FORMATS` | `NgxDateTimeFormats` | ISO formats |
| `NGX_LABELS` | `NgxLabels` | English labels |

## Functions

| Function | Description |
|----------|-------------|
| `provideNgxDatetimeKit(config?)` | Configure library for standalone apps |
| `ngxDateRangeValidator(adapter, min?, max?)` | Reactive Forms validator |
| `endAfterStartValidator(adapter)` | Cross-field group validator |
| `ngxMinDateValidator(adapter, min)` | Min date validator |
| `ngxMaxDateValidator(adapter, max)` | Max date validator |
| `createSignalField(initial, validate?)` | Generic signal field factory |
| `createDateTimeRangeSignalField(adapter, initial?, options?)` | Pre-configured range signal field |
| `createDateRangeSignalField(adapter, initial?, options?)` | Pre-configured date range signal field |
| `formatDuration(ms, labels?)` | Human-readable duration string |
| `buildCalendarGrid(year, month, firstDayOfWeek, adapter)` | Calendar grid builder |

