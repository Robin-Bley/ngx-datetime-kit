# Contributing to ngx-datetime-kit

Thank you for your interest in contributing! 🎉

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ngx-datetime-kit.git`
3. Install dependencies: `npm install`
4. Start the demo app: `npm start`

## Development Workflow

```bash
# Build the library in watch mode
npm run watch

# Run tests
npm test

# Run demo app
npm start
```

## Code Style

- Follow the existing patterns — Angular standalone components, `inject()` for DI
- Use `signal()`, `computed()`, `model()` for reactive state (no RxJS BehaviorSubject in components)
- Keep component templates concise; extract complex logic to computed signals
- All public API changes must update `public-api.ts` and `docs/api.md`
- Format code with Prettier: `npx prettier --write .`

## Architecture Principles

1. **Adapter pattern**: All date operations go through `NgxDateTimeAdapter<D>` — never use `new Date()` directly in components
2. **DI tokens over hardcoded values**: Labels, formats, and adapters are injected
3. **Shared validation core**: Never duplicate validation logic — both Reactive Forms validators and Signal Forms validators call `validateDateRangeCore`
4. **Dumb components**: Calendar and time-selector components are purely presentational — no business logic
5. **No free text input**: Pickers must never let users type raw date strings

## Testing

- Unit tests for all adapter methods and validators
- Separate test files for Reactive Forms and Signal Forms adapters
- All new features need tests

## Pull Request Checklist

- [ ] Tests added/updated
- [ ] `public-api.ts` updated if new public symbols added
- [ ] `CHANGELOG.md` updated
- [ ] Documentation updated in `docs/`

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

## Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md).

