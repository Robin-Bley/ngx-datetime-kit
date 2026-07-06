import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
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
import { DateTimeRange } from '../../models/date-range.model';
import { TimeValue, createTimeValue } from '../../models/time-value.model';
import { RangePreset } from '../../models/preset.model';
import { NgxCalendarComponent } from '../shared/calendar/ngx-calendar.component';
import { NgxPickerPanelCoordinatorService } from '../shared/picker-panel/ngx-picker-panel-coordinator.service';
import { NgxTimeSelectorComponent } from '../shared/time-selector/ngx-time-selector.component';
import { NgxPresetsPanelComponent } from '../shared/presets-panel/ngx-presets-panel.component';
import { formatDuration } from '../../utilities/date-utils';

/**
 * DateTime Range Picker — dual calendar, start/end time selectors,
 * presets, responsive panel behavior, and CVA + signal-model integration.
 */
@Component({
  selector: 'ngx-date-time-range-picker',
  standalone: true,
  imports: [
    NgxCalendarComponent,
    NgxTimeSelectorComponent,
    NgxPresetsPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxDateTimeRangePickerComponent),
      multi: true,
    },
  ],
  templateUrl: './ngx-date-time-range-picker.component.html',
  styleUrl: './ngx-date-time-range-picker.component.scss',
})
export class NgxDateTimeRangePickerComponent<D> implements ControlValueAccessor {
  private readonly adapter: NgxDateTimeAdapter<D> = inject<NgxDateTimeAdapter<D>>(NGX_DATE_TIME_ADAPTER as never);
  private readonly elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly formats = inject(NGX_DATE_TIME_FORMATS);
  protected readonly labels = inject(NGX_LABELS);
  private readonly panelCoordinator: NgxPickerPanelCoordinatorService = inject(NgxPickerPanelCoordinatorService);
  private readonly today = this.adapter.today();

  /** Two-way bindable value — works directly with Signal Forms `model()`. */
  public readonly value = model<DateTimeRange<D> | null>(null);
  public readonly placeholder = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly showSeconds = input<boolean>(true);
  public readonly minDate = input<D | null>(null);
  public readonly maxDate = input<D | null>(null);
  /** Custom presets — if omitted, default presets are shown. */
  public readonly customPresets = input<RangePreset<D>[] | null>(null);

  protected readonly isOpen = signal<boolean>(false);
  protected readonly pendingStart = signal<D | null>(null);
  protected readonly pendingEnd = signal<D | null>(null);
  protected readonly pendingStartTime = signal<TimeValue>(createTimeValue(0, 0, 0));
  protected readonly pendingEndTime = signal<TimeValue>(createTimeValue(23, 59, 59));
  protected readonly hoverDate = signal<D | null>(null);
  protected readonly activePresetKey = signal<string | null>('custom');
  protected readonly leftMonth = signal<number>(this.adapter.getMonth(this.today));
  protected readonly leftYear = signal<number>(this.adapter.getYear(this.today));
  protected readonly rightMonth = computed<number>(() => (this.leftMonth() + 1) % 12);
  protected readonly rightYear = computed<number>(() => this.leftMonth() === 11 ? this.leftYear() + 1 : this.leftYear());

  protected readonly displayValue = computed<string | null>(() => {
    const currentValue: DateTimeRange<D> | null = this.value();
    if (currentValue?.start === null || currentValue?.end === null || currentValue === null) {
      return null;
    }
    const format: string = this.formats.display.dateTimeInput;
    return `${this.adapter.format(currentValue.start, format)} – ${this.adapter.format(currentValue.end, format)}`;
  });

  protected readonly placeholderText = computed<string>(
    () => this.placeholder() || `${this.formats.display.dateTimeInput} – ${this.formats.display.dateTimeInput}`,
  );

  protected readonly rangePreviewText = computed<string | null>(() => {
    const start: D | null = this.pendingStart();
    const end: D | null = this.pendingEnd();
    if (start === null) {
      return null;
    }

    const format: string = this.formats.display.dateTimeInput;
    const startTime: TimeValue = this.pendingStartTime();
    const startValue: D = this.adapter.setTime(start, startTime.hours, startTime.minutes, startTime.seconds);
    const startText: string = this.adapter.format(startValue, format);

    if (end === null) {
      return startText;
    }

    const endTime: TimeValue = this.pendingEndTime();
    const endValue: D = this.adapter.setTime(end, endTime.hours, endTime.minutes, endTime.seconds);
    return `${startText} – ${this.adapter.format(endValue, format)}`;
  });

  protected readonly durationText = computed<string | null>(() => {
    const startDate: D | null = this.pendingStart();
    const endDate: D | null = this.pendingEnd();
    if (startDate === null || endDate === null) {
      return null;
    }

    const startTime: TimeValue = this.pendingStartTime();
    const endTime: TimeValue = this.pendingEndTime();
    const startValue: D = this.adapter.setTime(startDate, startTime.hours, startTime.minutes, startTime.seconds);
    const endValue: D = this.adapter.setTime(endDate, endTime.hours, endTime.minutes, endTime.seconds);

    if (this.adapter.compare(startValue, endValue) > 0) {
      return null;
    }

    const durationMs: number = this.adapter.diffInMs(startValue, endValue);
    return formatDuration(durationMs);
  });

  protected readonly canApply = computed<boolean>(() => this.pendingStart() !== null && this.pendingEnd() !== null);

  protected readonly effectivePresets = computed<RangePreset<D>[]>(() => {
    const providedPresets: RangePreset<D>[] | null = this.customPresets();
    if (providedPresets !== null) {
      return providedPresets;
    }

    const adapter: NgxDateTimeAdapter<D> = this.adapter;
    return [
      {
        key: 'today',
        label: this.labels.today,
        getRangeFn: (): { start: D; end: D } => ({ start: adapter.today(), end: adapter.today() }),
      },
      {
        key: 'last24h',
        label: this.labels.last24h,
        getRangeFn: (): { start: D; end: D } => ({ start: adapter.addHours(adapter.now(), -24), end: adapter.now() }),
      },
      {
        key: 'thisWeek',
        label: this.labels.thisWeek,
        getRangeFn: (): { start: D; end: D } => {
          const now: D = adapter.today();
          const dayOfWeek: number = adapter.getDayOfWeek(now);
          const diff: number = (dayOfWeek - adapter.getFirstDayOfWeek() + 7) % 7;
          const start: D = adapter.addDays(now, -diff);
          // Always show the full 7-day week so the preset is never a no-op
          // (e.g. when today is the first day of the week, end ≠ start).
          return { start, end: adapter.addDays(start, 6) };
        },
      },
      {
        key: 'last7Days',
        label: this.labels.last7Days,
        getRangeFn: (): { start: D; end: D } => ({ start: adapter.addDays(adapter.today(), -6), end: adapter.today() }),
      },
      {
        key: 'thisMonth',
        label: this.labels.thisMonth,
        getRangeFn: (): { start: D; end: D } => {
          const now: D = adapter.today();
          return {
            start: adapter.createDate(adapter.getYear(now), adapter.getMonth(now), 1),
            end: now,
          };
        },
      },
      {
        key: 'custom',
        label: this.labels.custom,
        getRangeFn: (): { start: D; end: D } => ({ start: adapter.today(), end: adapter.today() }),
      },
    ];
  });

  private onChange: (value: DateTimeRange<D> | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy((): void => {
      this.panelCoordinator.unregister(this);
    });
  }

  writeValue(value: DateTimeRange<D> | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: DateTimeRange<D> | null) => void): void {
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

    if (this.isOpen()) {
      this.cancelPanel();

      return;
    }

    this.openPanel();
  }

  protected openPanel(): void {
    if (this.disabled() || this.isOpen()) {

      return;
    }

    const currentValue: DateTimeRange<D> | null = this.value();
    if (currentValue?.start !== null && currentValue?.start !== undefined) {
      this.pendingStart.set(this.adapter.startOfDay(currentValue.start));
      this.pendingStartTime.set(
        createTimeValue(
          this.adapter.getHours(currentValue.start),
          this.adapter.getMinutes(currentValue.start),
          this.adapter.getSeconds(currentValue.start),
        ),
      );
    } else {
      this.pendingStart.set(null);
      this.pendingStartTime.set(createTimeValue(0, 0, 0));
    }

    if (currentValue?.end !== null && currentValue?.end !== undefined) {
      this.pendingEnd.set(this.adapter.startOfDay(currentValue.end));
      this.pendingEndTime.set(
        createTimeValue(
          this.adapter.getHours(currentValue.end),
          this.adapter.getMinutes(currentValue.end),
          this.adapter.getSeconds(currentValue.end),
        ),
      );
    } else {
      this.pendingEnd.set(null);
      this.pendingEndTime.set(createTimeValue(23, 59, 59));
    }

    const referenceDate: D = this.pendingStart() ?? this.adapter.today();
    this.leftMonth.set(this.adapter.getMonth(referenceDate));
    this.leftYear.set(this.adapter.getYear(referenceDate));
    this.isOpen.set(true);
    this.panelCoordinator.requestOpen(
      this,
      this.elementRef.nativeElement,
      (): void => {
        this.closePanelInternal(true);
      },
    );
  }

  protected cancelPanel(): void {
    this.closePanelInternal(true);
  }

  protected applyPanel(): void {
    const startDate: D | null = this.pendingStart();
    const endDate: D | null = this.pendingEnd();
    if (startDate === null || endDate === null) {

      return;
    }

    const startTime: TimeValue = this.pendingStartTime();
    const endTime: TimeValue = this.pendingEndTime();
    const startValue: D = this.adapter.setTime(startDate, startTime.hours, startTime.minutes, startTime.seconds);
    const endValue: D = this.adapter.setTime(endDate, endTime.hours, endTime.minutes, endTime.seconds);

    const nextValue: DateTimeRange<D> = { start: startValue, end: endValue };
    this.value.set(nextValue);
    this.onChange(nextValue);
    this.onTouched();
    this.activePresetKey.set('custom');
    this.closePanelInternal(false);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  protected onDaySelected(date: D): void {
    const pendingStart: D | null = this.pendingStart();
    const pendingEnd: D | null = this.pendingEnd();

    this.activePresetKey.set('custom');

    if (pendingStart === null || pendingEnd !== null) {
      this.pendingStart.set(date);
      this.pendingEnd.set(null);
      this.hoverDate.set(null);
      return;
    }

    if (this.adapter.compareDateOnly(date, pendingStart) < 0) {
      this.pendingEnd.set(pendingStart);
      this.pendingStart.set(date);
    } else {
      this.pendingEnd.set(date);
    }
    this.hoverDate.set(null);
  }

  protected onPresetSelected(preset: RangePreset<D>): void {
    if (preset.key === 'custom') {
      this.activePresetKey.set('custom');
      return;
    }

    const range: { start: D; end: D } = preset.getRangeFn();
    this.pendingStart.set(this.adapter.startOfDay(range.start));
    this.pendingEnd.set(this.adapter.startOfDay(range.end));
    this.pendingStartTime.set(
      createTimeValue(
        this.adapter.getHours(range.start),
        this.adapter.getMinutes(range.start),
        this.adapter.getSeconds(range.start),
      ),
    );
    this.pendingEndTime.set(
      createTimeValue(
        this.adapter.getHours(range.end),
        this.adapter.getMinutes(range.end),
        this.adapter.getSeconds(range.end),
      ),
    );
    this.leftMonth.set(this.adapter.getMonth(range.start));
    this.leftYear.set(this.adapter.getYear(range.start));
    this.activePresetKey.set(preset.key);
  }

  protected onStartTimeChanged(time: TimeValue): void {
    this.pendingStartTime.set(time);
    this.activePresetKey.set('custom');
  }

  protected onEndTimeChanged(time: TimeValue): void {
    this.pendingEndTime.set(time);
    this.activePresetKey.set('custom');
  }

  protected navigateLeft(delta: number): void {
    let nextMonth: number = this.leftMonth() + delta;
    let nextYear: number = this.leftYear();

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear -= 1;
    } else if (nextMonth > 11) {
      nextMonth = 0;
      nextYear += 1;
    }

    this.leftMonth.set(nextMonth);
    this.leftYear.set(nextYear);
  }

  protected navigateRight(delta: number): void {
    this.navigateLeft(delta);
  }

  private closePanelInternal(markAsTouched: boolean): void {
    this.isOpen.set(false);
    this.panelCoordinator.notifyClosed(this);

    if (markAsTouched) {
      this.onTouched();
    }
  }
}

