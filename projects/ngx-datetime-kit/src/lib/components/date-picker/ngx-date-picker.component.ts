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
import { NgxCalendarComponent } from '../shared/calendar/ngx-calendar.component';

/**
 * Date-only picker. Opens a single calendar in a panel.
 */
@Component({
  selector: 'ngx-date-picker',
  standalone: true,
  imports: [NgxCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxDatePickerComponent),
    multi: true,
  }],
  templateUrl: './ngx-date-picker.component.html',
  styleUrl: './ngx-date-picker.component.scss',
})
export class NgxDatePickerComponent<D> implements ControlValueAccessor {
  private readonly adapter: NgxDateTimeAdapter<D> = inject<NgxDateTimeAdapter<D>>(NGX_DATE_TIME_ADAPTER as never);
  private readonly formats = inject(NGX_DATE_TIME_FORMATS);
  protected readonly labels = inject(NGX_LABELS);
  private readonly today = this.adapter.today();

  public readonly value = model<D | null>(null);
  public readonly placeholder = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly minDate = input<D | null>(null);
  public readonly maxDate = input<D | null>(null);

  protected readonly isOpen = signal<boolean>(false);
  protected readonly viewMonth = signal<number>(this.adapter.getMonth(this.today));
  protected readonly viewYear = signal<number>(this.adapter.getYear(this.today));

  protected readonly displayValue = computed<string | null>(() => {
    const currentValue: D | null = this.value();
    if (currentValue === null || !this.adapter.isValid(currentValue)) {
      return null;
    }
    return this.adapter.format(currentValue, this.formats.display.dateInput);
  });

  protected readonly placeholderText = computed<string>(
    () => this.placeholder() || this.formats.display.dateInput,
  );

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
    this.isOpen() ? this.closePanel() : this.openPanel();
  }

  protected openPanel(): void {
    if (this.disabled()) {
      return;
    }
    const referenceDate: D = this.value() ?? this.adapter.today();
    this.viewMonth.set(this.adapter.getMonth(referenceDate));
    this.viewYear.set(this.adapter.getYear(referenceDate));
    this.isOpen.set(true);
  }

  protected closePanel(): void {
    this.isOpen.set(false);
    this.onTouched();
  }

  protected onDaySelected(date: D): void {
    this.value.set(date);
    this.onChange(date);
    this.onTouched();
    this.closePanel();
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
