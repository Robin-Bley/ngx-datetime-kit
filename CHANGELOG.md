# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial library scaffold with Angular 22

## [0.1.0] - 2026-07-06

### Added
- `NgxTimePickerComponent` (`ngx-time-picker`) — time-only picker with 24h format and optional seconds
- `NgxDatePickerComponent` (`ngx-date-picker`) — date-only calendar picker
- `NgxDateTimePickerComponent` (`ngx-date-time-picker`) — combined date + time picker
- `NgxDateRangePickerComponent` (`ngx-date-range-picker`) — date range with dual calendar and presets
- `NgxDateTimeRangePickerComponent` (`ngx-date-time-range-picker`) — full datetime range with time selectors, presets, and duration display
- `NgxDateTimeAdapter<D>` abstract adapter pattern
- `NgxNativeDateTimeAdapter` — default adapter using native JS Date
- `provideNgxDatetimeKit()` — standalone application provider function
- `NgxDatetimeKitModule` — NgModule for non-standalone usage
- DI tokens: `NGX_DATE_TIME_ADAPTER`, `NGX_DATE_TIME_FORMATS`, `NGX_LABELS`
- Format presets: `NGX_DATE_TIME_FORMATS_DE`, `NGX_DATE_TIME_FORMATS_US`, `NGX_DATE_TIME_FORMATS_ISO`
- Reactive Forms validators: `ngxDateRangeValidator`, `endAfterStartValidator`, `ngxMinDateValidator`, `ngxMaxDateValidator`
- Signal Forms adapter: `createSignalField`, `createDateTimeRangeSignalField`, `NgxSignalField`
- Full keyboard accessibility (arrow keys, Tab, Escape, Enter)
- ARIA roles and labels throughout
- Responsive design: popover (desktop), bottom-sheet (mobile)
- Range presets: Today, Last 24h, This Week, Last 7 Days, This Month, Custom
- Duration calculation in range pickers
- Demo application with pages for all features
- Comprehensive documentation in `docs/`
- GitHub Actions: CI workflow, npm publish workflow
- Dependabot configuration

