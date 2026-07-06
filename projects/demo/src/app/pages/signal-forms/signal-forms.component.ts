import { Component, computed, inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  createDateTimeRangeSignalField,
  createSignalField,
  NGX_DATE_TIME_ADAPTER,
  NgxDatePickerComponent,
  NgxDateTimeAdapter,
  NgxDateTimeRangePickerComponent,
  ngxMinDateValidator,
} from 'ngx-datetime-kit';

@Component({
  selector: 'demo-signal-forms',
  standalone: true,
  imports: [
    JsonPipe,
    NgxDateTimeRangePickerComponent,
    NgxDatePickerComponent,
  ],
  templateUrl: './signal-forms.component.html',
  styleUrl: './signal-forms.component.scss',
})
export class SignalFormsPageComponent {
  private readonly adapter: NgxDateTimeAdapter<Date> = inject<NgxDateTimeAdapter<Date>>(NGX_DATE_TIME_ADAPTER as never);

  public readonly today: Date = this.adapter.today();
  public readonly rangeField = createDateTimeRangeSignalField(this.adapter);
  public readonly dateField = createSignalField<Date | null>(
    null,
    (value: Date | null) => value ? ngxMinDateValidator(this.adapter, this.today)({ value } as never) : null,
  );
  public readonly isFormValid = computed<boolean>(() =>
    this.rangeField.valid() && this.dateField.valid() && this.rangeField.value() !== null,
  );

  public onSubmit(): void {
    this.rangeField.markAsTouched();
    this.dateField.markAsTouched();
    if (this.isFormValid()) {
      console.log('Signal form submitted:', {
        range: this.rangeField.value(),
        date: this.dateField.value(),
      });
    }
  }

  public resetForm(): void {
    this.rangeField.value.set(null);
    this.dateField.value.set(null);
  }
}
