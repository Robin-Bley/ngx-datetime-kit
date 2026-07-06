import * as _angular_core from '@angular/core';
import { InjectionToken, OnDestroy, OnInit, EnvironmentProviders, WritableSignal, Signal } from '@angular/core';
import { ControlValueAccessor, ValidatorFn, ValidationErrors } from '@angular/forms';
import * as ngx_datetime_kit from 'ngx-datetime-kit';

/**
 * UI label strings used throughout the library.
 * Override globally (or per-component via the `labels` input) to support
 * languages other than the built-in defaults.
 *
 * Example:
 * ```ts
 * providers: [{ provide: NGX_LABELS, useValue: { apply: 'Übernehmen', cancel: 'Abbrechen' } }]
 * ```
 */
interface NgxLabels {
    apply: string;
    cancel: string;
    reset: string;
    selectPeriod: string;
    selectDate: string;
    selectTime: string;
    selectDateTime: string;
    startTime: string;
    endTime: string;
    duration: string;
    today: string;
    last24h: string;
    thisWeek: string;
    last7Days: string;
    thisMonth: string;
    lastMonth: string;
    last30Days: string;
    custom: string;
    previousMonth: string;
    nextMonth: string;
    previousYear: string;
    nextYear: string;
    closePanel: string;
    clearValue: string;
    hours: string;
    minutes: string;
    seconds: string;
}
/** Default English labels. */
declare const NGX_DEFAULT_LABELS: NgxLabels;
/** Injection token for UI labels. */
declare const NGX_LABELS: InjectionToken<NgxLabels>;

/**
 * A date-only range (no time component). The type parameter D is the date type
 * used by the active NgxDateTimeAdapter (e.g. native Date, Luxon DateTime, ...).
 */
interface DateRange<D> {
    start: D | null;
    end: D | null;
}
/**
 * A date+time range. Internally both start and end carry full date+time info,
 * but they're separated here to make binding to components straightforward.
 */
interface DateTimeRange<D> {
    start: D | null;
    end: D | null;
}
/**
 * Creates a new empty DateRange.
 */
declare function createEmptyDateRange<D>(): DateRange<D>;
/**
 * Creates a new empty DateTimeRange.
 */
declare function createEmptyDateTimeRange<D>(): DateTimeRange<D>;
/**
 * Returns true if both start and end of the range are non-null.
 */
declare function isCompleteRange<D>(range: DateRange<D> | DateTimeRange<D>): boolean;

/**
 * Represents an hour-minute-second time value (no date context).
 * Used internally by time-selector components.
 */
interface TimeValue {
    hours: number;
    minutes: number;
    seconds: number;
}
/**
 * Creates a TimeValue, clamping each field to its valid range.
 */
declare function createTimeValue(hours?: number, minutes?: number, seconds?: number): TimeValue;
/**
 * Extracts a TimeValue from a native JS Date.
 */
declare function timeValueFromDate(date: Date): TimeValue;
/**
 * Applies a TimeValue to a Date, returning a new Date.
 */
declare function applyTimeToDate(date: Date, time: TimeValue): Date;
/**
 * Compares two TimeValues. Returns negative if a < b, 0 if equal, positive if a > b.
 */
declare function compareTimeValues(a: TimeValue, b: TimeValue): number;
/**
 * Formats a TimeValue as HH:mm:ss or HH:mm depending on showSeconds.
 */
declare function formatTimeValue(time: TimeValue, showSeconds?: boolean): string;
/**
 * Parses a time string (HH:mm or HH:mm:ss) to a TimeValue.
 * Returns null if the string is invalid.
 */
declare function parseTimeValue(str: string): TimeValue | null;

/** A named quick-select preset for range pickers. */
interface RangePreset<D> {
    /** Display label (use i18n labels for localisable strings). */
    label: string;
    /** Unique key used to mark the preset as active. */
    key: string;
    /** Factory that returns the start/end dates at call time. */
    getRangeFn: () => {
        start: D;
        end: D;
    };
}

/**
 * DateTime Range Picker — full-featured component with:
 * - Dual calendar view
 * - Start/End time selectors
 * - Preset quick-select
 * - Angular CDK Overlay (popover on desktop, bottom-sheet on mobile)
 * - ControlValueAccessor + model() signal for both Reactive Forms and Signal Forms
 *
 * Design decision: The panel is inlined (not in a portal) to keep template
 * change detection simple and avoid the complexity of cross-component DI in portals.
 * On mobile the panel overlays fullscreen via the `--mobile` class.
 */
declare class NgxDateTimeRangePickerComponent<D> implements ControlValueAccessor, OnDestroy {
    private readonly adapter;
    protected readonly labels: NgxLabels;
    private readonly formats;
    /** Two-way bindable value — works directly with Signal Forms model() */
    readonly value: _angular_core.ModelSignal<DateTimeRange<D> | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly showSeconds: _angular_core.InputSignal<boolean>;
    readonly minDate: _angular_core.InputSignal<D | null>;
    readonly maxDate: _angular_core.InputSignal<D | null>;
    /** Custom presets — if omitted, default presets are shown. */
    readonly customPresets: _angular_core.InputSignal<RangePreset<D>[] | null>;
    protected readonly isOpen: _angular_core.WritableSignal<boolean>;
    protected readonly isMobile: _angular_core.WritableSignal<boolean>;
    /** Pending selection — committed to `value` only on Apply */
    protected readonly pendingStart: _angular_core.WritableSignal<D | null>;
    protected readonly pendingEnd: _angular_core.WritableSignal<D | null>;
    protected readonly pendingStartTime: _angular_core.WritableSignal<TimeValue>;
    protected readonly pendingEndTime: _angular_core.WritableSignal<TimeValue>;
    protected readonly hoverDate: _angular_core.WritableSignal<D | null>;
    protected readonly activePresetKey: _angular_core.WritableSignal<string | null>;
    /** Which month is shown in the left calendar */
    protected readonly leftMonth: _angular_core.WritableSignal<number>;
    protected readonly leftYear: _angular_core.WritableSignal<number>;
    protected readonly rightMonth: _angular_core.Signal<number>;
    protected readonly rightYear: _angular_core.Signal<number>;
    protected readonly displayValue: _angular_core.Signal<string | null>;
    protected readonly placeholderText: _angular_core.Signal<string>;
    protected readonly rangePreviewText: _angular_core.Signal<string | null>;
    protected readonly durationText: _angular_core.Signal<string | null>;
    protected readonly canApply: _angular_core.Signal<boolean>;
    protected readonly effectivePresets: _angular_core.Signal<RangePreset<D>[]>;
    private onChange;
    private onTouched;
    writeValue(val: DateTimeRange<D> | null): void;
    registerOnChange(fn: (v: DateTimeRange<D> | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(isDisabled: boolean): void;
    protected togglePanel(): void;
    protected openPanel(): void;
    protected cancelPanel(): void;
    protected applyPanel(): void;
    protected clearValue(event: MouseEvent): void;
    protected onDaySelected(date: D): void;
    protected onPresetSelected(preset: RangePreset<D>): void;
    protected onStartTimeChanged(time: TimeValue): void;
    protected onEndTimeChanged(time: TimeValue): void;
    protected navigateLeft(delta: number): void;
    protected navigateRight(delta: number): void;
    ngOnDestroy(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDateTimeRangePickerComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxDateTimeRangePickerComponent<any>, "ngx-date-time-range-picker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "showSeconds": { "alias": "showSeconds"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "customPresets": { "alias": "customPresets"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * Date-range picker (no time). Dual calendar view with presets.
 */
declare class NgxDateRangePickerComponent<D> implements ControlValueAccessor {
    private readonly adapter;
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    private readonly formats;
    readonly value: _angular_core.ModelSignal<DateRange<D> | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly minDate: _angular_core.InputSignal<D | null>;
    readonly maxDate: _angular_core.InputSignal<D | null>;
    readonly customPresets: _angular_core.InputSignal<RangePreset<D>[] | null>;
    protected readonly isOpen: _angular_core.WritableSignal<boolean>;
    protected readonly pendingStart: _angular_core.WritableSignal<D | null>;
    protected readonly pendingEnd: _angular_core.WritableSignal<D | null>;
    protected readonly hoverDate: _angular_core.WritableSignal<D | null>;
    protected readonly activePresetKey: _angular_core.WritableSignal<string | null>;
    protected readonly leftMonth: _angular_core.WritableSignal<number>;
    protected readonly leftYear: _angular_core.WritableSignal<number>;
    protected readonly rightMonth: _angular_core.Signal<number>;
    protected readonly rightYear: _angular_core.Signal<number>;
    protected readonly displayValue: _angular_core.Signal<string | null>;
    protected readonly placeholderText: _angular_core.Signal<string>;
    protected readonly rangePreviewText: _angular_core.Signal<string | null>;
    protected readonly canApply: _angular_core.Signal<boolean>;
    protected readonly effectivePresets: _angular_core.Signal<RangePreset<D>[]>;
    private onChange;
    private onTouched;
    writeValue(val: DateRange<D> | null): void;
    registerOnChange(fn: (v: DateRange<D> | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(_: boolean): void;
    protected togglePanel(): void;
    protected openPanel(): void;
    protected cancelPanel(): void;
    protected applyPanel(): void;
    protected onDaySelected(date: D): void;
    protected onPresetSelected(preset: RangePreset<D>): void;
    protected clearValue(e: MouseEvent): void;
    protected navigateLeft(delta: number): void;
    protected navigateRight(delta: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDateRangePickerComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxDateRangePickerComponent<any>, "ngx-date-range-picker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "customPresets": { "alias": "customPresets"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * DateTime picker: calendar + time selector in a single panel.
 */
declare class NgxDateTimePickerComponent<D> implements ControlValueAccessor {
    private readonly adapter;
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    private readonly formats;
    readonly value: _angular_core.ModelSignal<D | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly showSeconds: _angular_core.InputSignal<boolean>;
    readonly minDate: _angular_core.InputSignal<D | null>;
    readonly maxDate: _angular_core.InputSignal<D | null>;
    protected readonly isOpen: _angular_core.WritableSignal<boolean>;
    protected readonly viewMonth: _angular_core.WritableSignal<number>;
    protected readonly viewYear: _angular_core.WritableSignal<number>;
    protected readonly pendingDate: _angular_core.WritableSignal<D | null>;
    protected readonly pendingTime: _angular_core.WritableSignal<TimeValue>;
    protected readonly displayValue: _angular_core.Signal<string | null>;
    protected readonly placeholderText: _angular_core.Signal<string>;
    protected readonly previewText: _angular_core.Signal<string>;
    private onChange;
    private onTouched;
    writeValue(val: D | null): void;
    registerOnChange(fn: (v: D | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(_: boolean): void;
    protected togglePanel(): void;
    protected openPanel(): void;
    protected cancelPanel(): void;
    protected applyPanel(): void;
    protected onDaySelected(date: D): void;
    protected clearValue(e: MouseEvent): void;
    protected navigate(delta: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDateTimePickerComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxDateTimePickerComponent<any>, "ngx-date-time-picker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "showSeconds": { "alias": "showSeconds"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * Date-only picker. Opens a single calendar in a panel.
 */
declare class NgxDatePickerComponent<D> implements ControlValueAccessor {
    private readonly adapter;
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    private readonly formats;
    readonly value: _angular_core.ModelSignal<D | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly minDate: _angular_core.InputSignal<D | null>;
    readonly maxDate: _angular_core.InputSignal<D | null>;
    protected readonly isOpen: _angular_core.WritableSignal<boolean>;
    protected readonly viewMonth: _angular_core.WritableSignal<number>;
    protected readonly viewYear: _angular_core.WritableSignal<number>;
    protected readonly displayValue: _angular_core.Signal<string | null>;
    protected readonly placeholderText: _angular_core.Signal<string>;
    private onChange;
    private onTouched;
    writeValue(val: D | null): void;
    registerOnChange(fn: (v: D | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(_: boolean): void;
    protected togglePanel(): void;
    protected openPanel(): void;
    protected closePanel(): void;
    protected onDaySelected(date: D): void;
    protected clearValue(e: MouseEvent): void;
    protected navigate(delta: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDatePickerComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxDatePickerComponent<any>, "ngx-date-picker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * Time-only picker. Opens a panel with a time spinner.
 */
declare class NgxTimePickerComponent implements ControlValueAccessor {
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    private readonly formats;
    readonly value: _angular_core.ModelSignal<TimeValue | null>;
    readonly placeholder: _angular_core.InputSignal<string>;
    readonly disabled: _angular_core.InputSignal<boolean>;
    readonly invalid: _angular_core.InputSignal<boolean>;
    readonly showSeconds: _angular_core.InputSignal<boolean>;
    protected readonly isOpen: _angular_core.WritableSignal<boolean>;
    protected readonly pendingTime: _angular_core.WritableSignal<TimeValue>;
    protected readonly displayValue: _angular_core.Signal<string | null>;
    protected readonly placeholderText: _angular_core.Signal<string>;
    private onChange;
    private onTouched;
    writeValue(val: TimeValue | null): void;
    registerOnChange(fn: (v: TimeValue | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(_: boolean): void;
    protected togglePanel(): void;
    protected openPanel(): void;
    protected cancelPanel(): void;
    protected applyPanel(): void;
    protected clearValue(e: MouseEvent): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxTimePickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxTimePickerComponent, "ngx-time-picker", never, { "value": { "alias": "value"; "required": false; "isSignal": true; }; "placeholder": { "alias": "placeholder"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "invalid": { "alias": "invalid"; "required": false; "isSignal": true; }; "showSeconds": { "alias": "showSeconds"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

interface CalendarCell<D> {
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
declare class NgxCalendarComponent<D> implements OnInit {
    private readonly adapter;
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    /** Displayed month (0-based) */
    readonly viewMonth: _angular_core.InputSignal<number>;
    /** Displayed year */
    readonly viewYear: _angular_core.InputSignal<number>;
    /** Currently selected single date (for date/datetime pickers) */
    readonly selectedDate: _angular_core.InputSignal<D | null>;
    /** Range start */
    readonly rangeStart: _angular_core.InputSignal<D | null>;
    /** Range end */
    readonly rangeEnd: _angular_core.InputSignal<D | null>;
    /** Hover candidate (for range hover preview) */
    readonly hoverDate: _angular_core.InputSignal<D | null>;
    /** Min selectable date */
    readonly minDate: _angular_core.InputSignal<D | null>;
    /** Max selectable date */
    readonly maxDate: _angular_core.InputSignal<D | null>;
    /** Disabled individual dates */
    readonly disabledDates: _angular_core.InputSignal<D[]>;
    /** Show/hide navigation arrows */
    readonly showPrevNav: _angular_core.InputSignal<boolean>;
    readonly showNextNav: _angular_core.InputSignal<boolean>;
    readonly daySelected: _angular_core.OutputEmitterRef<D>;
    readonly onDayHover: _angular_core.OutputEmitterRef<D>;
    readonly prevMonthClicked: _angular_core.OutputEmitterRef<void>;
    readonly nextMonthClicked: _angular_core.OutputEmitterRef<void>;
    protected readonly weekdayNames: _angular_core.Signal<string[]>;
    protected readonly monthNames: _angular_core.Signal<string[]>;
    protected readonly monthYearLabel: _angular_core.Signal<string>;
    protected readonly cells: _angular_core.Signal<CalendarCell<D>[]>;
    ngOnInit(): void;
    protected isToday(date: D): boolean;
    protected isSelected(date: D): boolean;
    protected isRangeStart(date: D): boolean;
    protected isRangeEnd(date: D): boolean;
    protected isInRange(date: D): boolean;
    protected isDisabled(date: D): boolean;
    protected dayAriaLabel(date: D): string;
    protected onDayClick(date: D): void;
    protected onPrevMonth(): void;
    protected onNextMonth(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxCalendarComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxCalendarComponent<any>, "ngx-calendar", never, { "viewMonth": { "alias": "viewMonth"; "required": true; "isSignal": true; }; "viewYear": { "alias": "viewYear"; "required": true; "isSignal": true; }; "selectedDate": { "alias": "selectedDate"; "required": false; "isSignal": true; }; "rangeStart": { "alias": "rangeStart"; "required": false; "isSignal": true; }; "rangeEnd": { "alias": "rangeEnd"; "required": false; "isSignal": true; }; "hoverDate": { "alias": "hoverDate"; "required": false; "isSignal": true; }; "minDate": { "alias": "minDate"; "required": false; "isSignal": true; }; "maxDate": { "alias": "maxDate"; "required": false; "isSignal": true; }; "disabledDates": { "alias": "disabledDates"; "required": false; "isSignal": true; }; "showPrevNav": { "alias": "showPrevNav"; "required": false; "isSignal": true; }; "showNextNav": { "alias": "showNextNav"; "required": false; "isSignal": true; }; }, { "daySelected": "daySelected"; "onDayHover": "onDayHover"; "prevMonthClicked": "prevMonthClicked"; "nextMonthClicked": "nextMonthClicked"; }, never, never, true, never>;
}

/**
 * Reusable time selector component.
 * Renders HH : mm : ss spinners with keyboard support (↑/↓ arrows).
 * No free text input — only spinner/button interaction.
 */
declare class NgxTimeSelectorComponent {
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    readonly value: _angular_core.ModelSignal<TimeValue>;
    readonly showSeconds: _angular_core.InputSignal<boolean>;
    readonly label: _angular_core.InputSignal<string>;
    readonly timeChanged: _angular_core.OutputEmitterRef<TimeValue>;
    protected padded(n: number): string;
    protected changeHours(delta: number): void;
    protected changeMinutes(delta: number): void;
    protected changeSeconds(delta: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxTimeSelectorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxTimeSelectorComponent, "ngx-time-selector", never, { "value": { "alias": "value"; "required": true; "isSignal": true; }; "showSeconds": { "alias": "showSeconds"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "timeChanged": "timeChanged"; }, never, never, true, never>;
}

/**
 * Preset quick-select panel displayed on the left of range picker panels.
 * Emits the preset key when a preset is selected.
 */
declare class NgxPresetsPanelComponent<D> {
    private readonly adapter;
    protected readonly labels: ngx_datetime_kit.NgxLabels;
    readonly presets: _angular_core.InputSignal<RangePreset<D>[]>;
    readonly activeKey: _angular_core.InputSignal<string | null>;
    readonly presetSelected: _angular_core.OutputEmitterRef<RangePreset<D>>;
    protected onSelect(preset: RangePreset<D>): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxPresetsPanelComponent<any>, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NgxPresetsPanelComponent<any>, "ngx-presets-panel", never, { "presets": { "alias": "presets"; "required": true; "isSignal": true; }; "activeKey": { "alias": "activeKey"; "required": false; "isSignal": true; }; }, { "presetSelected": "presetSelected"; }, never, never, true, never>;
}

/** Convenience NgModule for apps not using standalone imports. */
declare class NgxDatetimeKitModule {
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxDatetimeKitModule, never>;
    static ɵmod: _angular_core.ɵɵNgModuleDeclaration<NgxDatetimeKitModule, never, [typeof NgxDateTimeRangePickerComponent, typeof NgxDateRangePickerComponent, typeof NgxDateTimePickerComponent, typeof NgxDatePickerComponent, typeof NgxTimePickerComponent, typeof NgxCalendarComponent, typeof NgxTimeSelectorComponent, typeof NgxPresetsPanelComponent], [typeof NgxDateTimeRangePickerComponent, typeof NgxDateRangePickerComponent, typeof NgxDateTimePickerComponent, typeof NgxDatePickerComponent, typeof NgxTimePickerComponent, typeof NgxCalendarComponent, typeof NgxTimeSelectorComponent, typeof NgxPresetsPanelComponent]>;
    static ɵinj: _angular_core.ɵɵInjectorDeclaration<NgxDatetimeKitModule>;
}

/**
 * Format configuration for dates and times.
 * Analogous to Angular Material's MAT_DATE_FORMATS.
 *
 * All formats use Unicode CLDR-like tokens as implemented by NgxNativeDateTimeAdapter:
 *   yyyy, MM, dd, HH, mm, ss
 */
interface NgxDateTimeFormats {
    /** Display format for date-only pickers (e.g. "dd.MM.yyyy"). */
    display: {
        dateInput: string;
        timeInput: string;
        dateTimeInput: string;
        /** Format for the calendar month/year header (e.g. "MMMM yyyy"). */
        monthYearLabel: string;
    };
    /** Parsing formats (used by adapters; can be a list of fallback formats). */
    parse: {
        dateInput: string;
        timeInput: string;
        dateTimeInput: string;
    };
}
/** German (DE) format set. */
declare const NGX_DATE_TIME_FORMATS_DE: NgxDateTimeFormats;
/** US format set. */
declare const NGX_DATE_TIME_FORMATS_US: NgxDateTimeFormats;
/** ISO 8601 format set. */
declare const NGX_DATE_TIME_FORMATS_ISO: NgxDateTimeFormats;
/**
 * Injection token for date-time formats.
 * Defaults to NGX_DATE_TIME_FORMATS_ISO when not provided.
 */
declare const NGX_DATE_TIME_FORMATS: InjectionToken<NgxDateTimeFormats>;

/**
 * Abstract date-time adapter following Angular Material's DateAdapter pattern,
 * extended to cover both date AND time operations.
 *
 * Consumers can provide their own adapter (e.g. for Luxon or date-fns) via DI:
 *
 * ```ts
 * providers: [
 *   { provide: NGX_DATE_TIME_ADAPTER, useClass: MyLuxonDateTimeAdapter }
 * ]
 * ```
 *
 * See docs/adapter.md for a complete guide on writing a custom adapter.
 */
declare abstract class NgxDateTimeAdapter<D> {
    /** Returns the year as a number. */
    abstract getYear(date: D): number;
    /** Returns the month (0-based, Jan = 0). */
    abstract getMonth(date: D): number;
    /** Returns the day of the month (1-based). */
    abstract getDate(date: D): number;
    /** Returns the day of the week (0 = Sun, 1 = Mon … 6 = Sat). */
    abstract getDayOfWeek(date: D): number;
    /** Returns the hours component (0–23). */
    abstract getHours(date: D): number;
    /** Returns the minutes component (0–59). */
    abstract getMinutes(date: D): number;
    /** Returns the seconds component (0–59). */
    abstract getSeconds(date: D): number;
    /** Creates a date with the given year, month (0-based) and day; time is midnight. */
    abstract createDate(year: number, month: number, day: number): D;
    /** Creates a full date-time value. */
    abstract createDateTime(year: number, month: number, day: number, hours: number, minutes: number, seconds: number): D;
    /** Returns a new instance representing "right now". */
    abstract today(): D;
    /** Returns a new instance representing "right now" (with time). */
    abstract now(): D;
    /** Returns the number of days in the given month/year. */
    abstract getNumDaysInMonth(year: number, month: number): number;
    /** Returns a clone of the date with the time portion set to the given values. */
    abstract setTime(date: D, hours: number, minutes: number, seconds: number): D;
    /** Clones the date, stripping the time to midnight. */
    abstract startOfDay(date: D): D;
    /** Clones the date, setting time to 23:59:59. */
    abstract endOfDay(date: D): D;
    abstract addYears(date: D, years: number): D;
    abstract addMonths(date: D, months: number): D;
    abstract addDays(date: D, days: number): D;
    abstract addHours(date: D, hours: number): D;
    abstract addMinutes(date: D, minutes: number): D;
    abstract addSeconds(date: D, seconds: number): D;
    /**
     * Returns negative if a < b, 0 if same moment, positive if a > b.
     * Compares both date and time.
     */
    abstract compare(a: D, b: D): number;
    /** Same as compare but ignores the time component. */
    abstract compareDateOnly(a: D, b: D): number;
    /** Returns true if a and b represent the same calendar day. */
    isSameDay(a: D, b: D): boolean;
    /** Returns true if a comes strictly before b (date+time). */
    isBefore(a: D, b: D): boolean;
    /** Returns true if a comes strictly after b (date+time). */
    isAfter(a: D, b: D): boolean;
    /** Returns true if date is within [start, end] (inclusive, date+time). */
    isInRange(date: D, start: D, end: D): boolean;
    /** Returns true if date is within [start, end] ignoring time. */
    isInRangeDateOnly(date: D, start: D, end: D): boolean;
    /**
     * Returns the total number of milliseconds between a and b.
     * The result is always non-negative (abs value).
     */
    abstract diffInMs(a: D, b: D): number;
    /**
     * Parses a string into a D, using the given display format.
     * Returns null if the string cannot be parsed.
     *
     * Decision: adapters receive the format string so they can delegate
     * format-aware parsing to their underlying library (e.g. Luxon).
     */
    abstract parse(value: string, format: string): D | null;
    /**
     * Formats a D to a human-readable string using the given display format.
     * Format tokens follow Unicode CLDR / date-fns conventions:
     *   yyyy, MM, dd, HH, mm, ss
     */
    abstract format(date: D, format: string): string;
    /** Returns true if the value represents a valid date/time. */
    abstract isValid(date: D): boolean;
    /** Returns true if the value is a recognised date type for this adapter. */
    abstract isDateInstance(obj: unknown): obj is D;
    /**
     * Sets the locale used for formatting/introspection.
     * Called automatically when LOCALE_ID changes.
     */
    abstract setLocale(locale: string): void;
    /** Returns an array of 7 narrow weekday names starting at `firstDayOfWeek`. */
    abstract getWeekdayNames(style: 'long' | 'short' | 'narrow', firstDayOfWeek: number): string[];
    /** Returns an array of 12 month names. */
    abstract getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    /** Returns the index of the first day of the week (0=Sun, 1=Mon). */
    abstract getFirstDayOfWeek(): number;
}

interface NgxDatetimeKitConfig {
    adapter?: new (...args: unknown[]) => NgxDateTimeAdapter<unknown>;
    formats?: Partial<NgxDateTimeFormats>;
    labels?: Partial<NgxLabels>;
}
/**
 * provideNgxDatetimeKit — the recommended way to configure the library in
 * standalone applications using bootstrapApplication().
 *
 * @example
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [
 *     provideNgxDatetimeKit({
 *       formats: NGX_DATE_TIME_FORMATS_DE,
 *       labels: { apply: 'Übernehmen', cancel: 'Abbrechen' },
 *     }),
 *   ]
 * });
 * ```
 */
declare function provideNgxDatetimeKit(config?: NgxDatetimeKitConfig): EnvironmentProviders;

/**
 * Default implementation of NgxDateTimeAdapter backed by native JS Date objects.
 *
 * Format token mapping (subset of Unicode CLDR):
 *   yyyy → 4-digit year     MM → 2-digit month (01-12)
 *   dd   → 2-digit day      HH → 2-digit hours (00-23)
 *   mm   → 2-digit minutes  ss → 2-digit seconds
 *   M    → month (1-12)     d  → day (1-31)
 *
 * Design decision: We deliberately avoid Intl.DateTimeFormat for
 * formatting so format strings remain predictable regardless of locale.
 * Locale is only used for weekday/month name generation via Intl.
 */
declare class NgxNativeDateTimeAdapter extends NgxDateTimeAdapter<Date> {
    private locale;
    getYear(date: Date): number;
    getMonth(date: Date): number;
    getDate(date: Date): number;
    getDayOfWeek(date: Date): number;
    getHours(date: Date): number;
    getMinutes(date: Date): number;
    getSeconds(date: Date): number;
    createDate(year: number, month: number, day: number): Date;
    createDateTime(year: number, month: number, day: number, hours: number, minutes: number, seconds: number): Date;
    today(): Date;
    now(): Date;
    getNumDaysInMonth(year: number, month: number): number;
    setTime(date: Date, hours: number, minutes: number, seconds: number): Date;
    startOfDay(date: Date): Date;
    endOfDay(date: Date): Date;
    addYears(date: Date, years: number): Date;
    addMonths(date: Date, months: number): Date;
    addDays(date: Date, days: number): Date;
    addHours(date: Date, hours: number): Date;
    addMinutes(date: Date, minutes: number): Date;
    addSeconds(date: Date, seconds: number): Date;
    compare(a: Date, b: Date): number;
    compareDateOnly(a: Date, b: Date): number;
    diffInMs(a: Date, b: Date): number;
    /**
     * Parses a string using a simple token-based approach.
     * Supports: yyyy, MM, dd, HH, mm, ss (also M, d, H, m, s without padding).
     */
    parse(value: string, format: string): Date | null;
    format(date: Date, format: string): string;
    isValid(date: Date): boolean;
    isDateInstance(obj: unknown): obj is Date;
    setLocale(locale: string): void;
    getWeekdayNames(style: 'long' | 'short' | 'narrow', firstDayOfWeek: number): string[];
    getMonthNames(style: 'long' | 'short' | 'narrow'): string[];
    getFirstDayOfWeek(): number;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NgxNativeDateTimeAdapter, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NgxNativeDateTimeAdapter>;
}

/**
 * Injection token for the date-time adapter.
 * Replace globally:
 * ```ts
 * providers: [{ provide: NGX_DATE_TIME_ADAPTER, useClass: MyLuxonAdapter }]
 * ```
 */
declare const NGX_DATE_TIME_ADAPTER: InjectionToken<NgxDateTimeAdapter<unknown>>;

/**
 * Core validation logic shared by both Reactive Forms validators and Signal Forms validators.
 * Keep all business rules here — the form-specific wrappers are thin adapters.
 */
declare function validateDateRangeCore<D>(range: DateRange<D> | DateTimeRange<D> | null | undefined, adapter: NgxDateTimeAdapter<D>, minDate?: D | null, maxDate?: D | null): ValidationErrors | null;
/**
 * Reactive Forms validator factory for DateRange controls.
 *
 * Usage:
 * ```ts
 * new FormControl(null, ngxDateRangeValidator(adapter))
 * ```
 */
declare function ngxDateRangeValidator<D>(adapter: NgxDateTimeAdapter<D>, minDate?: D | null, maxDate?: D | null): ValidatorFn;
/**
 * Convenience alias — validates that end is after start.
 * Can be used on a FormGroup with `start` and `end` controls.
 */
declare function endAfterStartValidator<D>(adapter: NgxDateTimeAdapter<D>): ValidatorFn;
/**
 * Reactive Forms min-date validator for single date/datetime controls.
 */
declare function ngxMinDateValidator<D>(adapter: NgxDateTimeAdapter<D>, minDate: D): ValidatorFn;
/**
 * Reactive Forms max-date validator for single date/datetime controls.
 */
declare function ngxMaxDateValidator<D>(adapter: NgxDateTimeAdapter<D>, maxDate: D): ValidatorFn;

/**
 * Signal Forms adapter for ngx-datetime-kit.
 *
 * ## Design rationale
 *
 * Angular's "Signal Forms" API (form()/field() with schema validators) is
 * evolving. Angular 22 ships with the `model()` primitive and experimental
 * signal-based form integrations. This adapter is intentionally isolated
 * so that when the Signal Forms API stabilises, only this file needs updating.
 *
 * ## Current strategy
 *
 * All picker components expose a `value` two-way signal via Angular's `model()`
 * primitive. This means they can be bound directly to a `signal<T>` without any
 * extra wrapper:
 *
 * ```ts
 * // In your component:
 * selectedRange = signal<DateTimeRange<Date> | null>(null);
 *
 * // In your template:
 * <ngx-date-time-range-picker [(value)]="selectedRange" />
 * ```
 *
 * ## Schema Validator integration (forward-compatible)
 *
 * The `toSignalValidator` helper below bridges the shared validation core
 * (validateDateRangeCore) to whatever Signal Forms schema validator shape
 * Angular ships. Update only this function when the API changes.
 */

/**
 * Creates a signal that mirrors a WritableSignal<T> and validates it.
 * Use this as a lightweight replacement for FormControl in purely signal-based forms.
 *
 * @example
 * ```ts
 * const rangeField = createValidatedSignalField(
 *   null,
 *   (v) => validateDateRangeCore(v, adapter),
 * );
 *
 * // Bind in template:
 * <ngx-date-time-range-picker [(value)]="rangeField.value" />
 * <span *ngIf="rangeField.errors()?.ngxEndBeforeStart">End must be after start</span>
 * ```
 */
interface NgxSignalField<T> {
    /** The writable signal — bind directly to picker `[(value)]`. */
    value: WritableSignal<T>;
    /** Computed validation errors — null when valid. */
    errors: Signal<ValidationErrors | null>;
    /** Computed validity flag. */
    valid: Signal<boolean>;
    /** Marks the field as touched (sets a touched flag signal). */
    markAsTouched: () => void;
    /** Whether the field has been touched (interacted with). */
    touched: Signal<boolean>;
}
/**
 * Factory function for a validated signal field.
 *
 * @param initialValue  Initial value for the signal
 * @param validate      Validation function (use the core validators from validators/)
 */
declare function createSignalField<T>(initialValue: T, validate?: (value: T) => ValidationErrors | null): NgxSignalField<T>;
/**
 * Creates a pre-configured signal field for DateTimeRange with built-in validation.
 *
 * @example
 * ```ts
 * const range = createDateTimeRangeSignalField(adapter);
 * // Then in template: <ngx-date-time-range-picker [(value)]="range.value" />
 * ```
 */
declare function createDateTimeRangeSignalField<D>(adapter: NgxDateTimeAdapter<D>, initialValue?: DateTimeRange<D> | null, options?: {
    minDate?: D | null;
    maxDate?: D | null;
}): NgxSignalField<DateTimeRange<D> | null>;
/**
 * Creates a pre-configured signal field for DateRange with built-in validation.
 */
declare function createDateRangeSignalField<D>(adapter: NgxDateTimeAdapter<D>, initialValue?: DateRange<D> | null, options?: {
    minDate?: D | null;
    maxDate?: D | null;
}): NgxSignalField<DateRange<D> | null>;
/**
 * Converts a core validate function into a shape compatible with future
 * Angular Signal Forms schema validators.
 *
 * Isolation point: update ONLY this function when Angular's signal-forms
 * validator shape changes (e.g. async, returning signal instead of plain obj).
 */
declare function toSignalValidator<T>(validateFn: (v: T) => ValidationErrors | null): (v: T) => ValidationErrors | null;

/**
 * Formats a duration (in milliseconds) as a human-readable string.
 * E.g. "65 days, 9 h, 31 min, 30 sec"
 */
declare function formatDuration(ms: number, labels?: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
}): string;
/**
 * Returns an array of Date objects representing the calendar grid for a given
 * month/year, padded to full weeks based on firstDayOfWeek.
 *
 * @param year        Full year number
 * @param month       0-based month index
 * @param firstDayOfWeek  0=Sun, 1=Mon
 * @param adapter     Adapter used to create Date instances
 */
declare function buildCalendarGrid<D>(year: number, month: number, firstDayOfWeek: number, adapter: NgxDateTimeAdapter<D>): Array<{
    date: D;
    isCurrentMonth: boolean;
}>;
/**
 * Clamps a value within a [min, max] range using the adapter's compare method.
 * Returns the value if within range, min if below, max if above.
 */
declare function clampDate<D>(value: D, min: D | null | undefined, max: D | null | undefined, adapter: NgxDateTimeAdapter<D>): D;

export { NGX_DATE_TIME_ADAPTER, NGX_DATE_TIME_FORMATS, NGX_DATE_TIME_FORMATS_DE, NGX_DATE_TIME_FORMATS_ISO, NGX_DATE_TIME_FORMATS_US, NGX_DEFAULT_LABELS, NGX_LABELS, NgxCalendarComponent, NgxDatePickerComponent, NgxDateRangePickerComponent, NgxDateTimeAdapter, NgxDateTimePickerComponent, NgxDateTimeRangePickerComponent, NgxDatetimeKitModule, NgxNativeDateTimeAdapter, NgxPresetsPanelComponent, NgxTimePickerComponent, NgxTimeSelectorComponent, applyTimeToDate, buildCalendarGrid, clampDate, compareTimeValues, createDateRangeSignalField, createDateTimeRangeSignalField, createEmptyDateRange, createEmptyDateTimeRange, createSignalField, createTimeValue, endAfterStartValidator, formatDuration, formatTimeValue, isCompleteRange, ngxDateRangeValidator, ngxMaxDateValidator, ngxMinDateValidator, parseTimeValue, provideNgxDatetimeKit, timeValueFromDate, toSignalValidator, validateDateRangeCore };
export type { DateRange, DateTimeRange, NgxDateTimeFormats, NgxDatetimeKitConfig, NgxLabels, NgxSignalField, RangePreset, TimeValue };
//# sourceMappingURL=ngx-datetime-kit.d.ts.map
