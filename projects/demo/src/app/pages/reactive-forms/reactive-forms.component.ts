import { Component, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DateTimeRange,
  NGX_DATE_TIME_ADAPTER,
  NgxDatePickerComponent,
  NgxDateTimeAdapter,
  NgxDateTimeRangePickerComponent,
  ngxDateRangeValidator,
  ngxMinDateValidator,
} from 'ngx-datetime-kit';

@Component({
  selector: 'demo-reactive-forms',
  standalone: true,
  imports: [
    JsonPipe,
    ReactiveFormsModule,
    NgxDateTimeRangePickerComponent,
    NgxDatePickerComponent,
  ],
  templateUrl: './reactive-forms.component.html',
  styleUrl: './reactive-forms.component.scss',
})
export class ReactiveFormsPageComponent {
  private readonly adapter: NgxDateTimeAdapter<Date> = inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER as never);

  public readonly today: Date = this.adapter.today();

  public readonly rangeForm = new FormGroup({
    range: new FormControl<DateTimeRange<Date> | null>(null, [
      Validators.required,
      ngxDateRangeValidator(this.adapter),
    ]),
    singleDate: new FormControl<Date | null>(null, [
      ngxMinDateValidator(this.adapter, this.today),
    ]),
  });

  public onRangeSubmit(): void {
    this.rangeForm.markAllAsTouched();
    if (this.rangeForm.valid) {
      console.log('Form submitted:', this.rangeForm.value);
    }
  }
}
