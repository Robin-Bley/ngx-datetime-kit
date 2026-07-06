import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {
  DateRange,
  DateTimeRange,
  NGX_DATE_TIME_ADAPTER,
  NgxDatePickerComponent,
  NgxDateRangePickerComponent,
  NgxDateTimePickerComponent,
  NgxDateTimeRangePickerComponent,
  NgxDateTimeAdapter,
  NgxMatFormFieldDirective,
  ngxDateRangeValidator,
} from 'ngx-datetime-kit';

/**
 * Demonstrates using ngx-datetime-kit pickers inside Angular Material
 * `<mat-form-field>` via the NgxMatFormFieldDirective.
 *
 * The directive auto-activates because its selector matches all five picker
 * element names — no extra attribute is needed.
 */
@Component({
  selector: 'demo-angular-material',
  standalone: true,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDividerModule,
    NgxDatePickerComponent,
    NgxDateTimePickerComponent,
    NgxDateRangePickerComponent,
    NgxDateTimeRangePickerComponent,
    NgxMatFormFieldDirective,
  ],
  templateUrl: './angular-material.component.html',
  styleUrl: './angular-material.component.scss',
})
export class AngularMaterialPageComponent {
  private readonly adapter: NgxDateTimeAdapter<Date> =
    inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER as never);

  protected readonly today: Date = this.adapter.today();

  // ── Basic Reactive Form ───────────────────────────────────────────────────

  public readonly basicForm: FormGroup = new FormGroup({
    date: new FormControl<Date | null>(null, [Validators.required]),
    dateTime: new FormControl<Date | null>(null),
  });

  // ── Full Range Form with Validation ──────────────────────────────────────

  public readonly rangeForm: FormGroup = new FormGroup({
    range: new FormControl<DateRange<Date> | null>(null, [
      Validators.required,
      ngxDateRangeValidator(this.adapter),
    ]),
    fullRange: new FormControl<DateTimeRange<Date> | null>(null, [
      ngxDateRangeValidator(this.adapter),
    ]),
  });

  /** Marks the form as touched so error messages become visible. */
  public onBasicSubmit(): void {
    this.basicForm.markAllAsTouched();
    if (this.basicForm.valid) {
      console.log('Basic form:', this.basicForm.value);
    }
  }

  public onRangeSubmit(): void {
    this.rangeForm.markAllAsTouched();
    if (this.rangeForm.valid) {
      console.log('Range form:', this.rangeForm.value);
    }
  }

  /** Simulates disabling a control to show the disabled state. */
  public toggleDisabled(): void {
    const ctrl: FormControl = this.basicForm.get('date') as FormControl;
    ctrl.disabled ? ctrl.enable() : ctrl.disable();
  }

  public get isDateDisabled(): boolean {
    return this.basicForm.get('date')?.disabled ?? false;
  }

  // Minimum date for the range form's lower bound
  protected readonly minDate: Date = this.adapter.addDays(this.today, -365);
}




