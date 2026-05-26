# Task 16 - Chat mode grounded behavior evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 16 expects Chat to stream responses and to prefer grounded answers to the current set.

## Command/Method

Web-preview E2E (streaming UI and offline modal):

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Unit tests (prompt grounding):

```bash
bun run test:unit
```

Relevant files:

- `tests/e2e/web/set-page-chat.spec.ts`
- `tests/unit/chat-prompt.test.ts`

## Observed Result

Web E2E passed and includes a spec that:

- Sends a chat message in web preview and asserts the log contains streaming/mock output.
- Verifies chat is session-only by navigating away and back and asserting prior message is absent.

Unit test `chat-prompt.test.ts` verifies the grounded system prompt includes grounding rules and embeds the set terms as TSV.

## Verdict

PARTIAL

- Streaming UI and session-only behavior are verified in web preview.
- Prompt construction is verified by unit tests.
- A live provider run that demonstrates responses are actually grounded to set content is not executed here.
