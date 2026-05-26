# Task 12 - Missing provider key evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 12 expects a clear, friendly error when the default model is selected but required credentials are missing.

## Command/Method

Unit tests:

```bash
bun run test:unit
```

Relevant file: `tests/unit/ai-registry.test.ts`.

## Observed Result

`bun run test:unit` passed and includes `tests/unit/ai-registry.test.ts`.

That test mocks secrets as absent and asserts:

- `resolveAiModel('openai:gpt-4o-mini')` rejects with `MissingAiCredentialError` and includes `providerId` and `credentialKind`.

## Verdict

PARTIAL

- Missing-credential detection is verified at the registry/error level.
- The plan's Playwright UI scenario (select default OpenAI model without setting key, attempt Chat, then see Settings guidance) is not executed here.
