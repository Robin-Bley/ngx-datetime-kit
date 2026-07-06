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
import { NGX_LABELS } from '../../tokens/labels.token';
import { NGX_DATE_TIME_FORMATS } from '../../tokens/date-time-formats.token';
import { TimeValue, createTimeValue, formatTimeValue } from '../../models/time-value.model';
import { NgxTimeSelectorComponent } from '../shared/time-selector/ngx-time-selector.component';
import { NgxPickerPanelCoordinatorService } from '../shared/picker-panel/ngx-picker-panel-coordinator.service';

/**
 * Time-only picker. Opens a panel with a time selector.
 */
@Component({
  selector: 'ngx-time-picker',
  standalone: true,
  imports: [NgxTimeSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgxTimePickerComponent),
    multi: true,
  }],
  templateUrl: './ngx-time-picker.component.html',
  styleUrl: './ngx-time-picker.component.scss',
})
export class NgxTimePickerComponent implements ControlValueAccessor {
  private readonly elementRef: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly formats = inject(NGX_DATE_TIME_FORMATS);
  protected readonly labels = inject(NGX_LABELS);
  private readonly panelCoordinator: NgxPickerPanelCoordinatorService = inject(NgxPickerPanelCoordinatorService);

  public readonly value = model<TimeValue | null>(null);
  public readonly placeholder = input<string>('');
  public readonly disabled = input<boolean>(false);
  public readonly invalid = input<boolean>(false);
  public readonly showSeconds = input<boolean>(true);

  protected readonly isOpen = signal<boolean>(false);
  protected readonly pendingTime = signal<TimeValue>(createTimeValue(0, 0, 0));

  protected readonly displayValue = computed<string | null>(() => {
    const currentValue: TimeValue | null = this.value();
    if (currentValue === null) {
      return null;
    }
    return formatTimeValue(currentValue, this.showSeconds());
  });

  protected readonly placeholderText = computed<string>(
    () => this.placeholder() || this.formats.display.timeInput,
  );

  private onChange: (value: TimeValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    this.destroyRef.onDestroy((): void => {
      this.panelCoordinator.unregister(this);
    });
  }

  writeValue(value: TimeValue | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: TimeValue | null) => void): void {
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

    this.pendingTime.set(this.value() ?? createTimeValue(0, 0, 0));
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
    const nextTime: TimeValue = this.pendingTime();
    this.value.set(nextTime);
    this.onChange(nextTime);
    this.onTouched();
    this.closePanelInternal(false);
  }

  protected clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
  }

  private closePanelInternal(markAsTouched: boolean): void {
    this.isOpen.set(false);
    this.panelCoordinator.notifyClosed(this);

    if (markAsTouched) {
      this.onTouched();
    }
  }
}
