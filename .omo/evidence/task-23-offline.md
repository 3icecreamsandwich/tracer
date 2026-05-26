# Task 23 - Offline/provider failure UX evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 23 expects an offline scenario (network disabled) to yield a friendly `network_offline` error and no crash or stuck spinner.

## Command/Method

Web-preview E2E (offline modal):

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Unit tests (error normalization):

```bash
bun run test:unit
```

Relevant files:

- `tests/e2e/web/set-page-chat.spec.ts` (offline modal)
- `tests/unit/ai-ux-errors.test.ts` (maps offline to `network_offline`)

## Observed Result

Web E2E passed. The chat spec sets the browser context offline and asserts an "AI error" dialog contains "You are offline", then closes it.

Unit test `ai-ux-errors.test.ts` sets `navigator.onLine = false` and asserts `normalizeAiError(new Error('Failed to fetch'))` maps to `network_offline`.

## Verdict

PASS (web preview)
