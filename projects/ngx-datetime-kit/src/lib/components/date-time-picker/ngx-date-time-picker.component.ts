import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgxDateTimeAdapter } from '../../adapters/date-time-adapter';
import { NGX_DATE_TIME_ADAPTER } from '../../tokens/date-time-adapter.token';
import { NGX_DATE_TIME_FORMATS } from '../../tokens/date-time-formats.token';
import { NGX_LABELS } from '../../tokens/labels.token';
import { TimeValue, createTimeValue } from '../../models/time-value.model';
import { NgxCalendarComponent } from '../shared/calendar/ngx-calendar.component';
import { NgxTimeSelectorComponent } from '../shared/time-selector/ngx-time-selector.component';

/**
 * DateTime picker: calendar + time selector in a single panel.
 */
@Component({
  selector: 'ngx-date-time-picker',
  standalone: true,
  imports: [NgxCalendarComponent, NgxTimeSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxDateTimePickerComponent),
    multi: true,
  }],
  templateUrl: './ngx-date-time-picker.component.html',
  styleUrl: './ngx-date-time-picker.component.scss',
})
export class NgxDateTimePickerComponent<D> implements ControlValueAccessor {
  private readonly adapter: NgxDateTimeAdapter<D> = inject<NgxDateTimeAdapter<D>>(NGX_DATE_TIME_ADAPTER as never);
  private readonly formats = inject(NGX_DATE_TIME_FORMATS);
  protected readonly labels = inject(NGX_LABELS);
  private readonly today = this.adapter.today();

  public readonly value = model<D | null>(null);
  public readonly placeholder = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly showSeconds = input<boolean>(true);
  public readonly minDate = input<D | null>(null);
  public readonly maxDate = input<D | null>(null);

  protected readonly isOpen = signal<boolean>(false);
  protected readonly viewMonth = signal<number>(this.adapter.getMonth(this.today));
  protected readonly viewYear = signal<number>(this.adapter.getYear(this.today));
  protected readonly pendingDate = signal<D | null>(null);
  protected readonly pendingTime = signal<TimeValue>(createTimeValue(0, 0, 0));

  protected readonly displayValue = computed<string | null>(() => {
    const currentValue: D | null = this.value();
    if (currentValue === null || !this.adapter.isValid(currentValue)) {
      return null;
    }
    return this.adapter.format(currentValue, this.formats.display.dateTimeInput);
  });

  protected readonly placeholderText = computed<string>(
    () => this.placeholder() || this.formats.display.dateTimeInput,
  );

  protected readonly previewText = computed<string>(() => {
    const pendingDate: D | null = this.pendingDate();
    if (pendingDate === null) {
      return '';
    }
    const pendingTime: TimeValue = this.pendingTime();
    const fullValue: D = this.adapter.setTime(pendingDate, pendingTime.hours, pendingTime.minutes, pendingTime.seconds);
    return this.adapter.format(fullValue, this.formats.display.dateTimeInput);
  });

  private onChange: (value: D | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: D | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: D | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_: boolean): void {}

  protected togglePanel(): void {
    if (this.disabled()) {
      return;
    }
    this.isOpen() ? this.cancelPanel() : this.openPanel();
  }

  protected openPanel(): void {
    if (this.disabled()) {
      return;
    }

    const currentValue: D | null = this.value();
    const referenceDate: D = currentValue ?? this.adapter.today();

    this.viewMonth.set(this.adapter.getMonth(referenceDate));
    this.viewYear.set(this.adapter.getYear(referenceDate));
    this.pendingDate.set(currentValue ? this.adapter.startOfDay(currentValue) : null);
    this.pendingTime.set(
      currentValue
        ? createTimeValue(
            this.adapter.getHours(currentValue),
            this.adapter.getMinutes(currentValue),
            this.adapter.getSeconds(currentValue),
          )
        : createTimeValue(0, 0, 0),
    );
    this.isOpen.set(true);
  }

  protected cancelPanel(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  protected applyPanel(): void {
    const pendingDate: D | null = this.pendingDate();
    if (pendingDate === null) {
      return;
    }
    const pendingTime: TimeValue = this.pendingTime();
    const nextValue: D = this.adapter.setTime(pendingDate, pendingTime.hours, pendingTime.minutes, pendingTime.seconds);
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.onTouched();
    this.isOpen.set(false);
  }

  protected onDaySelected(date: D): void {
    this.pendingDate.set(date);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  protected navigate(delta: number): void {
    let nextMonth: number = this.viewMonth() + delta;
    let nextYear: number = this.viewYear();

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    this.viewMonth.set(nextMonth);
    this.viewYear.set(nextYear);
  }
}
