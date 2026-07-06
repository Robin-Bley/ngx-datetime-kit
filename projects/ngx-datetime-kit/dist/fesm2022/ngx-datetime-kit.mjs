import * as i0 from '@angular/core';
import { InjectionToken, inject, LOCALE_ID, Injectable, input, output, computed, ChangeDetectionStrategy, Component, model, signal, forwardRef, NgModule, makeEnvironmentProviders } from '@angular/core';
import * as i1 from '@angular/common';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Injection token for the date-time adapter.
 * Replace globally:
 * ```ts
 * providers: [{ provide: NGX_DATE_TIME_ADAPTER, useClass: MyLuxonAdapter }]
 * ```
 */
const NGX_DATE_TIME_ADAPTER = new InjectionToken('NGX_DATE_TIME_ADAPTER');

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
class NgxDateTimeAdapter {
    /** Returns true if a and b represent the same calendar day. */
    isSameDay(a, b) {
        return this.compareDateOnly(a, b) === 0;
    }
    /** Returns true if a comes strictly before b (date+time). */
    isBefore(a, b) {
        return this.compare(a, b) < 0;
    }
    /** Returns true if a comes strictly after b (date+time). */
    isAfter(a, b) {
        return this.compare(a, b) > 0;
    }
    /** Returns true if date is within [start, end] (inclusive, date+time). */
    isInRange(date, start, end) {
        return this.compare(date, start) >= 0 && this.compare(date, end) <= 0;
    }
    /** Returns true if date is within [start, end] ignoring time. */
    isInRangeDateOnly(date, start, end) {
        return this.compareDateOnly(date, start) >= 0 && this.compareDateOnly(date, end) <= 0;
    }
}

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
class NgxNativeDateTimeAdapter extends NgxDateTimeAdapter {
    constructor() {
        super(...arguments);
        this.locale = inject(LOCALE_ID, { optional: true }) ?? 'en-US';
    }
    // ── Introspection ─────────────────────────────────────────────────────────
    getYear(date) { return date.getFullYear(); }
    getMonth(date) { return date.getMonth(); }
    getDate(date) { return date.getDate(); }
    getDayOfWeek(date) { return date.getDay(); }
    getHours(date) { return date.getHours(); }
    getMinutes(date) { return date.getMinutes(); }
    getSeconds(date) { return date.getSeconds(); }
    // ── Construction ──────────────────────────────────────────────────────────
    createDate(year, month, day) {
        return new Date(year, month, day, 0, 0, 0, 0);
    }
    createDateTime(year, month, day, hours, minutes, seconds) {
        return new Date(year, month, day, hours, minutes, seconds, 0);
    }
    today() {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }
    now() { return new Date(); }
    getNumDaysInMonth(year, month) {
        // Day 0 of next month = last day of this month
        return new Date(year, month + 1, 0).getDate();
    }
    setTime(date, hours, minutes, seconds) {
        const d = new Date(date);
        d.setHours(hours, minutes, seconds, 0);
        return d;
    }
    startOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    }
    endOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 0);
    }
    // ── Arithmetic ────────────────────────────────────────────────────────────
    addYears(date, years) {
        const d = new Date(date);
        d.setFullYear(d.getFullYear() + years);
        return d;
    }
    addMonths(date, months) {
        const d = new Date(date);
        const targetMonth = d.getMonth() + months;
        d.setDate(1); // Prevent day overflow when moving to shorter months
        d.setMonth(targetMonth);
        return d;
    }
    addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }
    addHours(date, hours) {
        return new Date(date.getTime() + hours * 3_600_000);
    }
    addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60_000);
    }
    addSeconds(date, seconds) {
        return new Date(date.getTime() + seconds * 1_000);
    }
    // ── Comparison ────────────────────────────────────────────────────────────
    compare(a, b) {
        return a.getTime() - b.getTime();
    }
    compareDateOnly(a, b) {
        return this.startOfDay(a).getTime() - this.startOfDay(b).getTime();
    }
    diffInMs(a, b) {
        return Math.abs(a.getTime() - b.getTime());
    }
    // ── Parsing / Formatting ──────────────────────────────────────────────────
    /**
     * Parses a string using a simple token-based approach.
     * Supports: yyyy, MM, dd, HH, mm, ss (also M, d, H, m, s without padding).
     */
    parse(value, format) {
        if (!value || !value.trim())
            return null;
        // Build a regex from the format string
        const tokenMap = {
            yyyy: '(?<yyyy>\\d{4})',
            MM: '(?<MM>\\d{1,2})',
            dd: '(?<dd>\\d{1,2})',
            M: '(?<MM>\\d{1,2})',
            d: '(?<dd>\\d{1,2})',
            HH: '(?<HH>\\d{1,2})',
            mm: '(?<mm>\\d{1,2})',
            ss: '(?<ss>\\d{1,2})',
            H: '(?<HH>\\d{1,2})',
            m: '(?<mm>\\d{1,2})',
            s: '(?<ss>\\d{1,2})',
        };
        let regexStr = format.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        for (const [token, group] of Object.entries(tokenMap)) {
            regexStr = regexStr.replace(token, group);
        }
        const match = new RegExp(`^${regexStr}$`).exec(value.trim());
        if (!match?.groups)
            return null;
        const g = match.groups;
        const year = parseInt(g['yyyy'] ?? new Date().getFullYear().toString(), 10);
        const month = parseInt(g['MM'] ?? '1', 10) - 1;
        const day = parseInt(g['dd'] ?? '1', 10);
        const hours = parseInt(g['HH'] ?? '0', 10);
        const minutes = parseInt(g['mm'] ?? '0', 10);
        const seconds = parseInt(g['ss'] ?? '0', 10);
        const date = new Date(year, month, day, hours, minutes, seconds, 0);
        return this.isValid(date) ? date : null;
    }
    format(date, format) {
        if (!this.isValid(date))
            return '';
        const pad2 = (n) => String(n).padStart(2, '0');
        return format
            .replace('yyyy', String(date.getFullYear()))
            .replace('MM', pad2(date.getMonth() + 1))
            .replace('dd', pad2(date.getDate()))
            .replace('HH', pad2(date.getHours()))
            .replace('mm', pad2(date.getMinutes()))
            .replace('ss', pad2(date.getSeconds()))
            .replace('M', String(date.getMonth() + 1))
            .replace('d', String(date.getDate()))
            .replace('H', String(date.getHours()))
            .replace('m', String(date.getMinutes()))
            .replace('s', String(date.getSeconds()));
    }
    // ── Validation ────────────────────────────────────────────────────────────
    isValid(date) {
        return date instanceof Date && !isNaN(date.getTime());
    }
    isDateInstance(obj) {
        return obj instanceof Date;
    }
    // ── Locale helpers ────────────────────────────────────────────────────────
    setLocale(locale) {
        this.locale = locale;
    }
    getWeekdayNames(style, firstDayOfWeek) {
        const formatter = new Intl.DateTimeFormat(this.locale, { weekday: style });
        // Jan 5 2025 is a Sunday (day 0), so we offset from there
        const names = [];
        for (let i = 0; i < 7; i++) {
            const dayIndex = (i + firstDayOfWeek) % 7;
            // Jan 5 = Sun (0), Jan 6 = Mon (1), ...
            const date = new Date(2025, 0, 5 + dayIndex);
            names.push(formatter.format(date));
        }
        return names;
    }
    getMonthNames(style) {
        const formatter = new Intl.DateTimeFormat(this.locale, { month: style });
        return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(2025, i, 1)));
    }
    getFirstDayOfWeek() {
        // Use Intl.Locale if available (modern browsers), fallback to Monday (1)
        try {
            const locale = new Intl.Locale(this.locale);
            const firstDay = locale.weekInfo?.firstDay ?? 1;
            // Intl returns 7 for Sunday in some locales; normalize to 0
            return firstDay === 7 ? 0 : firstDay;
        }
        catch {
            return 1; // Default to Monday
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxNativeDateTimeAdapter, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxNativeDateTimeAdapter }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxNativeDateTimeAdapter, decorators: [{
            type: Injectable
        }] });

/** German (DE) format set. */
const NGX_DATE_TIME_FORMATS_DE = {
    display: {
        dateInput: 'dd.MM.yyyy',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'dd.MM.yyyy HH:mm:ss',
        monthYearLabel: 'MM.yyyy',
    },
    parse: {
        dateInput: 'dd.MM.yyyy',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'dd.MM.yyyy HH:mm:ss',
    },
};
/** US format set. */
const NGX_DATE_TIME_FORMATS_US = {
    display: {
        dateInput: 'MM/dd/yyyy',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'MM/dd/yyyy HH:mm:ss',
        monthYearLabel: 'MM/yyyy',
    },
    parse: {
        dateInput: 'MM/dd/yyyy',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'MM/dd/yyyy HH:mm:ss',
    },
};
/** ISO 8601 format set. */
const NGX_DATE_TIME_FORMATS_ISO = {
    display: {
        dateInput: 'yyyy-MM-dd',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'yyyy-MM-dd HH:mm:ss',
        monthYearLabel: 'yyyy-MM',
    },
    parse: {
        dateInput: 'yyyy-MM-dd',
        timeInput: 'HH:mm:ss',
        dateTimeInput: 'yyyy-MM-dd HH:mm:ss',
    },
};
/**
 * Injection token for date-time formats.
 * Defaults to NGX_DATE_TIME_FORMATS_ISO when not provided.
 */
const NGX_DATE_TIME_FORMATS = new InjectionToken('NGX_DATE_TIME_FORMATS', { providedIn: 'root', factory: () => NGX_DATE_TIME_FORMATS_ISO });

/** Default English labels. */
const NGX_DEFAULT_LABELS = {
    apply: 'Apply',
    cancel: 'Cancel',
    reset: 'Reset',
    selectPeriod: 'Select period',
    selectDate: 'Select date',
    selectTime: 'Select time',
    selectDateTime: 'Select date & time',
    startTime: 'Start time',
    endTime: 'End time',
    duration: 'Duration',
    today: 'Today',
    last24h: 'Last 24 hours',
    thisWeek: 'This week',
    last7Days: 'Last 7 days',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    last30Days: 'Last 30 days',
    custom: 'Custom',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    closePanel: 'Close',
    clearValue: 'Clear',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
};
/** Injection token for UI labels. */
const NGX_LABELS = new InjectionToken('NGX_LABELS', {
    providedIn: 'root',
    factory: () => NGX_DEFAULT_LABELS,
});

/**
 * Creates a TimeValue, clamping each field to its valid range.
 */
function createTimeValue(hours = 0, minutes = 0, seconds = 0) {
    return {
        hours: Math.max(0, Math.min(23, Math.round(hours))),
        minutes: Math.max(0, Math.min(59, Math.round(minutes))),
        seconds: Math.max(0, Math.min(59, Math.round(seconds))),
    };
}
/**
 * Extracts a TimeValue from a native JS Date.
 */
function timeValueFromDate(date) {
    return createTimeValue(date.getHours(), date.getMinutes(), date.getSeconds());
}
/**
 * Applies a TimeValue to a Date, returning a new Date.
 */
function applyTimeToDate(date, time) {
    const d = new Date(date);
    d.setHours(time.hours, time.minutes, time.seconds, 0);
    return d;
}
/**
 * Compares two TimeValues. Returns negative if a < b, 0 if equal, positive if a > b.
 */
function compareTimeValues(a, b) {
    return a.hours !== b.hours
        ? a.hours - b.hours
        : a.minutes !== b.minutes
            ? a.minutes - b.minutes
            : a.seconds - b.seconds;
}
/**
 * Formats a TimeValue as HH:mm:ss or HH:mm depending on showSeconds.
 */
function formatTimeValue(time, showSeconds = true) {
    const pad = (n) => String(n).padStart(2, '0');
    const base = `${pad(time.hours)}:${pad(time.minutes)}`;
    return showSeconds ? `${base}:${pad(time.seconds)}` : base;
}
/**
 * Parses a time string (HH:mm or HH:mm:ss) to a TimeValue.
 * Returns null if the string is invalid.
 */
function parseTimeValue(str) {
    const match = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!match)
        return null;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const s = match[3] ? parseInt(match[3], 10) : 0;
    if (h > 23 || m > 59 || s > 59)
        return null;
    return createTimeValue(h, m, s);
}

/**
 * Formats a duration (in milliseconds) as a human-readable string.
 * E.g. "65 days, 9 h, 31 min, 30 sec"
 */
function formatDuration(ms, labels = { days: 'd', hours: 'h', minutes: 'min', seconds: 'sec' }) {
    const totalSeconds = Math.floor(ms / 1000);
    const secs = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const mins = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);
    const parts = [];
    if (days > 0)
        parts.push(`${days} ${labels.days}`);
    if (hours > 0)
        parts.push(`${hours} ${labels.hours}`);
    if (mins > 0)
        parts.push(`${mins} ${labels.minutes}`);
    if (secs > 0 || parts.length === 0)
        parts.push(`${secs} ${labels.seconds}`);
    return parts.join(', ');
}
/**
 * Returns an array of Date objects representing the calendar grid for a given
 * month/year, padded to full weeks based on firstDayOfWeek.
 *
 * @param year        Full year number
 * @param month       0-based month index
 * @param firstDayOfWeek  0=Sun, 1=Mon
 * @param adapter     Adapter used to create Date instances
 */
function buildCalendarGrid(year, month, firstDayOfWeek, adapter) {
    const firstOfMonth = adapter.createDate(year, month, 1);
    const numDays = adapter.getNumDaysInMonth(year, month);
    const dayOfWeekFirst = adapter.getDayOfWeek(firstOfMonth);
    // How many days to prepend from the previous month
    let leadingDays = (dayOfWeekFirst - firstDayOfWeek + 7) % 7;
    const cells = [];
    // Leading days from the previous month
    for (let i = leadingDays; i > 0; i--) {
        cells.push({
            date: adapter.addDays(firstOfMonth, -i),
            isCurrentMonth: false,
        });
    }
    // Days of the current month
    for (let d = 1; d <= numDays; d++) {
        cells.push({
            date: adapter.createDate(year, month, d),
            isCurrentMonth: true,
        });
    }
    // Trailing days to complete the last row (always fill to 6 rows = 42 cells)
    const totalCells = 42;
    let trailingDay = 1;
    while (cells.length < totalCells) {
        const lastDate = cells[cells.length - 1].date;
        cells.push({
            date: adapter.addDays(lastDate, 1),
            isCurrentMonth: false,
        });
        trailingDay++;
    }
    return cells;
}
/**
 * Clamps a value within a [min, max] range using the adapter's compare method.
 * Returns the value if within range, min if below, max if above.
 */
function clampDate(value, min, max, adapter) {
    if (min && adapter.compare(value, min) < 0)
        return min;
    if (max && adapter.compare(value, max) > 0)
        return max;
    return value;
}
/** Returns true if two optional dates represent the same calendar day. */
function isSameDayOrNull(a, b, adapter) {
    if (!a || !b)
        return false;
    return adapter.isSameDay(a, b);
}

/**
 * Shared calendar grid component.
 * Renders a single month with navigation arrows and emits day selections.
 * Supports range highlighting when both rangeStart and rangeEnd are provided.
 *
 * Design decision: This is a "dumb" component — it renders whatever state
 * is passed in via inputs and delegates all decisions to the parent picker.
 */
class NgxCalendarComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        // ── Inputs ──────────────────────────────────────────────────────────────────
        /** Displayed month (0-based) */
        this.viewMonth = input.required(/* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewMonth" }] : /* istanbul ignore next */ []));
        /** Displayed year */
        this.viewYear = input.required(/* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewYear" }] : /* istanbul ignore next */ []));
        /** Currently selected single date (for date/datetime pickers) */
        this.selectedDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "selectedDate" }] : /* istanbul ignore next */ []));
        /** Range start */
        this.rangeStart = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rangeStart" }] : /* istanbul ignore next */ []));
        /** Range end */
        this.rangeEnd = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rangeEnd" }] : /* istanbul ignore next */ []));
        /** Hover candidate (for range hover preview) */
        this.hoverDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "hoverDate" }] : /* istanbul ignore next */ []));
        /** Min selectable date */
        this.minDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
        /** Max selectable date */
        this.maxDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
        /** Disabled individual dates */
        this.disabledDates = input([], /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabledDates" }] : /* istanbul ignore next */ []));
        /** Show/hide navigation arrows */
        this.showPrevNav = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showPrevNav" }] : /* istanbul ignore next */ []));
        this.showNextNav = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showNextNav" }] : /* istanbul ignore next */ []));
        // ── Outputs ─────────────────────────────────────────────────────────────────
        this.daySelected = output();
        this.onDayHover = output();
        this.prevMonthClicked = output();
        this.nextMonthClicked = output();
        // ── Computed ─────────────────────────────────────────────────────────────────
        this.weekdayNames = computed(() => this.adapter.getWeekdayNames('narrow', this.adapter.getFirstDayOfWeek()), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "weekdayNames" }] : /* istanbul ignore next */ []));
        this.monthNames = computed(() => this.adapter.getMonthNames('long'), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "monthNames" }] : /* istanbul ignore next */ []));
        this.monthYearLabel = computed(() => {
            const name = this.monthNames()[this.viewMonth()];
            return `${name} ${this.viewYear()}`;
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "monthYearLabel" }] : /* istanbul ignore next */ []));
        this.cells = computed(() => buildCalendarGrid(this.viewYear(), this.viewMonth(), this.adapter.getFirstDayOfWeek(), this.adapter).map(cell => ({
            date: cell.date,
            isCurrentMonth: cell.isCurrentMonth,
            dayNumber: this.adapter.getDate(cell.date),
        })), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "cells" }] : /* istanbul ignore next */ []));
    }
    ngOnInit() { }
    // ── Helper predicates ────────────────────────────────────────────────────────
    isToday(date) {
        return this.adapter.isSameDay(date, this.adapter.today());
    }
    isSelected(date) {
        return this.selectedDate() !== null && this.adapter.isSameDay(date, this.selectedDate());
    }
    isRangeStart(date) {
        return this.rangeStart() !== null && this.adapter.isSameDay(date, this.rangeStart());
    }
    isRangeEnd(date) {
        return this.rangeEnd() !== null && this.adapter.isSameDay(date, this.rangeEnd());
    }
    isInRange(date) {
        const start = this.rangeStart();
        const end = this.rangeEnd() ?? this.hoverDate();
        if (!start || !end)
            return false;
        if (this.adapter.compareDateOnly(start, end) > 0) {
            return this.adapter.isInRangeDateOnly(date, end, start);
        }
        return this.adapter.isInRangeDateOnly(date, start, end);
    }
    isDisabled(date) {
        const min = this.minDate();
        const max = this.maxDate();
        if (min && this.adapter.compareDateOnly(date, min) < 0)
            return true;
        if (max && this.adapter.compareDateOnly(date, max) > 0)
            return true;
        return this.disabledDates().some(d => this.adapter.isSameDay(d, date));
    }
    dayAriaLabel(date) {
        return this.adapter.format(date, 'dd. MM. yyyy');
    }
    onDayClick(date) {
        if (!this.isDisabled(date)) {
            this.daySelected.emit(date);
        }
    }
    onPrevMonth() { this.prevMonthClicked.emit(); }
    onNextMonth() { this.nextMonthClicked.emit(); }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxCalendarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxCalendarComponent, isStandalone: true, selector: "ngx-calendar", inputs: { viewMonth: { classPropertyName: "viewMonth", publicName: "viewMonth", isSignal: true, isRequired: true, transformFunction: null }, viewYear: { classPropertyName: "viewYear", publicName: "viewYear", isSignal: true, isRequired: true, transformFunction: null }, selectedDate: { classPropertyName: "selectedDate", publicName: "selectedDate", isSignal: true, isRequired: false, transformFunction: null }, rangeStart: { classPropertyName: "rangeStart", publicName: "rangeStart", isSignal: true, isRequired: false, transformFunction: null }, rangeEnd: { classPropertyName: "rangeEnd", publicName: "rangeEnd", isSignal: true, isRequired: false, transformFunction: null }, hoverDate: { classPropertyName: "hoverDate", publicName: "hoverDate", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, disabledDates: { classPropertyName: "disabledDates", publicName: "disabledDates", isSignal: true, isRequired: false, transformFunction: null }, showPrevNav: { classPropertyName: "showPrevNav", publicName: "showPrevNav", isSignal: true, isRequired: false, transformFunction: null }, showNextNav: { classPropertyName: "showNextNav", publicName: "showNextNav", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { daySelected: "daySelected", onDayHover: "onDayHover", prevMonthClicked: "prevMonthClicked", nextMonthClicked: "nextMonthClicked" }, ngImport: i0, template: `
    <div class="ngx-calendar" role="grid" [attr.aria-label]="monthYearLabel()">
      <!-- Header: Month Navigation -->
      <div class="ngx-calendar__header">
        <button
          *ngIf="showPrevNav()"
          class="ngx-calendar__nav-btn"
          type="button"
          (click)="onPrevMonth()"
          [attr.aria-label]="labels.previousMonth"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span *ngIf="!showPrevNav()" class="ngx-calendar__nav-spacer"></span>

        <span class="ngx-calendar__month-title">{{ monthYearLabel() }}</span>

        <button
          *ngIf="showNextNav()"
          class="ngx-calendar__nav-btn"
          type="button"
          (click)="onNextMonth()"
          [attr.aria-label]="labels.nextMonth"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <span *ngIf="!showNextNav()" class="ngx-calendar__nav-spacer"></span>
      </div>

      <!-- Weekday Names -->
      <div class="ngx-calendar__grid" role="row">
        <div
          *ngFor="let wd of weekdayNames()"
          class="ngx-calendar__weekday"
          role="columnheader"
          [attr.aria-label]="wd"
        >{{ wd }}</div>
      </div>

      <!-- Day Cells -->
      <div class="ngx-calendar__grid">
        <button
          *ngFor="let cell of cells()"
          class="ngx-calendar__day"
          [class.ngx-calendar__day--other-month]="!cell.isCurrentMonth"
          [class.ngx-calendar__day--today]="isToday(cell.date)"
          [class.ngx-calendar__day--selected]="isSelected(cell.date)"
          [class.ngx-calendar__day--range-start]="isRangeStart(cell.date)"
          [class.ngx-calendar__day--range-end]="isRangeEnd(cell.date)"
          [class.ngx-calendar__day--in-range]="isInRange(cell.date)"
          [class.ngx-calendar__day--disabled]="isDisabled(cell.date)"
          [attr.aria-pressed]="isSelected(cell.date)"
          [attr.aria-disabled]="isDisabled(cell.date)"
          [attr.aria-label]="dayAriaLabel(cell.date)"
          [disabled]="isDisabled(cell.date)"
          role="gridcell"
          type="button"
          (click)="onDayClick(cell.date)"
          (keydown.enter)="onDayClick(cell.date)"
          (keydown.space)="onDayClick(cell.date)"
          (mouseenter)="onDayHover.emit(cell.date)"
        >
          <span aria-hidden="true">{{ cell.dayNumber }}</span>
        </button>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxCalendarComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-calendar',
                    standalone: true,
                    imports: [CommonModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ngx-calendar" role="grid" [attr.aria-label]="monthYearLabel()">
      <!-- Header: Month Navigation -->
      <div class="ngx-calendar__header">
        <button
          *ngIf="showPrevNav()"
          class="ngx-calendar__nav-btn"
          type="button"
          (click)="onPrevMonth()"
          [attr.aria-label]="labels.previousMonth"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span *ngIf="!showPrevNav()" class="ngx-calendar__nav-spacer"></span>

        <span class="ngx-calendar__month-title">{{ monthYearLabel() }}</span>

        <button
          *ngIf="showNextNav()"
          class="ngx-calendar__nav-btn"
          type="button"
          (click)="onNextMonth()"
          [attr.aria-label]="labels.nextMonth"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <span *ngIf="!showNextNav()" class="ngx-calendar__nav-spacer"></span>
      </div>

      <!-- Weekday Names -->
      <div class="ngx-calendar__grid" role="row">
        <div
          *ngFor="let wd of weekdayNames()"
          class="ngx-calendar__weekday"
          role="columnheader"
          [attr.aria-label]="wd"
        >{{ wd }}</div>
      </div>

      <!-- Day Cells -->
      <div class="ngx-calendar__grid">
        <button
          *ngFor="let cell of cells()"
          class="ngx-calendar__day"
          [class.ngx-calendar__day--other-month]="!cell.isCurrentMonth"
          [class.ngx-calendar__day--today]="isToday(cell.date)"
          [class.ngx-calendar__day--selected]="isSelected(cell.date)"
          [class.ngx-calendar__day--range-start]="isRangeStart(cell.date)"
          [class.ngx-calendar__day--range-end]="isRangeEnd(cell.date)"
          [class.ngx-calendar__day--in-range]="isInRange(cell.date)"
          [class.ngx-calendar__day--disabled]="isDisabled(cell.date)"
          [attr.aria-pressed]="isSelected(cell.date)"
          [attr.aria-disabled]="isDisabled(cell.date)"
          [attr.aria-label]="dayAriaLabel(cell.date)"
          [disabled]="isDisabled(cell.date)"
          role="gridcell"
          type="button"
          (click)="onDayClick(cell.date)"
          (keydown.enter)="onDayClick(cell.date)"
          (keydown.space)="onDayClick(cell.date)"
          (mouseenter)="onDayHover.emit(cell.date)"
        >
          <span aria-hidden="true">{{ cell.dayNumber }}</span>
        </button>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { viewMonth: [{ type: i0.Input, args: [{ isSignal: true, alias: "viewMonth", required: true }] }], viewYear: [{ type: i0.Input, args: [{ isSignal: true, alias: "viewYear", required: true }] }], selectedDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedDate", required: false }] }], rangeStart: [{ type: i0.Input, args: [{ isSignal: true, alias: "rangeStart", required: false }] }], rangeEnd: [{ type: i0.Input, args: [{ isSignal: true, alias: "rangeEnd", required: false }] }], hoverDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "hoverDate", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], disabledDates: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabledDates", required: false }] }], showPrevNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showPrevNav", required: false }] }], showNextNav: [{ type: i0.Input, args: [{ isSignal: true, alias: "showNextNav", required: false }] }], daySelected: [{ type: i0.Output, args: ["daySelected"] }], onDayHover: [{ type: i0.Output, args: ["onDayHover"] }], prevMonthClicked: [{ type: i0.Output, args: ["prevMonthClicked"] }], nextMonthClicked: [{ type: i0.Output, args: ["nextMonthClicked"] }] } });

/**
 * Reusable time selector component.
 * Renders HH : mm : ss spinners with keyboard support (↑/↓ arrows).
 * No free text input — only spinner/button interaction.
 */
class NgxTimeSelectorComponent {
    constructor() {
        this.labels = inject(NGX_LABELS);
        this.value = model.required(/* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.showSeconds = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSeconds" }] : /* istanbul ignore next */ []));
        this.label = input('Time selector', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "label" }] : /* istanbul ignore next */ []));
        this.timeChanged = output();
    }
    padded(n) {
        return String(n).padStart(2, '0');
    }
    changeHours(delta) {
        const v = this.value();
        const h = (v.hours + delta + 24) % 24;
        const next = createTimeValue(h, v.minutes, v.seconds);
        this.value.set(next);
        this.timeChanged.emit(next);
    }
    changeMinutes(delta) {
        const v = this.value();
        let m = v.minutes + delta;
        let h = v.hours;
        if (m < 0) {
            m = 59;
            h = (h - 1 + 24) % 24;
        }
        else if (m > 59) {
            m = 0;
            h = (h + 1) % 24;
        }
        const next = createTimeValue(h, m, v.seconds);
        this.value.set(next);
        this.timeChanged.emit(next);
    }
    changeSeconds(delta) {
        const v = this.value();
        let s = v.seconds + delta;
        let m = v.minutes;
        let h = v.hours;
        if (s < 0) {
            s = 59;
            m -= 1;
            if (m < 0) {
                m = 59;
                h = (h - 1 + 24) % 24;
            }
        }
        else if (s > 59) {
            s = 0;
            m += 1;
            if (m > 59) {
                m = 0;
                h = (h + 1) % 24;
            }
        }
        const next = createTimeValue(h, m, s);
        this.value.set(next);
        this.timeChanged.emit(next);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxTimeSelectorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxTimeSelectorComponent, isStandalone: true, selector: "ngx-time-selector", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: true, transformFunction: null }, showSeconds: { classPropertyName: "showSeconds", publicName: "showSeconds", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", timeChanged: "timeChanged" }, ngImport: i0, template: `
    <div class="ngx-time-selector" role="group" [attr.aria-label]="label()">
      <!-- Hours -->
      <div class="ngx-time-selector__segment">
        <button
          class="ngx-time-selector__btn ngx-time-selector__btn--up"
          type="button"
          [attr.aria-label]="'Increase ' + labels.hours"
          (click)="changeHours(1)"
          (keydown.arrowup)="changeHours(1); $event.preventDefault()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <div
          class="ngx-time-selector__display"
          role="spinbutton"
          [attr.aria-label]="labels.hours"
          [attr.aria-valuenow]="value().hours"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="23"
          tabindex="0"
          (keydown.arrowup)="changeHours(1); $event.preventDefault()"
          (keydown.arrowdown)="changeHours(-1); $event.preventDefault()"
        >{{ padded(value().hours) }}</div>
        <button
          class="ngx-time-selector__btn ngx-time-selector__btn--down"
          type="button"
          [attr.aria-label]="'Decrease ' + labels.hours"
          (click)="changeHours(-1)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <span class="ngx-time-selector__sep" aria-hidden="true">:</span>

      <!-- Minutes -->
      <div class="ngx-time-selector__segment">
        <button class="ngx-time-selector__btn ngx-time-selector__btn--up" type="button"
          [attr.aria-label]="'Increase ' + labels.minutes"
          (click)="changeMinutes(1)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <div class="ngx-time-selector__display"
          role="spinbutton"
          [attr.aria-label]="labels.minutes"
          [attr.aria-valuenow]="value().minutes"
          [attr.aria-valuemin]="0" [attr.aria-valuemax]="59"
          tabindex="0"
          (keydown.arrowup)="changeMinutes(1); $event.preventDefault()"
          (keydown.arrowdown)="changeMinutes(-1); $event.preventDefault()">{{ padded(value().minutes) }}</div>
        <button class="ngx-time-selector__btn ngx-time-selector__btn--down" type="button"
          [attr.aria-label]="'Decrease ' + labels.minutes"
          (click)="changeMinutes(-1)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <ng-container *ngIf="showSeconds()">
        <span class="ngx-time-selector__sep" aria-hidden="true">:</span>
        <!-- Seconds -->
        <div class="ngx-time-selector__segment">
          <button class="ngx-time-selector__btn ngx-time-selector__btn--up" type="button"
            [attr.aria-label]="'Increase ' + labels.seconds"
            (click)="changeSeconds(1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <div class="ngx-time-selector__display"
            role="spinbutton"
            [attr.aria-label]="labels.seconds"
            [attr.aria-valuenow]="value().seconds"
            [attr.aria-valuemin]="0" [attr.aria-valuemax]="59"
            tabindex="0"
            (keydown.arrowup)="changeSeconds(1); $event.preventDefault()"
            (keydown.arrowdown)="changeSeconds(-1); $event.preventDefault()">{{ padded(value().seconds) }}</div>
          <button class="ngx-time-selector__btn ngx-time-selector__btn--down" type="button"
            [attr.aria-label]="'Decrease ' + labels.seconds"
            (click)="changeSeconds(-1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </ng-container>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxTimeSelectorComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-time-selector',
                    standalone: true,
                    imports: [CommonModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ngx-time-selector" role="group" [attr.aria-label]="label()">
      <!-- Hours -->
      <div class="ngx-time-selector__segment">
        <button
          class="ngx-time-selector__btn ngx-time-selector__btn--up"
          type="button"
          [attr.aria-label]="'Increase ' + labels.hours"
          (click)="changeHours(1)"
          (keydown.arrowup)="changeHours(1); $event.preventDefault()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>
        <div
          class="ngx-time-selector__display"
          role="spinbutton"
          [attr.aria-label]="labels.hours"
          [attr.aria-valuenow]="value().hours"
          [attr.aria-valuemin]="0"
          [attr.aria-valuemax]="23"
          tabindex="0"
          (keydown.arrowup)="changeHours(1); $event.preventDefault()"
          (keydown.arrowdown)="changeHours(-1); $event.preventDefault()"
        >{{ padded(value().hours) }}</div>
        <button
          class="ngx-time-selector__btn ngx-time-selector__btn--down"
          type="button"
          [attr.aria-label]="'Decrease ' + labels.hours"
          (click)="changeHours(-1)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      <span class="ngx-time-selector__sep" aria-hidden="true">:</span>

      <!-- Minutes -->
      <div class="ngx-time-selector__segment">
        <button class="ngx-time-selector__btn ngx-time-selector__btn--up" type="button"
          [attr.aria-label]="'Increase ' + labels.minutes"
          (click)="changeMinutes(1)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
        </button>
        <div class="ngx-time-selector__display"
          role="spinbutton"
          [attr.aria-label]="labels.minutes"
          [attr.aria-valuenow]="value().minutes"
          [attr.aria-valuemin]="0" [attr.aria-valuemax]="59"
          tabindex="0"
          (keydown.arrowup)="changeMinutes(1); $event.preventDefault()"
          (keydown.arrowdown)="changeMinutes(-1); $event.preventDefault()">{{ padded(value().minutes) }}</div>
        <button class="ngx-time-selector__btn ngx-time-selector__btn--down" type="button"
          [attr.aria-label]="'Decrease ' + labels.minutes"
          (click)="changeMinutes(-1)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>

      <ng-container *ngIf="showSeconds()">
        <span class="ngx-time-selector__sep" aria-hidden="true">:</span>
        <!-- Seconds -->
        <div class="ngx-time-selector__segment">
          <button class="ngx-time-selector__btn ngx-time-selector__btn--up" type="button"
            [attr.aria-label]="'Increase ' + labels.seconds"
            (click)="changeSeconds(1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
          <div class="ngx-time-selector__display"
            role="spinbutton"
            [attr.aria-label]="labels.seconds"
            [attr.aria-valuenow]="value().seconds"
            [attr.aria-valuemin]="0" [attr.aria-valuemax]="59"
            tabindex="0"
            (keydown.arrowup)="changeSeconds(1); $event.preventDefault()"
            (keydown.arrowdown)="changeSeconds(-1); $event.preventDefault()">{{ padded(value().seconds) }}</div>
          <button class="ngx-time-selector__btn ngx-time-selector__btn--down" type="button"
            [attr.aria-label]="'Decrease ' + labels.seconds"
            (click)="changeSeconds(-1)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
      </ng-container>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: true }] }, { type: i0.Output, args: ["valueChange"] }], showSeconds: [{ type: i0.Input, args: [{ isSignal: true, alias: "showSeconds", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], timeChanged: [{ type: i0.Output, args: ["timeChanged"] }] } });

/**
 * Preset quick-select panel displayed on the left of range picker panels.
 * Emits the preset key when a preset is selected.
 */
class NgxPresetsPanelComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        this.presets = input.required(/* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "presets" }] : /* istanbul ignore next */ []));
        this.activeKey = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "activeKey" }] : /* istanbul ignore next */ []));
        this.presetSelected = output();
    }
    onSelect(preset) {
        this.presetSelected.emit(preset);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxPresetsPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxPresetsPanelComponent, isStandalone: true, selector: "ngx-presets-panel", inputs: { presets: { classPropertyName: "presets", publicName: "presets", isSignal: true, isRequired: true, transformFunction: null }, activeKey: { classPropertyName: "activeKey", publicName: "activeKey", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { presetSelected: "presetSelected" }, ngImport: i0, template: `
    <div class="ngx-presets" role="listbox" [attr.aria-label]="'Quick select'">
      <button
        *ngFor="let preset of presets()"
        class="ngx-presets__btn"
        [class.ngx-presets__btn--active]="activeKey() === preset.key"
        [attr.aria-selected]="activeKey() === preset.key"
        role="option"
        type="button"
        (click)="onSelect(preset)"
      >
        {{ preset.label }}
      </button>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxPresetsPanelComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-presets-panel',
                    standalone: true,
                    imports: [CommonModule],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    template: `
    <div class="ngx-presets" role="listbox" [attr.aria-label]="'Quick select'">
      <button
        *ngFor="let preset of presets()"
        class="ngx-presets__btn"
        [class.ngx-presets__btn--active]="activeKey() === preset.key"
        [attr.aria-selected]="activeKey() === preset.key"
        role="option"
        type="button"
        (click)="onSelect(preset)"
      >
        {{ preset.label }}
      </button>
    </div>
  `,
                }]
        }], propDecorators: { presets: [{ type: i0.Input, args: [{ isSignal: true, alias: "presets", required: true }] }], activeKey: [{ type: i0.Input, args: [{ isSignal: true, alias: "activeKey", required: false }] }], presetSelected: [{ type: i0.Output, args: ["presetSelected"] }] } });

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
class NgxDateTimeRangePickerComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        this.formats = inject(NGX_DATE_TIME_FORMATS);
        // ── Inputs ──────────────────────────────────────────────────────────────────
        /** Two-way bindable value — works directly with Signal Forms model() */
        this.value = model(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.invalid = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
        this.showSeconds = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSeconds" }] : /* istanbul ignore next */ []));
        this.minDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
        /** Custom presets — if omitted, default presets are shown. */
        this.customPresets = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "customPresets" }] : /* istanbul ignore next */ []));
        // ── Internal state ───────────────────────────────────────────────────────────
        this.isOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
        this.isMobile = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isMobile" }] : /* istanbul ignore next */ []));
        /** Pending selection — committed to `value` only on Apply */
        this.pendingStart = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingStart" }] : /* istanbul ignore next */ []));
        this.pendingEnd = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingEnd" }] : /* istanbul ignore next */ []));
        this.pendingStartTime = signal(createTimeValue(0, 0, 0), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingStartTime" }] : /* istanbul ignore next */ []));
        this.pendingEndTime = signal(createTimeValue(23, 59, 59), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingEndTime" }] : /* istanbul ignore next */ []));
        this.hoverDate = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "hoverDate" }] : /* istanbul ignore next */ []));
        this.activePresetKey = signal('custom', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "activePresetKey" }] : /* istanbul ignore next */ []));
        /** Which month is shown in the left calendar */
        this.leftMonth = signal(new Date().getMonth(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftMonth" }] : /* istanbul ignore next */ []));
        this.leftYear = signal(new Date().getFullYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftYear" }] : /* istanbul ignore next */ []));
        // ── Computed: right calendar is always one month after left ──────────────────
        this.rightMonth = computed(() => (this.leftMonth() + 1) % 12, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightMonth" }] : /* istanbul ignore next */ []));
        this.rightYear = computed(() => this.leftMonth() === 11 ? this.leftYear() + 1 : this.leftYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightYear" }] : /* istanbul ignore next */ []));
        // ── Computed: display ────────────────────────────────────────────────────────
        this.displayValue = computed(() => {
            const v = this.value();
            if (!v?.start || !v?.end)
                return null;
            const fmt = this.formats.display.dateTimeInput;
            return `${this.adapter.format(v.start, fmt)} – ${this.adapter.format(v.end, fmt)}`;
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
        this.placeholderText = computed(() => this.placeholder() || `${this.formats.display.dateTimeInput} – ${this.formats.display.dateTimeInput}`, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholderText" }] : /* istanbul ignore next */ []));
        this.rangePreviewText = computed(() => {
            const s = this.pendingStart();
            const e = this.pendingEnd();
            if (!s)
                return null;
            const fmt = this.formats.display.dateTimeInput;
            const startStr = this.adapter.format(this.adapter.setTime(s, this.pendingStartTime().hours, this.pendingStartTime().minutes, this.pendingStartTime().seconds), fmt);
            if (!e)
                return startStr;
            const endStr = this.adapter.format(this.adapter.setTime(e, this.pendingEndTime().hours, this.pendingEndTime().minutes, this.pendingEndTime().seconds), fmt);
            return `${startStr} – ${endStr}`;
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rangePreviewText" }] : /* istanbul ignore next */ []));
        this.durationText = computed(() => {
            const s = this.pendingStart();
            const e = this.pendingEnd();
            if (!s || !e)
                return null;
            const start = this.adapter.setTime(s, this.pendingStartTime().hours, this.pendingStartTime().minutes, this.pendingStartTime().seconds);
            const end = this.adapter.setTime(e, this.pendingEndTime().hours, this.pendingEndTime().minutes, this.pendingEndTime().seconds);
            if (this.adapter.compare(start, end) > 0)
                return null;
            const ms = this.adapter.diffInMs(start, end);
            return formatDuration(ms);
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "durationText" }] : /* istanbul ignore next */ []));
        this.canApply = computed(() => this.pendingStart() !== null && this.pendingEnd() !== null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "canApply" }] : /* istanbul ignore next */ []));
        // ── Default presets ──────────────────────────────────────────────────────────
        this.effectivePresets = computed(() => {
            if (this.customPresets())
                return this.customPresets();
            const a = this.adapter;
            return [
                {
                    key: 'today', label: this.labels.today,
                    getRangeFn: () => ({ start: a.today(), end: a.today() }),
                },
                {
                    key: 'last24h', label: this.labels.last24h,
                    getRangeFn: () => ({ start: a.addHours(a.now(), -24), end: a.now() }),
                },
                {
                    key: 'thisWeek', label: this.labels.thisWeek,
                    getRangeFn: () => {
                        const now = a.today();
                        const dow = a.getDayOfWeek(now);
                        const diff = (dow - a.getFirstDayOfWeek() + 7) % 7;
                        return { start: a.addDays(now, -diff), end: now };
                    },
                },
                {
                    key: 'last7Days', label: this.labels.last7Days,
                    getRangeFn: () => ({ start: a.addDays(a.today(), -6), end: a.today() }),
                },
                {
                    key: 'thisMonth', label: this.labels.thisMonth,
                    getRangeFn: () => {
                        const now = a.today();
                        return {
                            start: a.createDate(a.getYear(now), a.getMonth(now), 1),
                            end: now,
                        };
                    },
                },
                { key: 'custom', label: this.labels.custom, getRangeFn: () => ({ start: a.today(), end: a.today() }) },
            ];
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "effectivePresets" }] : /* istanbul ignore next */ []));
        // ── ControlValueAccessor ─────────────────────────────────────────────────────
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    writeValue(val) {
        this.value.set(val);
    }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(isDisabled) { }
    // ── Panel lifecycle ──────────────────────────────────────────────────────────
    togglePanel() {
        if (this.disabled())
            return;
        this.isOpen() ? this.cancelPanel() : this.openPanel();
    }
    openPanel() {
        if (this.disabled() || this.isOpen())
            return;
        this.isMobile.set(window.innerWidth < 768);
        // Seed pending state from current value
        const v = this.value();
        if (v?.start) {
            this.pendingStart.set(this.adapter.startOfDay(v.start));
            this.pendingStartTime.set(createTimeValue(this.adapter.getHours(v.start), this.adapter.getMinutes(v.start), this.adapter.getSeconds(v.start)));
        }
        else {
            this.pendingStart.set(null);
            this.pendingStartTime.set(createTimeValue(0, 0, 0));
        }
        if (v?.end) {
            this.pendingEnd.set(this.adapter.startOfDay(v.end));
            this.pendingEndTime.set(createTimeValue(this.adapter.getHours(v.end), this.adapter.getMinutes(v.end), this.adapter.getSeconds(v.end)));
        }
        else {
            this.pendingEnd.set(null);
            this.pendingEndTime.set(createTimeValue(23, 59, 59));
        }
        // Set left calendar to start month (or current month)
        const ref = this.pendingStart() ?? this.adapter.today();
        this.leftMonth.set(this.adapter.getMonth(ref));
        this.leftYear.set(this.adapter.getYear(ref));
        this.isOpen.set(true);
    }
    cancelPanel() {
        this.isOpen.set(false);
        this.onTouched();
    }
    applyPanel() {
        const s = this.pendingStart();
        const e = this.pendingEnd();
        if (!s || !e)
            return;
        const st = this.pendingStartTime();
        const et = this.pendingEndTime();
        const start = this.adapter.setTime(s, st.hours, st.minutes, st.seconds);
        const end = this.adapter.setTime(e, et.hours, et.minutes, et.seconds);
        const range = { start, end };
        this.value.set(range);
        this.onChange(range);
        this.onTouched();
        this.activePresetKey.set('custom');
        this.isOpen.set(false);
    }
    clearValue(event) {
        event.stopPropagation();
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
    // ── Day selection logic ──────────────────────────────────────────────────────
    onDaySelected(date) {
        const s = this.pendingStart();
        const e = this.pendingEnd();
        this.activePresetKey.set('custom');
        if (!s || (s && e)) {
            // Start a new selection
            this.pendingStart.set(date);
            this.pendingEnd.set(null);
            this.hoverDate.set(null);
        }
        else {
            // Complete the range
            if (this.adapter.compareDateOnly(date, s) < 0) {
                this.pendingEnd.set(s);
                this.pendingStart.set(date);
            }
            else {
                this.pendingEnd.set(date);
            }
            this.hoverDate.set(null);
        }
    }
    // ── Preset selection ─────────────────────────────────────────────────────────
    onPresetSelected(preset) {
        if (preset.key === 'custom') {
            this.activePresetKey.set('custom');
            return;
        }
        const { start, end } = preset.getRangeFn();
        this.pendingStart.set(this.adapter.startOfDay(start));
        this.pendingEnd.set(this.adapter.startOfDay(end));
        this.pendingStartTime.set(timeValueFromDate(start));
        this.pendingEndTime.set(timeValueFromDate(end));
        const month = this.adapter.getMonth(start);
        const year = this.adapter.getYear(start);
        this.leftMonth.set(month);
        this.leftYear.set(year);
        this.activePresetKey.set(preset.key);
    }
    // ── Time changes ─────────────────────────────────────────────────────────────
    onStartTimeChanged(time) {
        this.pendingStartTime.set(time);
        this.activePresetKey.set('custom');
    }
    onEndTimeChanged(time) {
        this.pendingEndTime.set(time);
        this.activePresetKey.set('custom');
    }
    // ── Calendar navigation ──────────────────────────────────────────────────────
    navigateLeft(delta) {
        let m = this.leftMonth() + delta;
        let y = this.leftYear();
        if (m < 0) {
            m = 11;
            y--;
        }
        else if (m > 11) {
            m = 0;
            y++;
        }
        this.leftMonth.set(m);
        this.leftYear.set(y);
    }
    navigateRight(delta) {
        this.navigateLeft(delta);
    }
    ngOnDestroy() { }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateTimeRangePickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxDateTimeRangePickerComponent, isStandalone: true, selector: "ngx-date-time-range-picker", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, showSeconds: { classPropertyName: "showSeconds", publicName: "showSeconds", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, customPresets: { classPropertyName: "customPresets", publicName: "customPresets", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, providers: [
            {
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxDateTimeRangePickerComponent),
                multi: true,
            },
        ], ngImport: i0, template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDateTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0"
         role="button">
      <!-- Calendar Icon -->
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>

      <!-- Value display -->
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else placeholder">
          {{ displayValue() }}
        </ng-container>
        <ng-template #placeholder>
          <span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span>
        </ng-template>
      </span>

      <!-- Clear button -->
      <button
        *ngIf="displayValue() && !disabled()"
        class="ngx-picker-field__clear"
        type="button"
        [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)"
        tabindex="-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Inline Panel (shown when isOpen) -->
    <div
      *ngIf="isOpen()"
      class="ngx-panel"
      [class.ngx-panel--mobile]="isMobile()"
      role="dialog"
      [attr.aria-label]="labels.selectPeriod"
      [attr.aria-modal]="true"
      (keydown.escape)="cancelPanel()"
    >
      <!-- Panel Header -->
      <div class="ngx-panel__header">
        <div>
          <h2 class="ngx-panel__title">{{ labels.selectPeriod }}</h2>
          <p class="ngx-panel__preview" *ngIf="rangePreviewText()">{{ rangePreviewText() }}</p>
        </div>
        <button
          class="ngx-panel__close"
          type="button"
          [attr.aria-label]="labels.closePanel"
          (click)="cancelPanel()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Panel Body -->
      <div class="ngx-panel__body">
        <!-- Presets -->
        <ngx-presets-panel
          [presets]="effectivePresets()"
          [activeKey]="activePresetKey()"
          (presetSelected)="onPresetSelected($event)"
        />

        <!-- Dual Calendar -->
        <div class="ngx-panel__calendars">
          <ngx-calendar
            [viewYear]="leftYear()"
            [viewMonth]="leftMonth()"
            [rangeStart]="pendingStart()"
            [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()"
            [maxDate]="maxDate()"
            [showPrevNav]="true"
            [showNextNav]="false"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateLeft(-1)"
            (nextMonthClicked)="navigateLeft(1)"
          />
          <ngx-calendar
            [viewYear]="rightYear()"
            [viewMonth]="rightMonth()"
            [rangeStart]="pendingStart()"
            [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()"
            [maxDate]="maxDate()"
            [showPrevNav]="false"
            [showNextNav]="true"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateRight(-1)"
            (nextMonthClicked)="navigateRight(1)"
          />
        </div>

        <!-- Time Panel -->
        <div class="ngx-panel__time-panel">
          <div class="ngx-panel__time-block">
            <h3 class="ngx-panel__time-label">{{ labels.startTime }}</h3>
            <ngx-time-selector
              [value]="pendingStartTime()"
              [showSeconds]="showSeconds()"
              [label]="labels.startTime"
              (timeChanged)="onStartTimeChanged($event)"
            />
          </div>
          <div class="ngx-panel__time-block">
            <h3 class="ngx-panel__time-label">{{ labels.endTime }}</h3>
            <ngx-time-selector
              [value]="pendingEndTime()"
              [showSeconds]="showSeconds()"
              [label]="labels.endTime"
              (timeChanged)="onEndTimeChanged($event)"
            />
          </div>
          <div class="ngx-panel__duration" *ngIf="durationText()">
            {{ labels.duration }}: {{ durationText() }}
          </div>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ rangePreviewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">
            {{ labels.cancel }}
          </button>
          <button
            class="ngx-btn ngx-btn--primary"
            type="button"
            [disabled]="!canApply()"
            (click)="applyPanel()"
          >
            {{ labels.apply }}
          </button>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxCalendarComponent, selector: "ngx-calendar", inputs: ["viewMonth", "viewYear", "selectedDate", "rangeStart", "rangeEnd", "hoverDate", "minDate", "maxDate", "disabledDates", "showPrevNav", "showNextNav"], outputs: ["daySelected", "onDayHover", "prevMonthClicked", "nextMonthClicked"] }, { kind: "component", type: NgxTimeSelectorComponent, selector: "ngx-time-selector", inputs: ["value", "showSeconds", "label"], outputs: ["valueChange", "timeChanged"] }, { kind: "component", type: NgxPresetsPanelComponent, selector: "ngx-presets-panel", inputs: ["presets", "activeKey"], outputs: ["presetSelected"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateTimeRangePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-date-time-range-picker',
                    standalone: true,
                    imports: [
                        CommonModule,
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
                    template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDateTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0"
         role="button">
      <!-- Calendar Icon -->
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>

      <!-- Value display -->
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else placeholder">
          {{ displayValue() }}
        </ng-container>
        <ng-template #placeholder>
          <span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span>
        </ng-template>
      </span>

      <!-- Clear button -->
      <button
        *ngIf="displayValue() && !disabled()"
        class="ngx-picker-field__clear"
        type="button"
        [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)"
        tabindex="-1"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Inline Panel (shown when isOpen) -->
    <div
      *ngIf="isOpen()"
      class="ngx-panel"
      [class.ngx-panel--mobile]="isMobile()"
      role="dialog"
      [attr.aria-label]="labels.selectPeriod"
      [attr.aria-modal]="true"
      (keydown.escape)="cancelPanel()"
    >
      <!-- Panel Header -->
      <div class="ngx-panel__header">
        <div>
          <h2 class="ngx-panel__title">{{ labels.selectPeriod }}</h2>
          <p class="ngx-panel__preview" *ngIf="rangePreviewText()">{{ rangePreviewText() }}</p>
        </div>
        <button
          class="ngx-panel__close"
          type="button"
          [attr.aria-label]="labels.closePanel"
          (click)="cancelPanel()"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Panel Body -->
      <div class="ngx-panel__body">
        <!-- Presets -->
        <ngx-presets-panel
          [presets]="effectivePresets()"
          [activeKey]="activePresetKey()"
          (presetSelected)="onPresetSelected($event)"
        />

        <!-- Dual Calendar -->
        <div class="ngx-panel__calendars">
          <ngx-calendar
            [viewYear]="leftYear()"
            [viewMonth]="leftMonth()"
            [rangeStart]="pendingStart()"
            [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()"
            [maxDate]="maxDate()"
            [showPrevNav]="true"
            [showNextNav]="false"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateLeft(-1)"
            (nextMonthClicked)="navigateLeft(1)"
          />
          <ngx-calendar
            [viewYear]="rightYear()"
            [viewMonth]="rightMonth()"
            [rangeStart]="pendingStart()"
            [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()"
            [maxDate]="maxDate()"
            [showPrevNav]="false"
            [showNextNav]="true"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateRight(-1)"
            (nextMonthClicked)="navigateRight(1)"
          />
        </div>

        <!-- Time Panel -->
        <div class="ngx-panel__time-panel">
          <div class="ngx-panel__time-block">
            <h3 class="ngx-panel__time-label">{{ labels.startTime }}</h3>
            <ngx-time-selector
              [value]="pendingStartTime()"
              [showSeconds]="showSeconds()"
              [label]="labels.startTime"
              (timeChanged)="onStartTimeChanged($event)"
            />
          </div>
          <div class="ngx-panel__time-block">
            <h3 class="ngx-panel__time-label">{{ labels.endTime }}</h3>
            <ngx-time-selector
              [value]="pendingEndTime()"
              [showSeconds]="showSeconds()"
              [label]="labels.endTime"
              (timeChanged)="onEndTimeChanged($event)"
            />
          </div>
          <div class="ngx-panel__duration" *ngIf="durationText()">
            {{ labels.duration }}: {{ durationText() }}
          </div>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ rangePreviewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">
            {{ labels.cancel }}
          </button>
          <button
            class="ngx-btn ngx-btn--primary"
            type="button"
            [disabled]="!canApply()"
            (click)="applyPanel()"
          >
            {{ labels.apply }}
          </button>
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], showSeconds: [{ type: i0.Input, args: [{ isSignal: true, alias: "showSeconds", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], customPresets: [{ type: i0.Input, args: [{ isSignal: true, alias: "customPresets", required: false }] }] } });

/**
 * Date-range picker (no time). Dual calendar view with presets.
 */
class NgxDateRangePickerComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        this.formats = inject(NGX_DATE_TIME_FORMATS);
        this.value = model(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.invalid = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
        this.minDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.customPresets = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "customPresets" }] : /* istanbul ignore next */ []));
        this.isOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
        this.pendingStart = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingStart" }] : /* istanbul ignore next */ []));
        this.pendingEnd = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingEnd" }] : /* istanbul ignore next */ []));
        this.hoverDate = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "hoverDate" }] : /* istanbul ignore next */ []));
        this.activePresetKey = signal('custom', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "activePresetKey" }] : /* istanbul ignore next */ []));
        this.leftMonth = signal(new Date().getMonth(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftMonth" }] : /* istanbul ignore next */ []));
        this.leftYear = signal(new Date().getFullYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "leftYear" }] : /* istanbul ignore next */ []));
        this.rightMonth = computed(() => (this.leftMonth() + 1) % 12, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightMonth" }] : /* istanbul ignore next */ []));
        this.rightYear = computed(() => this.leftMonth() === 11 ? this.leftYear() + 1 : this.leftYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rightYear" }] : /* istanbul ignore next */ []));
        this.displayValue = computed(() => {
            const v = this.value();
            if (!v?.start || !v?.end)
                return null;
            const fmt = this.formats.display.dateInput;
            return `${this.adapter.format(v.start, fmt)} – ${this.adapter.format(v.end, fmt)}`;
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
        this.placeholderText = computed(() => this.placeholder() || `${this.formats.display.dateInput} – ${this.formats.display.dateInput}`, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholderText" }] : /* istanbul ignore next */ []));
        this.rangePreviewText = computed(() => {
            const s = this.pendingStart();
            const e = this.pendingEnd();
            if (!s)
                return null;
            const fmt = this.formats.display.dateInput;
            const startStr = this.adapter.format(s, fmt);
            if (!e)
                return startStr;
            return `${startStr} – ${this.adapter.format(e, fmt)}`;
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "rangePreviewText" }] : /* istanbul ignore next */ []));
        this.canApply = computed(() => this.pendingStart() !== null && this.pendingEnd() !== null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "canApply" }] : /* istanbul ignore next */ []));
        this.effectivePresets = computed(() => {
            if (this.customPresets())
                return this.customPresets();
            const a = this.adapter;
            return [
                { key: 'today', label: this.labels.today, getRangeFn: () => ({ start: a.today(), end: a.today() }) },
                { key: 'thisWeek', label: this.labels.thisWeek, getRangeFn: () => { const now = a.today(); const dow = a.getDayOfWeek(now); const diff = (dow - a.getFirstDayOfWeek() + 7) % 7; return { start: a.addDays(now, -diff), end: now }; } },
                { key: 'last7Days', label: this.labels.last7Days, getRangeFn: () => ({ start: a.addDays(a.today(), -6), end: a.today() }) },
                { key: 'thisMonth', label: this.labels.thisMonth, getRangeFn: () => { const now = a.today(); return { start: a.createDate(a.getYear(now), a.getMonth(now), 1), end: now }; } },
                { key: 'last30Days', label: this.labels.last30Days, getRangeFn: () => ({ start: a.addDays(a.today(), -29), end: a.today() }) },
                { key: 'custom', label: this.labels.custom, getRangeFn: () => ({ start: a.today(), end: a.today() }) },
            ];
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "effectivePresets" }] : /* istanbul ignore next */ []));
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    writeValue(val) { this.value.set(val); }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(_) { }
    togglePanel() {
        if (this.disabled())
            return;
        this.isOpen() ? this.cancelPanel() : this.openPanel();
    }
    openPanel() {
        if (this.disabled())
            return;
        const v = this.value();
        this.pendingStart.set(v?.start ?? null);
        this.pendingEnd.set(v?.end ?? null);
        const ref = v?.start ?? this.adapter.today();
        this.leftMonth.set(this.adapter.getMonth(ref));
        this.leftYear.set(this.adapter.getYear(ref));
        this.isOpen.set(true);
    }
    cancelPanel() { this.isOpen.set(false); this.onTouched(); }
    applyPanel() {
        const s = this.pendingStart(), e = this.pendingEnd();
        if (!s || !e)
            return;
        const range = { start: s, end: e };
        this.value.set(range);
        this.onChange(range);
        this.onTouched();
        this.isOpen.set(false);
    }
    onDaySelected(date) {
        const s = this.pendingStart(), e = this.pendingEnd();
        this.activePresetKey.set('custom');
        if (!s || (s && e)) {
            this.pendingStart.set(date);
            this.pendingEnd.set(null);
            this.hoverDate.set(null);
        }
        else {
            if (this.adapter.compareDateOnly(date, s) < 0) {
                this.pendingEnd.set(s);
                this.pendingStart.set(date);
            }
            else {
                this.pendingEnd.set(date);
            }
            this.hoverDate.set(null);
        }
    }
    onPresetSelected(preset) {
        if (preset.key === 'custom') {
            this.activePresetKey.set('custom');
            return;
        }
        const { start, end } = preset.getRangeFn();
        this.pendingStart.set(start);
        this.pendingEnd.set(end);
        this.leftMonth.set(this.adapter.getMonth(start));
        this.leftYear.set(this.adapter.getYear(start));
        this.activePresetKey.set(preset.key);
    }
    clearValue(e) {
        e.stopPropagation();
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
    navigateLeft(delta) {
        let m = this.leftMonth() + delta;
        let y = this.leftYear();
        if (m < 0) {
            m = 11;
            y--;
        }
        else if (m > 11) {
            m = 0;
            y++;
        }
        this.leftMonth.set(m);
        this.leftYear.set(y);
    }
    navigateRight(delta) { this.navigateLeft(delta); }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateRangePickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxDateRangePickerComponent, isStandalone: true, selector: "ngx-date-range-picker", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null }, customPresets: { classPropertyName: "customPresets", publicName: "customPresets", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxDateRangePickerComponent),
                multi: true,
            }], ngImport: i0, template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectPeriod"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel"
         role="dialog" [attr.aria-label]="labels.selectPeriod" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <div>
          <h2 class="ngx-panel__title">{{ labels.selectPeriod }}</h2>
          <p class="ngx-panel__preview" *ngIf="rangePreviewText()">{{ rangePreviewText() }}</p>
        </div>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--no-time">
        <ngx-presets-panel
          [presets]="effectivePresets()"
          [activeKey]="activePresetKey()"
          (presetSelected)="onPresetSelected($event)"
        />
        <div class="ngx-panel__calendars">
          <ngx-calendar
            [viewYear]="leftYear()" [viewMonth]="leftMonth()"
            [rangeStart]="pendingStart()" [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()" [maxDate]="maxDate()"
            [showPrevNav]="true" [showNextNav]="false"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateLeft(-1)" (nextMonthClicked)="navigateLeft(1)"
          />
          <ngx-calendar
            [viewYear]="rightYear()" [viewMonth]="rightMonth()"
            [rangeStart]="pendingStart()" [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()" [maxDate]="maxDate()"
            [showPrevNav]="false" [showNextNav]="true"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateRight(-1)" (nextMonthClicked)="navigateRight(1)"
          />
        </div>
      </div>
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ rangePreviewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button"
            [disabled]="!canApply()" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxCalendarComponent, selector: "ngx-calendar", inputs: ["viewMonth", "viewYear", "selectedDate", "rangeStart", "rangeEnd", "hoverDate", "minDate", "maxDate", "disabledDates", "showPrevNav", "showNextNav"], outputs: ["daySelected", "onDayHover", "prevMonthClicked", "nextMonthClicked"] }, { kind: "component", type: NgxPresetsPanelComponent, selector: "ngx-presets-panel", inputs: ["presets", "activeKey"], outputs: ["presetSelected"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateRangePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-date-range-picker',
                    standalone: true,
                    imports: [CommonModule, NgxCalendarComponent, NgxPresetsPanelComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxDateRangePickerComponent),
                            multi: true,
                        }],
                    template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectPeriod"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel"
         role="dialog" [attr.aria-label]="labels.selectPeriod" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <div>
          <h2 class="ngx-panel__title">{{ labels.selectPeriod }}</h2>
          <p class="ngx-panel__preview" *ngIf="rangePreviewText()">{{ rangePreviewText() }}</p>
        </div>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--no-time">
        <ngx-presets-panel
          [presets]="effectivePresets()"
          [activeKey]="activePresetKey()"
          (presetSelected)="onPresetSelected($event)"
        />
        <div class="ngx-panel__calendars">
          <ngx-calendar
            [viewYear]="leftYear()" [viewMonth]="leftMonth()"
            [rangeStart]="pendingStart()" [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()" [maxDate]="maxDate()"
            [showPrevNav]="true" [showNextNav]="false"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateLeft(-1)" (nextMonthClicked)="navigateLeft(1)"
          />
          <ngx-calendar
            [viewYear]="rightYear()" [viewMonth]="rightMonth()"
            [rangeStart]="pendingStart()" [rangeEnd]="pendingEnd()"
            [hoverDate]="hoverDate()"
            [minDate]="minDate()" [maxDate]="maxDate()"
            [showPrevNav]="false" [showNextNav]="true"
            (daySelected)="onDaySelected($event)"
            (onDayHover)="hoverDate.set($event)"
            (prevMonthClicked)="navigateRight(-1)" (nextMonthClicked)="navigateRight(1)"
          />
        </div>
      </div>
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ rangePreviewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button"
            [disabled]="!canApply()" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }], customPresets: [{ type: i0.Input, args: [{ isSignal: true, alias: "customPresets", required: false }] }] } });

/**
 * DateTime picker: calendar + time selector in a single panel.
 */
class NgxDateTimePickerComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        this.formats = inject(NGX_DATE_TIME_FORMATS);
        this.value = model(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.invalid = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
        this.showSeconds = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSeconds" }] : /* istanbul ignore next */ []));
        this.minDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.isOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
        this.viewMonth = signal(new Date().getMonth(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewMonth" }] : /* istanbul ignore next */ []));
        this.viewYear = signal(new Date().getFullYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewYear" }] : /* istanbul ignore next */ []));
        this.pendingDate = signal(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingDate" }] : /* istanbul ignore next */ []));
        this.pendingTime = signal(createTimeValue(0, 0, 0), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingTime" }] : /* istanbul ignore next */ []));
        this.displayValue = computed(() => {
            const v = this.value();
            if (!v || !this.adapter.isValid(v))
                return null;
            return this.adapter.format(v, this.formats.display.dateTimeInput);
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
        this.placeholderText = computed(() => this.placeholder() || this.formats.display.dateTimeInput, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholderText" }] : /* istanbul ignore next */ []));
        this.previewText = computed(() => {
            const d = this.pendingDate();
            if (!d)
                return '';
            const t = this.pendingTime();
            const full = this.adapter.setTime(d, t.hours, t.minutes, t.seconds);
            return this.adapter.format(full, this.formats.display.dateTimeInput);
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "previewText" }] : /* istanbul ignore next */ []));
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    writeValue(val) { this.value.set(val); }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(_) { }
    togglePanel() {
        if (this.disabled())
            return;
        this.isOpen() ? this.cancelPanel() : this.openPanel();
    }
    openPanel() {
        if (this.disabled())
            return;
        const v = this.value();
        const ref = v ?? this.adapter.today();
        this.viewMonth.set(this.adapter.getMonth(ref));
        this.viewYear.set(this.adapter.getYear(ref));
        this.pendingDate.set(v ? this.adapter.startOfDay(v) : null);
        this.pendingTime.set(v
            ? createTimeValue(this.adapter.getHours(v), this.adapter.getMinutes(v), this.adapter.getSeconds(v))
            : createTimeValue(0, 0, 0));
        this.isOpen.set(true);
    }
    cancelPanel() { this.isOpen.set(false); this.onTouched(); }
    applyPanel() {
        const d = this.pendingDate();
        if (!d)
            return;
        const t = this.pendingTime();
        const full = this.adapter.setTime(d, t.hours, t.minutes, t.seconds);
        this.value.set(full);
        this.onChange(full);
        this.onTouched();
        this.isOpen.set(false);
    }
    onDaySelected(date) {
        this.pendingDate.set(date);
    }
    clearValue(e) {
        e.stopPropagation();
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
    navigate(delta) {
        let m = this.viewMonth() + delta;
        let y = this.viewYear();
        if (m < 0) {
            m = 11;
            y--;
        }
        else if (m > 11) {
            m = 0;
            y++;
        }
        this.viewMonth.set(m);
        this.viewYear.set(y);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateTimePickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxDateTimePickerComponent, isStandalone: true, selector: "ngx-date-time-picker", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, showSeconds: { classPropertyName: "showSeconds", publicName: "showSeconds", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxDateTimePickerComponent),
                multi: true,
            }], ngImport: i0, template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDateTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--date-time"
         role="dialog" [attr.aria-label]="labels.selectDateTime" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectDateTime }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--date-time">
        <ngx-calendar
          [viewYear]="viewYear()" [viewMonth]="viewMonth()"
          [selectedDate]="pendingDate()"
          [minDate]="minDate()" [maxDate]="maxDate()"
          [showPrevNav]="true" [showNextNav]="true"
          (daySelected)="onDaySelected($event)"
          (prevMonthClicked)="navigate(-1)" (nextMonthClicked)="navigate(1)"
        />
        <div class="ngx-panel__time-panel">
          <ngx-time-selector
            [value]="pendingTime()"
            [showSeconds]="showSeconds()"
            [label]="labels.selectTime"
            (timeChanged)="pendingTime.set($event)"
          />
        </div>
      </div>
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ previewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button" [disabled]="!pendingDate()" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxCalendarComponent, selector: "ngx-calendar", inputs: ["viewMonth", "viewYear", "selectedDate", "rangeStart", "rangeEnd", "hoverDate", "minDate", "maxDate", "disabledDates", "showPrevNav", "showNextNav"], outputs: ["daySelected", "onDayHover", "prevMonthClicked", "nextMonthClicked"] }, { kind: "component", type: NgxTimeSelectorComponent, selector: "ngx-time-selector", inputs: ["value", "showSeconds", "label"], outputs: ["valueChange", "timeChanged"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDateTimePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-date-time-picker',
                    standalone: true,
                    imports: [CommonModule, NgxCalendarComponent, NgxTimeSelectorComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxDateTimePickerComponent),
                            multi: true,
                        }],
                    template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDateTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--date-time"
         role="dialog" [attr.aria-label]="labels.selectDateTime" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectDateTime }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--date-time">
        <ngx-calendar
          [viewYear]="viewYear()" [viewMonth]="viewMonth()"
          [selectedDate]="pendingDate()"
          [minDate]="minDate()" [maxDate]="maxDate()"
          [showPrevNav]="true" [showNextNav]="true"
          (daySelected)="onDaySelected($event)"
          (prevMonthClicked)="navigate(-1)" (nextMonthClicked)="navigate(1)"
        />
        <div class="ngx-panel__time-panel">
          <ngx-time-selector
            [value]="pendingTime()"
            [showSeconds]="showSeconds()"
            [label]="labels.selectTime"
            (timeChanged)="pendingTime.set($event)"
          />
        </div>
      </div>
      <div class="ngx-panel__footer">
        <span class="ngx-panel__footer-preview">{{ previewText() }}</span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button" [disabled]="!pendingDate()" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], showSeconds: [{ type: i0.Input, args: [{ isSignal: true, alias: "showSeconds", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }] } });

/**
 * Date-only picker. Opens a single calendar in a panel.
 */
class NgxDatePickerComponent {
    constructor() {
        this.adapter = inject(NGX_DATE_TIME_ADAPTER);
        this.labels = inject(NGX_LABELS);
        this.formats = inject(NGX_DATE_TIME_FORMATS);
        this.value = model(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.invalid = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
        this.minDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "minDate" }] : /* istanbul ignore next */ []));
        this.maxDate = input(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "maxDate" }] : /* istanbul ignore next */ []));
        this.isOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
        this.viewMonth = signal(new Date().getMonth(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewMonth" }] : /* istanbul ignore next */ []));
        this.viewYear = signal(new Date().getFullYear(), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "viewYear" }] : /* istanbul ignore next */ []));
        this.displayValue = computed(() => {
            const v = this.value();
            if (!v || !this.adapter.isValid(v))
                return null;
            return this.adapter.format(v, this.formats.display.dateInput);
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
        this.placeholderText = computed(() => this.placeholder() || this.formats.display.dateInput, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholderText" }] : /* istanbul ignore next */ []));
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    writeValue(val) { this.value.set(val); }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(_) { }
    togglePanel() {
        if (this.disabled())
            return;
        this.isOpen() ? this.closePanel() : this.openPanel();
    }
    openPanel() {
        if (this.disabled())
            return;
        const ref = this.value() ?? this.adapter.today();
        this.viewMonth.set(this.adapter.getMonth(ref));
        this.viewYear.set(this.adapter.getYear(ref));
        this.isOpen.set(true);
    }
    closePanel() {
        this.isOpen.set(false);
        this.onTouched();
    }
    onDaySelected(date) {
        this.value.set(date);
        this.onChange(date);
        this.onTouched();
        this.closePanel();
    }
    clearValue(e) {
        e.stopPropagation();
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
    navigate(delta) {
        let m = this.viewMonth() + delta;
        let y = this.viewYear();
        if (m < 0) {
            m = 11;
            y--;
        }
        else if (m > 11) {
            m = 0;
            y++;
        }
        this.viewMonth.set(m);
        this.viewYear.set(y);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDatePickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxDatePickerComponent, isStandalone: true, selector: "ngx-date-picker", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, minDate: { classPropertyName: "minDate", publicName: "minDate", isSignal: true, isRequired: false, transformFunction: null }, maxDate: { classPropertyName: "maxDate", publicName: "maxDate", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxDatePickerComponent),
                multi: true,
            }], ngImport: i0, template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDate"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--single-calendar"
         role="dialog" [attr.aria-label]="labels.selectDate" [attr.aria-modal]="true"
         (keydown.escape)="closePanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectDate }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="closePanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--single">
        <ngx-calendar
          [viewYear]="viewYear()" [viewMonth]="viewMonth()"
          [selectedDate]="value()"
          [minDate]="minDate()" [maxDate]="maxDate()"
          [showPrevNav]="true" [showNextNav]="true"
          (daySelected)="onDaySelected($event)"
          (prevMonthClicked)="navigate(-1)" (nextMonthClicked)="navigate(1)"
        />
      </div>
      <div class="ngx-panel__footer">
        <span></span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="closePanel()">{{ labels.cancel }}</button>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxCalendarComponent, selector: "ngx-calendar", inputs: ["viewMonth", "viewYear", "selectedDate", "rangeStart", "rangeEnd", "hoverDate", "minDate", "maxDate", "disabledDates", "showPrevNav", "showNextNav"], outputs: ["daySelected", "onDayHover", "prevMonthClicked", "nextMonthClicked"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDatePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-date-picker',
                    standalone: true,
                    imports: [CommonModule, NgxCalendarComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxDatePickerComponent),
                            multi: true,
                        }],
                    template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectDate"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--single-calendar"
         role="dialog" [attr.aria-label]="labels.selectDate" [attr.aria-modal]="true"
         (keydown.escape)="closePanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectDate }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="closePanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--single">
        <ngx-calendar
          [viewYear]="viewYear()" [viewMonth]="viewMonth()"
          [selectedDate]="value()"
          [minDate]="minDate()" [maxDate]="maxDate()"
          [showPrevNav]="true" [showNextNav]="true"
          (daySelected)="onDaySelected($event)"
          (prevMonthClicked)="navigate(-1)" (nextMonthClicked)="navigate(1)"
        />
      </div>
      <div class="ngx-panel__footer">
        <span></span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="closePanel()">{{ labels.cancel }}</button>
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], minDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "minDate", required: false }] }], maxDate: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxDate", required: false }] }] } });

/**
 * Time-only picker. Opens a panel with a time spinner.
 */
class NgxTimePickerComponent {
    constructor() {
        this.labels = inject(NGX_LABELS);
        this.formats = inject(NGX_DATE_TIME_FORMATS);
        this.value = model(null, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
        this.placeholder = input('', /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholder" }] : /* istanbul ignore next */ []));
        this.disabled = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "disabled" }] : /* istanbul ignore next */ []));
        this.invalid = input(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "invalid" }] : /* istanbul ignore next */ []));
        this.showSeconds = input(true, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "showSeconds" }] : /* istanbul ignore next */ []));
        this.isOpen = signal(false, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "isOpen" }] : /* istanbul ignore next */ []));
        this.pendingTime = signal(createTimeValue(0, 0, 0), /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "pendingTime" }] : /* istanbul ignore next */ []));
        this.displayValue = computed(() => {
            const v = this.value();
            if (!v)
                return null;
            return formatTimeValue(v, this.showSeconds());
        }, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "displayValue" }] : /* istanbul ignore next */ []));
        this.placeholderText = computed(() => this.placeholder() || this.formats.display.timeInput, /* @ts-ignore */
        ...(ngDevMode ? [{ debugName: "placeholderText" }] : /* istanbul ignore next */ []));
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    writeValue(val) { this.value.set(val); }
    registerOnChange(fn) { this.onChange = fn; }
    registerOnTouched(fn) { this.onTouched = fn; }
    setDisabledState(_) { }
    togglePanel() {
        if (this.disabled())
            return;
        this.isOpen() ? this.cancelPanel() : this.openPanel();
    }
    openPanel() {
        if (this.disabled())
            return;
        this.pendingTime.set(this.value() ?? createTimeValue(0, 0, 0));
        this.isOpen.set(true);
    }
    cancelPanel() {
        this.isOpen.set(false);
        this.onTouched();
    }
    applyPanel() {
        const t = this.pendingTime();
        this.value.set(t);
        this.onChange(t);
        this.onTouched();
        this.isOpen.set(false);
    }
    clearValue(e) {
        e.stopPropagation();
        this.value.set(null);
        this.onChange(null);
        this.onTouched();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxTimePickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "22.0.5", type: NgxTimePickerComponent, isStandalone: true, selector: "ngx-time-picker", inputs: { value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null }, placeholder: { classPropertyName: "placeholder", publicName: "placeholder", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, invalid: { classPropertyName: "invalid", publicName: "invalid", isSignal: true, isRequired: false, transformFunction: null }, showSeconds: { classPropertyName: "showSeconds", publicName: "showSeconds", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => NgxTimePickerComponent),
                multi: true,
            }], ngImport: i0, template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--time-only"
         role="dialog" [attr.aria-label]="labels.selectTime" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectTime }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--time-only">
        <ngx-time-selector
          [value]="pendingTime()"
          [showSeconds]="showSeconds()"
          [label]="labels.selectTime"
          (timeChanged)="pendingTime.set($event)"
        />
      </div>
      <div class="ngx-panel__footer">
        <span></span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `, isInline: true, dependencies: [{ kind: "ngmodule", type: CommonModule }, { kind: "directive", type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { kind: "component", type: NgxTimeSelectorComponent, selector: "ngx-time-selector", inputs: ["value", "showSeconds", "label"], outputs: ["valueChange", "timeChanged"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxTimePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'ngx-time-picker',
                    standalone: true,
                    imports: [CommonModule, NgxTimeSelectorComponent],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    providers: [{
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NgxTimePickerComponent),
                            multi: true,
                        }],
                    template: `
    <div class="ngx-picker-field"
         [class.ngx-picker-field--open]="isOpen()"
         [class.ngx-picker-field--disabled]="disabled()"
         [class.ngx-picker-field--invalid]="invalid()"
         [attr.aria-haspopup]="'dialog'"
         [attr.aria-expanded]="isOpen()"
         [attr.aria-label]="labels.selectTime"
         (click)="togglePanel()"
         (keydown.enter)="openPanel()"
         (keydown.space)="openPanel(); $event.preventDefault()"
         tabindex="0" role="button">
      <span class="ngx-picker-field__icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </span>
      <span class="ngx-picker-field__value">
        <ng-container *ngIf="displayValue(); else ph">{{ displayValue() }}</ng-container>
        <ng-template #ph><span class="ngx-picker-field__placeholder">{{ placeholderText() }}</span></ng-template>
      </span>
      <button *ngIf="displayValue() && !disabled()" class="ngx-picker-field__clear"
        type="button" [attr.aria-label]="labels.clearValue"
        (click)="clearValue($event)" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div *ngIf="isOpen()" class="ngx-panel ngx-panel--time-only"
         role="dialog" [attr.aria-label]="labels.selectTime" [attr.aria-modal]="true"
         (keydown.escape)="cancelPanel()">
      <div class="ngx-panel__header">
        <h2 class="ngx-panel__title">{{ labels.selectTime }}</h2>
        <button class="ngx-panel__close" type="button" [attr.aria-label]="labels.closePanel" (click)="cancelPanel()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="ngx-panel__body ngx-panel__body--time-only">
        <ngx-time-selector
          [value]="pendingTime()"
          [showSeconds]="showSeconds()"
          [label]="labels.selectTime"
          (timeChanged)="pendingTime.set($event)"
        />
      </div>
      <div class="ngx-panel__footer">
        <span></span>
        <div class="ngx-panel__actions">
          <button class="ngx-btn ngx-btn--ghost" type="button" (click)="cancelPanel()">{{ labels.cancel }}</button>
          <button class="ngx-btn ngx-btn--primary" type="button" (click)="applyPanel()">{{ labels.apply }}</button>
        </div>
      </div>
    </div>
  `,
                }]
        }], propDecorators: { value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], placeholder: [{ type: i0.Input, args: [{ isSignal: true, alias: "placeholder", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], invalid: [{ type: i0.Input, args: [{ isSignal: true, alias: "invalid", required: false }] }], showSeconds: [{ type: i0.Input, args: [{ isSignal: true, alias: "showSeconds", required: false }] }] } });

/** Convenience NgModule for apps not using standalone imports. */
class NgxDatetimeKitModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDatetimeKitModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "22.0.5", ngImport: i0, type: NgxDatetimeKitModule, imports: [NgxDateTimeRangePickerComponent,
            NgxDateRangePickerComponent,
            NgxDateTimePickerComponent,
            NgxDatePickerComponent,
            NgxTimePickerComponent,
            NgxCalendarComponent,
            NgxTimeSelectorComponent,
            NgxPresetsPanelComponent], exports: [NgxDateTimeRangePickerComponent,
            NgxDateRangePickerComponent,
            NgxDateTimePickerComponent,
            NgxDatePickerComponent,
            NgxTimePickerComponent,
            NgxCalendarComponent,
            NgxTimeSelectorComponent,
            NgxPresetsPanelComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDatetimeKitModule, providers: [
            { provide: NGX_DATE_TIME_ADAPTER, useClass: NgxNativeDateTimeAdapter },
        ], imports: [NgxDateTimeRangePickerComponent,
            NgxDateRangePickerComponent,
            NgxDateTimePickerComponent,
            NgxDatePickerComponent,
            NgxTimePickerComponent,
            NgxCalendarComponent,
            NgxTimeSelectorComponent,
            NgxPresetsPanelComponent] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "22.0.5", ngImport: i0, type: NgxDatetimeKitModule, decorators: [{
            type: NgModule,
            args: [{
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
                }]
        }] });

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
function provideNgxDatetimeKit(config) {
    return makeEnvironmentProviders([
        {
            provide: NGX_DATE_TIME_ADAPTER,
            useClass: (config?.adapter ?? NgxNativeDateTimeAdapter),
        },
        ...(config?.formats
            ? [{ provide: NGX_DATE_TIME_FORMATS, useValue: config.formats }]
            : []),
        ...(config?.labels
            ? [{ provide: NGX_LABELS, useValue: config.labels }]
            : []),
    ]);
}

/**
 * Creates a new empty DateRange.
 */
function createEmptyDateRange() {
    return { start: null, end: null };
}
/**
 * Creates a new empty DateTimeRange.
 */
function createEmptyDateTimeRange() {
    return { start: null, end: null };
}
/**
 * Returns true if both start and end of the range are non-null.
 */
function isCompleteRange(range) {
    return range.start !== null && range.end !== null;
}

/**
 * Core validation logic shared by both Reactive Forms validators and Signal Forms validators.
 * Keep all business rules here — the form-specific wrappers are thin adapters.
 */
function validateDateRangeCore(range, adapter, minDate, maxDate) {
    if (!range)
        return null;
    const errors = {};
    if (range.start !== null && !adapter.isValid(range.start)) {
        errors['ngxInvalidStart'] = { value: range.start };
    }
    if (range.end !== null && !adapter.isValid(range.end)) {
        errors['ngxInvalidEnd'] = { value: range.end };
    }
    if (range.start !== null && range.end !== null &&
        adapter.isValid(range.start) && adapter.isValid(range.end)) {
        if (adapter.compare(range.start, range.end) > 0) {
            errors['ngxEndBeforeStart'] = {
                start: range.start,
                end: range.end,
            };
        }
    }
    if (minDate && range.start !== null && adapter.isValid(range.start)) {
        if (adapter.compare(range.start, minDate) < 0) {
            errors['ngxStartBelowMin'] = { min: minDate, actual: range.start };
        }
    }
    if (maxDate && range.end !== null && adapter.isValid(range.end)) {
        if (adapter.compare(range.end, maxDate) > 0) {
            errors['ngxEndAboveMax'] = { max: maxDate, actual: range.end };
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
}
/**
 * Reactive Forms validator factory for DateRange controls.
 *
 * Usage:
 * ```ts
 * new FormControl(null, ngxDateRangeValidator(adapter))
 * ```
 */
function ngxDateRangeValidator(adapter, minDate, maxDate) {
    return (control) => {
        return validateDateRangeCore(control.value, adapter, minDate, maxDate);
    };
}
/**
 * Convenience alias — validates that end is after start.
 * Can be used on a FormGroup with `start` and `end` controls.
 */
function endAfterStartValidator(adapter) {
    return (group) => {
        const start = group.get('start')?.value;
        const end = group.get('end')?.value;
        if (!start || !end)
            return null;
        if (!adapter.isValid(start) || !adapter.isValid(end))
            return null;
        if (adapter.compare(start, end) > 0) {
            return { ngxEndBeforeStart: { start, end } };
        }
        return null;
    };
}
/**
 * Reactive Forms min-date validator for single date/datetime controls.
 */
function ngxMinDateValidator(adapter, minDate) {
    return (control) => {
        const value = control.value;
        if (!value || !adapter.isValid(value))
            return null;
        if (adapter.compare(value, minDate) < 0) {
            return { ngxMinDate: { min: minDate, actual: value } };
        }
        return null;
    };
}
/**
 * Reactive Forms max-date validator for single date/datetime controls.
 */
function ngxMaxDateValidator(adapter, maxDate) {
    return (control) => {
        const value = control.value;
        if (!value || !adapter.isValid(value))
            return null;
        if (adapter.compare(value, maxDate) > 0) {
            return { ngxMaxDate: { max: maxDate, actual: value } };
        }
        return null;
    };
}

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
 * Factory function for a validated signal field.
 *
 * @param initialValue  Initial value for the signal
 * @param validate      Validation function (use the core validators from validators/)
 */
function createSignalField(initialValue, validate) {
    const value = signal(initialValue, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "value" }] : /* istanbul ignore next */ []));
    const touchedSignal = signal(false, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "touchedSignal" }] : /* istanbul ignore next */ []));
    const errors = computed(() => validate ? validate(value()) : null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "errors" }] : /* istanbul ignore next */ []));
    const valid = computed(() => errors() === null, /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "valid" }] : /* istanbul ignore next */ []));
    return {
        value,
        errors,
        valid,
        touched: touchedSignal.asReadonly(),
        markAsTouched: () => touchedSignal.set(true),
    };
}
/**
 * Creates a pre-configured signal field for DateTimeRange with built-in validation.
 *
 * @example
 * ```ts
 * const range = createDateTimeRangeSignalField(adapter);
 * // Then in template: <ngx-date-time-range-picker [(value)]="range.value" />
 * ```
 */
function createDateTimeRangeSignalField(adapter, initialValue = null, options) {
    return createSignalField(initialValue, (v) => validateDateRangeCore(v, adapter, options?.minDate, options?.maxDate));
}
/**
 * Creates a pre-configured signal field for DateRange with built-in validation.
 */
function createDateRangeSignalField(adapter, initialValue = null, options) {
    return createSignalField(initialValue, (v) => validateDateRangeCore(v, adapter, options?.minDate, options?.maxDate));
}
/**
 * Converts a core validate function into a shape compatible with future
 * Angular Signal Forms schema validators.
 *
 * Isolation point: update ONLY this function when Angular's signal-forms
 * validator shape changes (e.g. async, returning signal instead of plain obj).
 */
function toSignalValidator(validateFn) {
    // Currently identical — adapter layer for future API changes
    return validateFn;
}

/*
 * Public API Surface of ngx-datetime-kit
 *
 * Only items listed here are considered public API.
 * All other symbols are internal implementation details.
 */
// ── Module & Provider ─────────────────────────────────────────────────────────

/**
 * Generated bundle index. Do not edit.
 */

export { NGX_DATE_TIME_ADAPTER, NGX_DATE_TIME_FORMATS, NGX_DATE_TIME_FORMATS_DE, NGX_DATE_TIME_FORMATS_ISO, NGX_DATE_TIME_FORMATS_US, NGX_DEFAULT_LABELS, NGX_LABELS, NgxCalendarComponent, NgxDatePickerComponent, NgxDateRangePickerComponent, NgxDateTimeAdapter, NgxDateTimePickerComponent, NgxDateTimeRangePickerComponent, NgxDatetimeKitModule, NgxNativeDateTimeAdapter, NgxPresetsPanelComponent, NgxTimePickerComponent, NgxTimeSelectorComponent, applyTimeToDate, buildCalendarGrid, clampDate, compareTimeValues, createDateRangeSignalField, createDateTimeRangeSignalField, createEmptyDateRange, createEmptyDateTimeRange, createSignalField, createTimeValue, endAfterStartValidator, formatDuration, formatTimeValue, isCompleteRange, ngxDateRangeValidator, ngxMaxDateValidator, ngxMinDateValidator, parseTimeValue, provideNgxDatetimeKit, timeValueFromDate, toSignalValidator, validateDateRangeCore };
//# sourceMappingURL=ngx-datetime-kit.mjs.map
