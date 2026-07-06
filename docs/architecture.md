# Architecture Overview

## Project Structure

```
ngx-datetime-kit/
├── projects/
│   ├── ngx-datetime-kit/          # The Angular library
│   │   └── src/lib/
│   │       ├── adapters/           # NgxDateTimeAdapter + NgxNativeDateTimeAdapter
│   │       ├── components/
│   │       │   ├── shared/         # Calendar, TimeSelector, PresetsPanel (reusable)
│   │       │   ├── time-picker/
│   │       │   ├── date-picker/
│   │       │   ├── date-time-picker/
│   │       │   ├── date-range-picker/
│   │       │   └── date-time-range-picker/
│   │       ├── forms/              # reactive-forms-adapter.ts, signal-forms-adapter.ts
│   │       ├── models/             # TimeValue, DateRange, DateTimeRange, RangePreset
│   │       ├── tokens/             # DI tokens: adapter, formats, labels
│   │       ├── utilities/          # date-utils (buildCalendarGrid, formatDuration, ...)
│   │       ├── validators/         # Core validation + Reactive Forms validators
│   │       └── styles/             # SCSS variables, component styles
│   └── demo/                       # Showcase application
├── docs/                           # Documentation
└── .github/                        # Actions, templates, Copilot instructions
```

## Key Design Decisions

### 1. Adapter Pattern
All date/time operations are routed through `NgxDateTimeAdapter<D>`. Components never call `new Date()` directly. This allows consumer to swap the entire date library (Luxon, date-fns, Temporal) via a single DI token override.

### 2. Shared Validation Core
`validateDateRangeCore()` in `validators/date-range.validator.ts` contains all business rules once. Both the Reactive Forms `ValidatorFn` wrappers and Signal Forms adapter call this function — no duplication.

### 3. Signal-First Internal State
All component state uses `signal()`, `computed()`, and `model()`. The `ControlValueAccessor` implementation is a thin adapter layer on top of this signal state.

### 4. Inline Panel (not CDK Portal)
The picker panel is rendered inline (conditionally via `@if`) rather than in a CDK portal. This keeps the component's DI context intact (tokens injected in the component subtree work correctly) and avoids cross-portal communication complexity.

### 5. CSS Custom Properties
All visual tokens are CSS custom properties (`--ngx-primary`, etc.) making theming trivial — just override them in your `:root` or a parent element.

## Data Flow

```
User clicks field  →  isOpen.set(true)
User selects day   →  pendingStart / pendingEnd updated
User clicks Apply  →  value.set(range) + onChange(range) emitted
FormControl        →  CVA.writeValue() → value.set(range)
Signal binding     →  [(value)] → model() two-way binding
```
