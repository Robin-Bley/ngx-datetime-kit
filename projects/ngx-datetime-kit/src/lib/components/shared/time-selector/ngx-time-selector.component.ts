import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NGX_LABELS } from '../../../tokens/labels.token';
import { TimeValue, createTimeValue } from '../../../models/time-value.model';

type TimeSegment = 'hours' | 'minutes' | 'seconds';

/**
 * Reusable time selector component.
 * Supports arrow-key stepping and direct digit entry without using a text input.
 */
@Component({
  selector: 'ngx-time-selector',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ngx-time-selector.component.html',
  styleUrl: './ngx-time-selector.component.scss',
})
export class NgxTimeSelectorComponent {
  private readonly keyboardBufferTimeoutMs: number = 1000;

  private readonly hoursBuffer = signal<string>('');
  private readonly minutesBuffer = signal<string>('');
  private readonly secondsBuffer = signal<string>('');
  private readonly hoursLastTypedAt = signal<number>(0);
  private readonly minutesLastTypedAt = signal<number>(0);
  private readonly secondsLastTypedAt = signal<number>(0);

  protected readonly labels = inject(NGX_LABELS);

  public readonly value = model.required<TimeValue>();
  public readonly showSeconds = input<boolean>(true);
  public readonly label = input<string>('');

  public readonly timeChanged = output<TimeValue>();

  protected readonly effectiveLabel = computed<string>(() => this.label() || this.labels.selectTime);

  protected padded(value: number): string {
    return String(value).padStart(2, '0');
  }

  protected changeHours(delta: number): void {
    const currentValue: TimeValue = this.value();
    const nextHours: number = (currentValue.hours + delta + 24) % 24;
    const nextValue: TimeValue = createTimeValue(nextHours, currentValue.minutes, currentValue.seconds);
    this.emitTimeChange(nextValue);
  }

  protected changeMinutes(delta: number): void {
    const currentValue: TimeValue = this.value();
    let nextMinutes: number = currentValue.minutes + delta;
    let nextHours: number = currentValue.hours;

    if (nextMinutes < 0) {
      nextMinutes = 59;
      nextHours = (nextHours - 1 + 24) % 24;
    } else if (nextMinutes > 59) {
      nextMinutes = 0;
      nextHours = (nextHours + 1) % 24;
    }

    const nextValue: TimeValue = createTimeValue(nextHours, nextMinutes, currentValue.seconds);
    this.emitTimeChange(nextValue);
  }

  protected changeSeconds(delta: number): void {
    const currentValue: TimeValue = this.value();
    let nextSeconds: number = currentValue.seconds + delta;
    let nextMinutes: number = currentValue.minutes;
    let nextHours: number = currentValue.hours;

    if (nextSeconds < 0) {
      nextSeconds = 59;
      nextMinutes -= 1;
      if (nextMinutes < 0) {
        nextMinutes = 59;
        nextHours = (nextHours - 1 + 24) % 24;
      }
    } else if (nextSeconds > 59) {
      nextSeconds = 0;
      nextMinutes += 1;
      if (nextMinutes > 59) {
        nextMinutes = 0;
        nextHours = (nextHours + 1) % 24;
      }
    }

    const nextValue: TimeValue = createTimeValue(nextHours, nextMinutes, nextSeconds);
    this.emitTimeChange(nextValue);
  }

  protected onHoursKeydown(event: KeyboardEvent): void {
    this.handleSegmentKeydown(event, 'hours');
  }

  protected onMinutesKeydown(event: KeyboardEvent): void {
    this.handleSegmentKeydown(event, 'minutes');
  }

  protected onSecondsKeydown(event: KeyboardEvent): void {
    this.handleSegmentKeydown(event, 'seconds');
  }

  private emitTimeChange(nextValue: TimeValue): void {
    this.value.set(nextValue);
    this.timeChanged.emit(nextValue);
  }

  private handleSegmentKeydown(event: KeyboardEvent, segment: TimeSegment): void {
    const key: string = event.key;

    if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
      this.clearSegment(segment);
      return;
    }

    if (!/^\d$/.test(key)) {
      return;
    }

    event.preventDefault();

    const digit: number = parseInt(key, 10);
    const now: number = Date.now();
    const maxValue: number = segment === 'hours' ? 23 : 59;
    const maxFirstDigit: number = segment === 'hours' ? 2 : 5;
    const buffer: string = this.getActiveBuffer(segment, now);

    if (buffer.length === 0) {
      if (digit > maxFirstDigit) {
        // Digit cannot be the first digit of a valid two-digit value,
        // so accept it immediately as a standalone value.
        this.setSegmentValue(segment, digit);
        this.resetBuffer(segment);
        // No automatic focus change — user presses Tab or ArrowRight manually.
        return;
      }

      // Digit could be the first of a two-digit value; buffer it and wait.
      this.setSegmentBuffer(segment, key, now);
      this.setSegmentValue(segment, digit);
      return;
    }

    const candidate: string = `${buffer}${key}`;
    const candidateValue: number = parseInt(candidate, 10);

    if (candidateValue <= maxValue) {
      // Two-digit entry is complete and valid.
      this.setSegmentValue(segment, candidateValue);
      this.resetBuffer(segment);
      // No automatic focus change — user navigates manually.
      return;
    }

    if (digit > maxFirstDigit) {
      // Candidate exceeds max and new digit also can't start a two-digit value.
      this.setSegmentValue(segment, digit);
      this.resetBuffer(segment);
      return;
    }

    // Candidate exceeds max but new digit could still start a valid two-digit
    // value; replace the buffer with the new digit.
    this.setSegmentBuffer(segment, key, now);
    this.setSegmentValue(segment, digit);
  }

  private getActiveBuffer(segment: TimeSegment, now: number): string {
    const buffer: string = this.getSegmentBuffer(segment);
    const lastTypedAt: number = this.getLastTypedAt(segment);
    return now - lastTypedAt <= this.keyboardBufferTimeoutMs ? buffer : '';
  }

  private getSegmentBuffer(segment: TimeSegment): string {
    switch (segment) {
      case 'hours':
        return this.hoursBuffer();
      case 'minutes':
        return this.minutesBuffer();
      case 'seconds':
        return this.secondsBuffer();
      default:
        return '';
    }
  }

  private getLastTypedAt(segment: TimeSegment): number {
    switch (segment) {
      case 'hours':
        return this.hoursLastTypedAt();
      case 'minutes':
        return this.minutesLastTypedAt();
      case 'seconds':
        return this.secondsLastTypedAt();
      default:
        return 0;
    }
  }

  private setSegmentBuffer(segment: TimeSegment, value: string, typedAt: number): void {
    switch (segment) {
      case 'hours':
        this.hoursBuffer.set(value);
        this.hoursLastTypedAt.set(typedAt);
        return;
      case 'minutes':
        this.minutesBuffer.set(value);
        this.minutesLastTypedAt.set(typedAt);
        return;
      case 'seconds':
        this.secondsBuffer.set(value);
        this.secondsLastTypedAt.set(typedAt);
        return;
      default:
        return;
    }
  }

  private resetBuffer(segment: TimeSegment): void {
    this.setSegmentBuffer(segment, '', 0);
  }

  private clearSegment(segment: TimeSegment): void {
    this.resetBuffer(segment);
    this.setSegmentValue(segment, 0);
  }

  private setSegmentValue(segment: TimeSegment, segmentValue: number): void {
    const currentValue: TimeValue = this.value();

    switch (segment) {
      case 'hours': {
        const nextValue: TimeValue = createTimeValue(segmentValue, currentValue.minutes, currentValue.seconds);
        this.emitTimeChange(nextValue);
        return;
      }
      case 'minutes': {
        const nextValue: TimeValue = createTimeValue(currentValue.hours, segmentValue, currentValue.seconds);
        this.emitTimeChange(nextValue);
        return;
      }
      case 'seconds': {
        const nextValue: TimeValue = createTimeValue(currentValue.hours, currentValue.minutes, segmentValue);
        this.emitTimeChange(nextValue);
        return;
      }
      default:
        return;
    }
  }
}
