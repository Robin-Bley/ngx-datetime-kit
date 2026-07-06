import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  DateRange,
  DateTimeRange,
  NgxDatePickerComponent,
  NgxDateRangePickerComponent,
  NgxDateTimePickerComponent,
  NgxDateTimeRangePickerComponent,
  NgxTimePickerComponent,
  TimeValue,
} from 'ngx-datetime-kit';

@Component({
  selector: 'demo-overview',
  standalone: true,
  imports: [
    JsonPipe,
    NgxDateTimeRangePickerComponent,
    NgxDateRangePickerComponent,
    NgxDateTimePickerComponent,
    NgxDatePickerComponent,
    NgxTimePickerComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  public readonly dateTimeRange = signal<DateTimeRange<Date> | null>(null);
  public readonly dateRange = signal<DateRange<Date> | null>(null);
  public readonly dateTime = signal<Date | null>(null);
  public readonly date = signal<Date | null>(null);
  public readonly time = signal<TimeValue | null>(null);
}
