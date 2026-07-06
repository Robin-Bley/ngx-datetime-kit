# Forms Integration Guide

## Overview

ngx-datetime-kit fully supports both **Reactive Forms** and **Signal-based** forms. Both approaches use the same underlying validation logic — no duplication.

---

## Example 1: DateTimeRangePicker with Reactive Forms

```typescript
import { Component, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  NgxDateTimeRangePickerComponent,
  ngxDateRangeValidator,
  NGX_DATE_TIME_ADAPTER,
  NgxDateTimeAdapter,
  DateTimeRange,
} from 'ngx-datetime-kit';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, NgxDateTimeRangePickerComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <ngx-date-time-range-picker
        formControlName="range"
        [invalid]="form.get('range')?.invalid && form.get('range')?.touched"
      />
      @if (form.get('range')?.errors?.required && form.get('range')?.touched) {
        <div>Required</div>
      }
      @if (form.get('range')?.errors?.ngxEndBeforeStart) {
        <div>End must be after start</div>
      }
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `,
})
export class MyComponent {
  private readonly adapter = inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER);

  form = new FormGroup({
    range: new FormControl<DateTimeRange<Date> | null>(null, [
      Validators.required,
      ngxDateRangeValidator(this.adapter),
    ]),
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      console.log(this.form.value.range);
    }
  }
}
```

### Available Validators

| Validator | Description |
|-----------|-------------|
| `ngxDateRangeValidator(adapter, minDate?, maxDate?)` | Range consistency + min/max |
| `endAfterStartValidator(adapter)` | Cross-field group validator |
| `ngxMinDateValidator(adapter, minDate)` | Single date min constraint |
| `ngxMaxDateValidator(adapter, maxDate)` | Single date max constraint |

---

## Example 2: DateTimeRangePicker with Signal Forms

```typescript
import { Component, inject, computed } from '@angular/core';
import {
  NgxDateTimeRangePickerComponent,
  createDateTimeRangeSignalField,
  NGX_DATE_TIME_ADAPTER,
  NgxDateTimeAdapter,
} from 'ngx-datetime-kit';

@Component({
  standalone: true,
  imports: [NgxDateTimeRangePickerComponent],
  template: `
    <ngx-date-time-range-picker
      [(value)]="rangeField.value"
      [invalid]="rangeField.touched() && rangeField.errors() !== null"
    />

    @if (rangeField.touched() && rangeField.errors()?.ngxEndBeforeStart) {
      <div>End must be after start</div>
    }

    <button [disabled]="!canSubmit()" (click)="submit()">Submit</button>
  `,
})
export class MySignalComponent {
  private readonly adapter = inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER);

  rangeField = createDateTimeRangeSignalField(this.adapter, null, {
    minDate: new Date(),
  });

  canSubmit = computed(() => this.rangeField.valid() && this.rangeField.value() !== null);

  submit(): void {
    this.rangeField.markAsTouched();
    if (this.canSubmit()) {
      console.log(this.rangeField.value());
    }
  }
}
```

### NgxSignalField API

```typescript
interface NgxSignalField<T> {
  value: WritableSignal<T>;          // Bind to [(value)]
  errors: Signal<ValidationErrors | null>;  // Computed
  valid: Signal<boolean>;            // Computed
  touched: Signal<boolean>;          // Touched flag
  markAsTouched(): void;
}
```

---

## When to Use Which

| Scenario | Recommendation |
|----------|----------------|
| Existing app with FormGroup infrastructure | **Reactive Forms** |
| New components built entirely with Signals | **Signal Forms** |
| Mixed codebase | Both work side-by-side |
| Server-side validation, async validators | **Reactive Forms** (more mature) |
| Simple, reactive UI without forms overhead | **Signal Forms** |

---

## Advanced: Custom Signal Validator

```typescript
import { createSignalField, validateDateRangeCore } from 'ngx-datetime-kit';

const field = createSignalField<DateTimeRange<Date> | null>(
  null,
  (value) => {
    const coreErrors = validateDateRangeCore(value, adapter);
    if (coreErrors) return coreErrors;

    if (value?.start && adapter.getDayOfWeek(value.start) === 0) {
      return { noSunday: true };
    }
    return null;
  },
);
```

The `validateDateRangeCore` function is the single source of truth shared by all validation paths.
