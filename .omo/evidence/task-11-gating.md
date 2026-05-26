# Task 11 - Missing default model gating evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 11 expects AI entry points to block when no default model is selected and to route the user to Settings with an actionable message.

## Command/Method

Web-preview E2E suite:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Relevant spec: `tests/e2e/web/settings-gate-banner.spec.ts`.

## Observed Result

The suite passed. `settings-gate-banner.spec.ts` verifies:

- Visiting `/settings?reason=missing-default-model&from=...` shows an "Action required" banner prompting "Choose a Default AI Model".
- Dismiss removes the banner and strips the query params.

## Verdict

PARTIAL

- Settings-side gating banner UX is verified.
- The exact redirect flow described in the plan QA scenario (starting from Home, clicking Generate with no model) is not exercised by this web-preview suite.
