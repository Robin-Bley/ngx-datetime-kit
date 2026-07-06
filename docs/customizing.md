# Customizing ngx-datetime-kit

All visual, layout, and behavioral aspects of the library can be adapted without modifying library source code. The library exposes three customization layers:

1. **CSS Custom Properties** — change design tokens globally or per component
2. **BEM class overrides** — adjust individual element styles
3. **Angular DI tokens** — swap behaviour (adapter, labels, formats)

---

## 1 · CSS Custom Properties (Design Tokens)

Every hardcoded value in the library is represented as a CSS custom property prefixed with `--ngx-`.
Override them in `:root` for a global theme, or on a parent element for scoped theming.

### Full Token Reference

```css
:root {
  /* ── Surfaces ──────────────────────────────────────────── */
  --ngx-bg:             #f7f6f2;   /* Page background */
  --ngx-surface:        #ffffff;   /* Card / panel surface */
  --ngx-surface-2:      #fbfbf9;   /* Secondary surface (footer, presets bg) */
  --ngx-surface-offset: #f3f0ec;   /* Hovered / pressed surface */

  /* ── Borders & dividers ────────────────────────────────── */
  --ngx-border:         #d4d1ca;
  --ngx-divider:        #dcd9d5;

  /* ── Text ──────────────────────────────────────────────── */
  --ngx-text:           #28251d;   /* Primary body text */
  --ngx-text-muted:     #7a7974;   /* Secondary / helper text */
  --ngx-text-faint:     #bab9b4;   /* Placeholder / disabled text */
  --ngx-text-inverse:   #f9f8f4;   /* Text on primary-colored bg */

  /* ── Primary colour (teal) ─────────────────────────────── */
  --ngx-primary:          #01696f;
  --ngx-primary-hover:    #0c4e54;
  --ngx-primary-highlight:#cedcd8; /* Range in-between highlight */
  --ngx-primary-light:    #e8f3f2; /* Hover background tint */

  /* ── Status ────────────────────────────────────────────── */
  --ngx-error:        #c0392b;
  --ngx-error-bg:     #fdf3f2;
  --ngx-error-border: #e8a49f;
  --ngx-success:      #27ae60;
  --ngx-warning:      #e67e22;

  /* ── Border radius ─────────────────────────────────────── */
  --ngx-radius-xs:   4px;
  --ngx-radius-sm:   6px;
  --ngx-radius-md:   8px;
  --ngx-radius-lg:   12px;
  --ngx-radius-xl:   16px;    /* Panel corners */
  --ngx-radius-full: 999px;   /* Pills / circles */

  /* ── Shadows ───────────────────────────────────────────── */
  --ngx-shadow-sm: 0 2px 8px rgba(20, 30, 28, 0.08);
  --ngx-shadow-md: 0 8px 24px rgba(20, 30, 28, 0.12), 0 2px 6px rgba(20, 30, 28, 0.06);
  --ngx-shadow-lg: 0 24px 60px rgba(20, 30, 28, 0.18);

  /* ── Transitions ───────────────────────────────────────── */
  --ngx-transition: 150ms ease;

  /* ── Typography ────────────────────────────────────────── */
  --ngx-font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --ngx-font-size-xs:   11px;
  --ngx-font-size-sm:   13px;
  --ngx-font-size-base: 14px;
  --ngx-font-size-md:   15px;
  --ngx-font-size-lg:   17px;

  /* ── Layout ────────────────────────────────────────────── */
  --ngx-panel-max-width:  800px;
  --ngx-panel-min-width:  320px;
  --ngx-field-height:      44px;   /* Trigger button height */
  --ngx-calendar-cell-size:        36px;  /* Desktop day cell */
  --ngx-calendar-cell-size-mobile: 40px;  /* Mobile day cell */
  --ngx-time-segment-width: 44px;

  /* ── Touch & mobile ────────────────────────────────────── */
  --ngx-touch-target:           44px;   /* WCAG 2.5.5 minimum */
  --ngx-panel-mobile-max-height: 90vh;  /* Bottom-sheet max height */

  /* ── Mobile drag handle ────────────────────────────────── */
  --ngx-bottom-handle-width:  40px;
  --ngx-bottom-handle-height:  4px;
  --ngx-bottom-handle-color:  var(--ngx-border);
}
```

---

## 2 · Theming Examples

### 2.1 Custom Brand Colour

Replace the teal primary with your brand colour. All interactive states derive from these four tokens:

```css
:root {
  --ngx-primary:           #7c3aed; /* Violet */
  --ngx-primary-hover:     #5b21b6;
  --ngx-primary-highlight: #ede9fe;
  --ngx-primary-light:     #f5f3ff;
}
```

### 2.2 Scoped Theming

Apply a different theme inside a specific page or widget without affecting the rest of the app:

```html
<div class="booking-widget">
  <ngx-date-range-picker [(value)]="range" />
</div>
```

```css
.booking-widget {
  --ngx-primary:           #d97706; /* Amber */
  --ngx-primary-hover:     #b45309;
  --ngx-primary-highlight: #fef3c7;
  --ngx-primary-light:     #fffbeb;
}
```

### 2.3 Dark Mode

The library has no hard-coded colours, making dark mode trivial via `prefers-color-scheme` or a custom attribute:

```css
/* System-level dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --ngx-bg:             #0f0f0f;
    --ngx-surface:        #1c1c1c;
    --ngx-surface-2:      #252525;
    --ngx-surface-offset: #2e2e2e;

    --ngx-border:         #3a3a3a;
    --ngx-divider:        #333333;

    --ngx-text:           #f0efeb;
    --ngx-text-muted:     #999994;
    --ngx-text-faint:     #555550;
    --ngx-text-inverse:   #0f0f0f;

    --ngx-primary:          #2dd4bf;
    --ngx-primary-hover:    #5eead4;
    --ngx-primary-highlight:#1a3835;
    --ngx-primary-light:    #14302e;

    --ngx-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
    --ngx-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.5);
    --ngx-shadow-lg: 0 24px 60px rgba(0, 0, 0, 0.6);
  }
}

/* Attribute-driven dark mode (Angular CDK / custom toggle) */
[data-theme='dark'] {
  /* same overrides as above */
}
```

### 2.4 Compact / Dense Layout

Reduce spacing for data-dense UIs:

```css
.ngx-compact {
  --ngx-field-height:         36px;
  --ngx-calendar-cell-size:   28px;
  --ngx-font-size-base:       12px;
  --ngx-font-size-sm:         11px;
  --ngx-radius-md:             4px;
  --ngx-radius-xl:             8px;
}
```

```html
<div class="ngx-compact">
  <ngx-date-picker [(value)]="date" />
</div>
```

### 2.5 Mobile Bottom-Sheet Customisation

Control the drag handle and sheet height:

```css
:root {
  --ngx-bottom-handle-width:       48px;
  --ngx-bottom-handle-height:       5px;
  --ngx-bottom-handle-color:       #cccccc;
  --ngx-panel-mobile-max-height:   75vh;  /* Shorter sheet */
}
```

---

## 3 · Typography

Use any font family by overriding `--ngx-font-family`. The library only uses this token — no additional font imports are injected.

```css
:root {
  --ngx-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

Pair with a `<link>` to Google Fonts or your self-hosted font in `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

---

## 4 · BEM Class Overrides

All library elements follow the `.ngx-<block>__<element>--<modifier>` naming convention and are applied to host elements in your Angular component scope.

**Important**: wrap overrides in the consuming component's host styles or a scoping class to avoid unintended global changes.

```scss
// Increase field border radius
.my-form ngx-date-picker .ngx-picker-field {
  border-radius: 12px;
}

// Hide the presets panel for a specific picker
.compact-booking ngx-date-range-picker .ngx-presets {
  display: none;
}

// Larger calendar cells for accessibility
.accessible-calendar .ngx-calendar__day {
  min-height: 48px;
  font-size: 15px;
}
```

---

## 5 · Custom Presets

Replace or extend the built-in presets via the `customPresets` input. Each preset receives a `label`, a unique `key`, and a `getRangeFn` factory that returns `{ start, end }` using the injected adapter.

```typescript
import { inject } from '@angular/core';
import { NGX_DATE_TIME_ADAPTER } from 'ngx-datetime-kit';
import type { RangePreset } from 'ngx-datetime-kit';

@Component({ /* ... */ })
export class MyComponent {
  private readonly adapter = inject(NGX_DATE_TIME_ADAPTER);

  readonly presets: RangePreset<Date>[] = [
    {
      label: 'Today',
      key: 'today',
      getRangeFn: () => {
        const today: Date = this.adapter.today();
        return { start: today, end: today };
      },
    },
    {
      label: 'Last 7 days',
      key: 'last7',
      getRangeFn: () => ({
        start: this.adapter.addDays(this.adapter.today(), -6),
        end:   this.adapter.today(),
      }),
    },
    {
      label: 'This month',
      key: 'thisMonth',
      getRangeFn: () => ({
        start: this.adapter.startOfMonth(this.adapter.today()),
        end:   this.adapter.endOfMonth(this.adapter.today()),
      }),
    },
  ];
}
```

```html
<ngx-date-range-picker
  [(value)]="range"
  [customPresets]="presets"
/>
```

Setting `customPresets` to `null` restores the default built-in presets.

---

## 6 · Locale, Formats & Labels

### 6.1 Date/Time Formats

Override the format strings used inside pickers and the field display via `NGX_DATE_TIME_FORMATS`:

```typescript
import { provideNgxDatetimeKit } from 'ngx-datetime-kit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxDatetimeKit({
      formats: {
        dateDisplay:      'dd.MM.yyyy',
        timeDisplay:      'HH:mm',
        dateTimeDisplay:  'dd.MM.yyyy HH:mm',
        dateRangeDisplay: 'dd.MM.yyyy – dd.MM.yyyy',
      },
    }),
  ],
};
```

See [`docs/formats.md`](./formats.md) for the full list of format tokens.

### 6.2 UI Labels

Override button labels, ARIA strings, and duration text via `NGX_LABELS`:

```typescript
provideNgxDatetimeKit({
  labels: {
    apply:        'Anwenden',
    cancel:       'Abbrechen',
    clear:        'Löschen',
    today:        'Heute',
    startDate:    'Startdatum',
    endDate:      'Enddatum',
    selectTime:   'Uhrzeit wählen',
    close:        'Schließen',
  },
})
```

See [`docs/i18n.md`](./i18n.md) for the complete labels interface.

---

## 7 · Custom Date Adapter

The library is entirely agnostic about date types. Swap in Luxon, date-fns, or the JavaScript `Temporal` API by providing a custom `NgxDateTimeAdapter`:

```typescript
provideNgxDatetimeKit({
  adapter: MyLuxonDateTimeAdapter,
})
```

See [`docs/adapter.md`](./adapter.md) for the full adapter interface and a worked Luxon example.

---

## 8 · Responsive Breakpoints

The library ships with three CSS breakpoints. Override the layout tokens to adapt them to your design system:

| Token | Default | Purpose |
|---|---|---|
| `--ngx-panel-max-width` | `800px` | Maximum panel width on desktop |
| `--ngx-panel-min-width` | `320px` | Minimum panel width |
| `--ngx-panel-mobile-max-height` | `90vh` | Bottom-sheet max height |
| `--ngx-calendar-cell-size` | `36px` | Day cell size on desktop |
| `--ngx-calendar-cell-size-mobile` | `40px` | Day cell size on mobile |
| `--ngx-touch-target` | `44px` | Min tap target (WCAG 2.5.5) |

The actual breakpoint values (`767px`, `768px`, `1280px`) are in `styles/_mixins.scss` and cannot be changed via tokens. If you need different breakpoints, you can override the BEM classes inside your own media queries:

```css
/* Treat anything above 1024 px as "desktop" in your own override */
@media (min-width: 1024px) {
  .ngx-presets {
    flex: 0 0 160px;
    flex-direction: column;
    border-right: 1px solid var(--ngx-divider);
    border-bottom: none;
  }
}
```

