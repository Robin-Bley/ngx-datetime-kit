import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  afterNextRender,
  inject,
} from '@angular/core';
import { NgControl, Validators } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject, Subscription } from 'rxjs';

let nextUniqueId: number = 0;

/**
 * Connects any ngx-datetime-kit picker to Angular Material's `<mat-form-field>`.
 *
 * The directive is applied **automatically** — its selector covers all five picker
 * element names, so you only need to import it (or `NgxDatetimeKitMaterialModule`)
 * and place a picker inside `<mat-form-field>`.
 *
 * ### Requirements
 * - Peer dependency: `@angular/material` must be installed.
 * - For full error-state and label-float behaviour, pair with a form binding:
 *   `[formControl]`, `formControlName`, or `[(ngModel)]`.
 *
 * ### Example
 * ```html
 * <mat-form-field appearance="outline">
 *   <mat-label>Start date</mat-label>
 *   <ngx-date-picker [formControl]="dateCtrl"></ngx-date-picker>
 *   <mat-error>Please select a date.</mat-error>
 * </mat-form-field>
 * ```
 */
@Directive({
  // Selector covers all five picker host elements
  selector: `
    ngx-date-picker,
    ngx-time-picker,
    ngx-date-time-picker,
    ngx-date-range-picker,
    ngx-date-time-range-picker
  `,
  providers: [
    { provide: MatFormFieldControl, useExisting: NgxMatFormFieldDirective },
  ],
  // CSS class added to host element for SCSS-based style suppression
  host: { class: 'ngx-mat-control' },
  standalone: true,
})
export class NgxMatFormFieldDirective implements MatFormFieldControl<unknown>, OnInit, OnDestroy {
  /** Injected Angular form control (present when [formControl] / formControlName / ngModel is used). */
  readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  private readonly fm: FocusMonitor = inject(FocusMonitor);
  private readonly el: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly _valueChangeSub: Subscription = new Subscription();
  private readonly _panelOpenClass: string = 'ngx-mat-form-field--panel-open';
  private _panelStateObserver: MutationObserver | null = null;

  // ── MatFormFieldControl required properties ─────────────────────────────────

  /** Emits whenever the control state changes so mat-form-field can re-render. */
  readonly stateChanges: Subject<void> = new Subject<void>();

  /** Unique element id used by mat-label's `for` attribute. */
  readonly id: string = `ngx-picker-${nextUniqueId++}`;

  /** Identifies the control type to mat-form-field for CSS class generation. */
  readonly controlType: string = 'ngx-picker';

  /** Whether the picker panel is currently open (mapped to Material's focused state). */
  focused: boolean = false;

  private _placeholder: string = '';
  get placeholder(): string { return this._placeholder; }
  set placeholder(v: string) { this._placeholder = v; this.stateChanges.next(); }

  get value(): unknown { return this.ngControl?.value ?? null; }

  get empty(): boolean {
    const v: unknown = this.value;
    return v === null || v === undefined;
  }

  /**
   * Pickers always render a visual trigger (icon + placeholder or value), so the
   * label must always float to the top border notch — never overlap the content.
   */
  get shouldLabelFloat(): boolean { return true; }

  get required(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }

  get disabled(): boolean { return this.ngControl?.disabled ?? false; }

  get errorState(): boolean {
    return !!(
      this.ngControl?.invalid &&
      (this.ngControl.dirty || this.ngControl.touched)
    );
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  constructor() {
    // Use afterNextRender so the full Angular Material DOM tree is present before
    // we patch parent elements. This is safe for SSR (runs only in the browser).
    afterNextRender(() => {
      this._patchMdcWrapper();
      this._observePanelState();
    });
  }

  ngOnInit(): void {
    if (this.ngControl?.valueChanges) {
      this._valueChangeSub.add(
        this.ngControl.valueChanges.subscribe(() => this.stateChanges.next()),
      );
    }
    if (this.ngControl?.statusChanges) {
      this._valueChangeSub.add(
        this.ngControl.statusChanges.subscribe(() => this.stateChanges.next()),
      );
    }

    this._valueChangeSub.add(
      this.fm.monitor(this.el, true).subscribe((origin) => {
        this.focused = !!origin;
        this.stateChanges.next();
      }),
    );
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.fm.stopMonitoring(this.el);
    this._valueChangeSub.unsubscribe();
    this._panelStateObserver?.disconnect();
    this._setPanelOpenState(false);
  }

  // ── MatFormFieldControl interface methods ───────────────────────────────────

  /**
   * Called by mat-form-field to link `aria-describedby` ids
   * (e.g. from `<mat-hint>` or `<mat-error>`) to this control.
   */
  setDescribedByIds(ids: string[]): void {
    if (ids.length > 0) {
      this.el.nativeElement.setAttribute('aria-describedby', ids.join(' '));
    } else {
      this.el.nativeElement.removeAttribute('aria-describedby');
    }
  }

  /**
   * Called when the user clicks on the mat-form-field container area
   * (e.g., the label or the outline border). Forwards the click to the
   * picker trigger so the panel opens.
   *
   * IMPORTANT: mat-form-field fires onContainerClick for ALL clicks within
   * the wrapper — including clicks that already landed directly on the
   * trigger or inside the inline picker panel. If we blindly call
   * `trigger.click()` in those cases, togglePanel() fires twice (open then
   * immediately close, or close then immediately reopen). We guard against
   * this by checking whether the click target is already inside the trigger
   * or the panel.
   */
  onContainerClick(event: MouseEvent): void {
    const trigger: HTMLElement | null =
      this.el.nativeElement.querySelector<HTMLElement>('.ngx-picker-field');
    const panel: HTMLElement | null =
      this.el.nativeElement.querySelector<HTMLElement>('.ngx-panel');
    const eventPath: EventTarget[] = typeof event.composedPath === 'function' ? event.composedPath() : [];
    const target: Node | null = event.target as Node | null;
    const clickStartedInsideHost: boolean = eventPath.includes(this.el.nativeElement);

    if (clickStartedInsideHost) {

      return;
    }

    if (
      trigger &&
      target !== null &&
      !trigger.contains(target) &&
      !(panel?.contains(target) ?? false)
    ) {
      trigger.click();
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Walks the DOM tree from the picker host up to (but not including)
   * the enclosing `mat-form-field` element and patches any ancestor that:
   *
   * - has `overflow: hidden` — clips the picker panel
   * - has a non-default `will-change` value — creates a CSS stacking context
   *   that traps the panel's z-index inside the form field's paint layer
   *
   * `!important` is used so the inline style reliably overrides any
   * `!important` rules in Angular Material's stylesheet.
   *
   * This walk-based approach is Angular Material version-agnostic: it fixes
   * the problem regardless of which internal class names Angular Material uses.
   */
  private _patchMdcWrapper(): void {
    const host: HTMLElement = this.el.nativeElement;
    const formField: Element | null = host.closest('mat-form-field');
    if (!formField) {
      return; // Picker is not inside a mat-form-field — nothing to do
    }

    let el: HTMLElement | null = host.parentElement;
    while (el && el !== formField) {
      const computed: CSSStyleDeclaration = getComputedStyle(el);

      // 1. Fix overflow clipping
      if (
        computed.overflow === 'hidden' ||
        computed.overflowX === 'hidden' ||
        computed.overflowY === 'hidden'
      ) {
        el.style.setProperty('overflow', 'visible', 'important');
      }

      // 2. Dissolve stacking contexts created by will-change.
      //    `will-change: auto` is the initial value and does NOT create a
      //    stacking context. Any other value (e.g., "opacity, transform, color")
      //    creates a new stacking context that traps the panel's z-index.
      if (computed.willChange && computed.willChange !== 'auto') {
        el.style.setProperty('will-change', 'auto', 'important');
      }

      el = el.parentElement;
    }
  }

  /**
   * Keeps the enclosing `<mat-form-field>` in a raised stacking layer while the
   * inline picker panel is open. Without this, adjacent Material fields can
   * paint above the panel and make it look transparent.
   */
  private _observePanelState(): void {
    const trigger: HTMLElement | null =
      this.el.nativeElement.querySelector<HTMLElement>('.ngx-picker-field');

    if (trigger === null) {
      return;
    }

    this._syncPanelOpenState(trigger);
    this._panelStateObserver?.disconnect();
    this._panelStateObserver = new MutationObserver(() => {
      this._syncPanelOpenState(trigger);
    });
    this._panelStateObserver.observe(trigger, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private _syncPanelOpenState(trigger: HTMLElement): void {
    this._setPanelOpenState(trigger.classList.contains('ngx-picker-field--open'));
  }

  private _setPanelOpenState(isOpen: boolean): void {
    const formField: HTMLElement | null =
      this.el.nativeElement.closest<HTMLElement>('mat-form-field');

    if (formField === null) {
      return;
    }

    formField.classList.toggle(this._panelOpenClass, isOpen);
  }
}

