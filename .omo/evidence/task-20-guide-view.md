# Task 20 - Study guide view evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 20 expects a study guide view that renders Markdown with headings, lists, and code blocks.

## Command/Method

Web-preview E2E:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Relevant spec: `tests/e2e/web/study-guide-page.spec.ts`.

## Observed Result

Web E2E passed. The study-guide spec verifies:

- Navigating from `/set/demo` to a study guide route.
- Rendering of headings and list items.
- Rendering of a fenced code block (`pre code`).

## Verdict

PASS (web preview)
