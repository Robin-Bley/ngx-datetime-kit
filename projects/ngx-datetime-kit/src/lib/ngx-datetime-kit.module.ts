import { NgModule } from '@angular/core';
import { NGX_DATE_TIME_ADAPTER } from './tokens/date-time-adapter.token';
import { NgxNativeDateTimeAdapter } from './adapters/native-date-time-adapter';
import { NgxDateTimeRangePickerComponent } from './components/date-time-range-picker/ngx-date-time-range-picker.component';
import { NgxDateRangePickerComponent } from './components/date-range-picker/ngx-date-range-picker.component';
import { NgxDateTimePickerComponent } from './components/date-time-picker/ngx-date-time-picker.component';
import { NgxDatePickerComponent } from './components/date-picker/ngx-date-picker.component';
import { NgxTimePickerComponent } from './components/time-picker/ngx-time-picker.component';
import { NgxCalendarComponent } from './components/shared/calendar/ngx-calendar.component';
import { NgxTimeSelectorComponent } from './components/shared/time-selector/ngx-time-selector.component';
import { NgxPresetsPanelComponent } from './components/shared/presets-panel/ngx-presets-panel.component';

/** Convenience NgModule for apps not using standalone imports. */
@NgModule({
  imports: [
    NgxDateTimeRangePickerComponent,
    NgxDateRangePickerComponent,
    NgxDateTimePickerComponent,
    NgxDatePickerComponent,
    NgxTimePickerComponent,
    NgxCalendarComponent,
    NgxTimeSelectorComponent,
    NgxPresetsPanelComponent,
  ],
  exports: [
    NgxDateTimeRangePickerComponent,
    NgxDateRangePickerComponent,
    NgxDateTimePickerComponent,
    NgxDatePickerComponent,
    NgxTimePickerComponent,
    NgxCalendarComponent,
    NgxTimeSelectorComponent,
    NgxPresetsPanelComponent,
  ],
  providers: [
    { provide: NGX_DATE_TIME_ADAPTER, useClass: NgxNativeDateTimeAdapter },
  ],
})
export class NgxDatetimeKitModule {}

