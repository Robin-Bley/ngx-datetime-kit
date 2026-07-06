# GitHub Copilot Instructions — ngx-datetime-kit

## Repository Context

This is an Angular 22+ library (`ngx-datetime-kit`) providing Date/Time/Range picker components.
- **Author**: Robin Bley (https://github.com/Robin-Bley)
- **npm**: https://www.npmjs.com/package/ngx-datetime-kit
- **Selector prefix**: `ngx`

## Architecture Rules

1. **Adapter pattern is sacred**: Never use `new Date()` or date operations directly in components. Always inject and use `NgxDateTimeAdapter<D>`. This ensures the library works with Luxon, date-fns, or any custom type.

2. **Shared validation core**: All validation logic lives in `validateDateRangeCore()`. Both `ValidatorFn` wrappers (Reactive Forms) and `createSignalField` validators call this function. Never duplicate validation logic.

3. **Signal-first internal state**: Use `signal()`, `computed()`, and `model()` for all component state. No `BehaviorSubject` in components. `ControlValueAccessor` is a thin adapter on top of signal state.

4. **Inline panels, not portals**: Picker panels render inline with `@if` — not in CDK portals — to preserve the DI context within the component subtree.

5. **No free text input**: Users MUST select values through the picker UI. Never add `<input type="text">` for date values.

## Code Style

- Angular 22 standalone components with `inject()` for DI
- `model()` for two-way binding, `input()` for read-only, `output()` for events
- `computed()` for derived state — avoid manual subscriptions/effects where possible
- TypeScript strict mode — no `any` unless absolutely unavoidable
- All component templates must have ARIA attributes on interactive elements

## Component File Structure

Every Angular component MUST consist of exactly four files:

1. **Component TypeScript** (`.component.ts`) — Logic, state, methods
2. **Component Template** (`.component.html`) — UI markup (separate file, not inline)
3. **Component Styles** (`.component.scss`) — BEM-like SCSS, using `--ngx-*` custom properties
4. **Component Tests** (`.component.spec.ts`) — Unit tests with full coverage

**Example structure:**
```
my-component/
├── my-component.component.ts
├── my-component.component.html
├── my-component.component.scss
└── my-component.component.spec.ts
```

## Angular 22+ Best Practices

- Use **Control Flow Syntax** exclusively: `@if`, `@for`, `@switch`, `@let` — NOT `*ngIf`, `*ngFor`, `[ngSwitch]`, `let`
- All signals must be defined as public or protected in component class
- Prefer `computed()` and `effect()` from `@angular/core` over manual subscription patterns
- Use `effect()` only for side effects (e.g., analytics, logging); prefer `computed()` for state derivation
- Template syntax: use `()` syntax for function calls, avoid piping where `computed()` can be used

## Type Safety

**All variables and constants MUST be fully typed:**

✅ **CORRECT**
```typescript
const name: string = 'John';
const age: number = 30;
const isActive: boolean = true;
const items: string[] = [];
const config: Record<string, unknown> = {};
const handler: (event: Event) => void = (ev) => { /* ... */ };
```

❌ **INCORRECT**
```typescript
const name = 'John';         // no type
const items: any[] = [];      // using any
let count;                   // undefined type
const value: any = getData(); // never use any
```

**Signal types:**
```typescript
const count = signal<number>(0);         // explicit type
const items = signal<Item[]>([]);        // generic array
const status = computed<string>(() => ...); // explicit computed type
```

## Public API Rules

- Only export symbols listed in `public-api.ts`
- Never export internal implementation details
- Every new public symbol needs a JSDoc comment
- Breaking changes require `CHANGELOG.md` update and major version bump

## Accessibility Requirements

- All interactive elements: `tabindex`, `role`, `aria-label`
- Keyboard navigation: arrow keys for calendar/time, Escape to close, Enter to confirm
- Focus must return to trigger element after panel close
- Color contrast: all text must meet WCAG 2.1 AA (4.5:1 ratio)

## Testing Requirements

- Every adapter method needs a unit test
- Reactive Forms validators: test `null`, valid range, invalid range, min/max
- Signal Forms: test initial state, value change reactivity, error computation
- New components: test keyboard navigation and ARIA attributes
- Template tests: verify `@if`, `@for`, `@let` conditionals and loops render correctly
- Component `.spec.ts` MUST exist for every component with minimum 80% code coverage
- Test all signal side effects using `effect()` with proper cleanup

## i18n Requirements

- Never hardcode UI strings. Use `NGX_LABELS` injection token.
- Format strings come from `NGX_DATE_TIME_FORMATS` token — never hardcode `'dd.MM.yyyy'` in components.
- Weekday/month names via `adapter.getWeekdayNames()` / `adapter.getMonthNames()`.

## Forms Integration

- Reactive Forms: every picker implements `ControlValueAccessor` + `NG_VALUE_ACCESSOR` provider
- Signal Forms: every picker uses `model()` for two-way binding
- Signal Forms adapter is isolated in `signal-forms-adapter.ts` — update only this file when Angular's Signal Forms API changes

## CSS/Styling

- Use CSS custom properties (`--ngx-*`) for all design tokens — no hardcoded colors
- Component styles go in `styles/index.scss` using BEM-like `.ngx-*` classes
- Responsive breakpoints: 375px (mobile), 768px (tablet), 1280px+ (desktop)
- Test explicitly at all three breakpoints

## Responsive Design

All components MUST be fully responsive across the three defined breakpoints.

### Panel behavior

| Breakpoint                | Behavior                                                             |
|---------------------------|----------------------------------------------------------------------|
| `< 768px` (mobile)        | Fixed bottom-sheet, full width, rounded top corners, max-height 90vh |
| `768px – 1279px` (tablet) | Absolute drop-down, two-column layout (presets + content)            |
| `≥ 1280px` (desktop)      | Absolute drop-down, three-column layout (presets + calendars + time) |

### Rules

- **Mobile bottom-sheet is CSS-driven**: use `@media (max-width: 767px)` — never read `window.innerWidth` in component logic for layout-only purposes
- **Touch targets**: all interactive elements must be at least **44 × 44 px** (WCAG 2.5.5)
- **Calendar cells**: minimum `36px` on desktop, minimum `40px` on mobile (larger tap area)
- **Presets**: vertical sidebar on desktop; horizontal scrollable row on mobile/tablet
- **Time selector columns**: flex row on desktop; wraps on mobile
- **Calendars**: side-by-side on tablet+; stack vertically on mobile

## Template Best Practices (Angular 22+)

**Always use control flow syntax:**
- `@if (condition) { ... }` instead of `*ngIf`
- `@for (item of items; track item.id) { ... }` instead of `*ngFor` (track is mandatory)
- `@switch (value) { @case (...) { ... } }` instead of `[ngSwitch]`
- `@let variable = expression;` instead of `let` in template variables

**Example:**
```html
<!-- ✅ CORRECT (Control Flow Syntax) -->
@if (isOpen()) {
  <div class="ngx-panel">
    @for (day of daysInMonth(); track day.date) {
      <button (click)="selectDay(day)">{{ day.number }}</button>
    }
  </div>
}

<!-- ❌ INCORRECT (Legacy syntax) -->
<div *ngIf="isOpen()" class="ngx-panel">
  <button *ngFor="let day of daysInMonth()" (click)="selectDay(day)">
    {{ day.number }}
  </button>
</div>
```

**Template variables must be typed:**
```html
<!-- ✅ CORRECT -->
@let formattedDate: string = formatDate(selectedDate());
@let isValid: boolean = validate(range());

<!-- ❌ INCORRECT -->
@let formattedDate = formatDate(selectedDate());
```

## File Organization

```
adapters/      — NgxDateTimeAdapter + NgxNativeDateTimeAdapter
components/    — picker components and shared sub-components
forms/         — reactive-forms-adapter.ts, signal-forms-adapter.ts
models/        — TypeScript interfaces (TimeValue, DateRange, DateTimeRange, RangePreset)
tokens/        — DI tokens (adapter, formats, labels)
utilities/     — pure functions (date-utils, format-duration, build-calendar-grid)
validators/    — validateDateRangeCore + Reactive Forms ValidatorFn wrappers
styles/        — SCSS variables + component styles
```

## Future Extension Notes

- **Timezone support**: Add `getTimezone()`, `convertToTimezone()` methods to `NgxDateTimeAdapter` in a new minor version. All components receive a `timezone` input that delegates to the adapter.
- **Additional adapters**: Luxon and date-fns adapters should live in separate npm packages (e.g. `ngx-datetime-kit-luxon`) to avoid bundle bloat.
- **Year/decade views**: Add `viewMode: 'month' | 'year' | 'decade'` to the calendar component for faster navigation.

