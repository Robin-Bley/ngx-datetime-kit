import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { NgxDateTimeAdapter } from '../../../adapters/date-time-adapter';
import { NGX_DATE_TIME_FORMATS } from '../../../tokens/date-time-formats.token';
import { NGX_DATE_TIME_ADAPTER } from '../../../tokens/date-time-adapter.token';
import { NGX_LABELS } from '../../../tokens/labels.token';
import { buildCalendarGrid } from '../../../utilities/date-utils';

export interface CalendarCell<D> {
  date: D;
  isCurrentMonth: boolean;
  dayNumber: number;
}

/**
 * Shared calendar grid component.
 * Renders a single month with navigation arrows and emits day selections.
 * Supports range highlighting when both rangeStart and rangeEnd are provided.
 *
 * Design decision: This is a "dumb" component — it renders whatever state
 * is passed in via inputs and delegates all decisions to the parent picker.
 */
@Component({
  selector: 'ngx-calendar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngx-calendar.component.html',
  styleUrl: './ngx-calendar.component.scss',
})
export class NgxCalendarComponent<D> {
  private readonly adapter: NgxDateTimeAdapter<D> = inject<NgxDateTimeAdapter<D>>(NGX_DATE_TIME_ADAPTER as never);
  private readonly formats = inject(NGX_DATE_TIME_FORMATS);
  protected readonly labels = inject(NGX_LABELS);

  /** Displayed month (0-based). */
  public readonly viewMonth = input.required<number>();
  /** Displayed year. */
  public readonly viewYear = input.required<number>();
  /** Currently selected single date (for date/datetime pickers). */
  public readonly selectedDate = input<D | null>(null);
  /** Range start. */
  public readonly rangeStart = input<D | null>(null);
  /** Range end. */
  public readonly rangeEnd = input<D | null>(null);
  /** Hover candidate (for range hover preview). */
  public readonly hoverDate = input<D | null>(null);
  /** Min selectable date. */
  public readonly minDate = input<D | null>(null);
  /** Max selectable date. */
  public readonly maxDate = input<D | null>(null);
  /** Disabled individual dates. */
  public readonly disabledDates = input<D[]>([]);
  /** Show/hide navigation arrows. */
  public readonly showPrevNav = input<boolean>(true);
  public readonly showNextNav = input<boolean>(true);

  public readonly daySelected = output<D>();
  public readonly onDayHover = output<D>();
  public readonly prevMonthClicked = output<void>();
  public readonly nextMonthClicked = output<void>();

  protected readonly weekdayNames = computed<string[]>(() =>
    this.adapter.getWeekdayNames('narrow', this.adapter.getFirstDayOfWeek()),
  );

  protected readonly monthNames = computed<string[]>(() => this.adapter.getMonthNames('long'));

  protected readonly monthYearLabel = computed<string>(() => {
    const monthName: string = this.monthNames()[this.viewMonth()];
    return `${monthName} ${this.viewYear()}`;
  });

  protected readonly cells = computed<CalendarCell<D>[]>(() =>
    buildCalendarGrid(
      this.viewYear(),
      this.viewMonth(),
      this.adapter.getFirstDayOfWeek(),
      this.adapter,
    ).map((cell): CalendarCell<D> => ({
      date: cell.date,
      isCurrentMonth: cell.isCurrentMonth,
      dayNumber: this.adapter.getDate(cell.date),
    })),
  );

  protected isToday(date: D): boolean {
    return this.adapter.isSameDay(date, this.adapter.today());
  }

  protected isSelected(date: D): boolean {
    const selectedDate: D | null = this.selectedDate();
    return selectedDate !== null && this.adapter.isSameDay(date, selectedDate);
  }

  protected isRangeStart(date: D): boolean {
    const rangeStart: D | null = this.rangeStart();
    return rangeStart !== null && this.adapter.isSameDay(date, rangeStart);
  }

  protected isRangeEnd(date: D): boolean {
    const rangeEnd: D | null = this.rangeEnd();
    return rangeEnd !== null && this.adapter.isSameDay(date, rangeEnd);
  }

  protected isInRange(date: D): boolean {
    const start: D | null = this.rangeStart();
    const end: D | null = this.rangeEnd() ?? this.hoverDate();
    if (start === null || end === null) {
      return false;
    }
    if (this.adapter.compareDateOnly(start, end) > 0) {
      return this.adapter.isInRangeDateOnly(date, end, start);
    }
    return this.adapter.isInRangeDateOnly(date, start, end);
  }

  protected isDisabled(date: D): boolean {
    const minDate: D | null = this.minDate();
    const maxDate: D | null = this.maxDate();
    if (minDate !== null && this.adapter.compareDateOnly(date, minDate) < 0) {
      return true;
    }
    if (maxDate !== null && this.adapter.compareDateOnly(date, maxDate) > 0) {
      return true;
    }
    return this.disabledDates().some((disabledDate: D): boolean => this.adapter.isSameDay(disabledDate, date));
  }

  protected dayAriaLabel(date: D): string {
    return this.adapter.format(date, this.formats.display.dateInput);
  }

  protected onDayClick(date: D): void {
    if (!this.isDisabled(date)) {
      this.daySelected.emit(date);
    }
  }

  protected onPrevMonth(): void {
    this.prevMonthClicked.emit();
  }

  protected onNextMonth(): void {
    this.nextMonthClicked.emit();
  }
}
