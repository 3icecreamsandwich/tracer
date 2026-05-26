# Task 4 - TSV parser unit tests evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 4 requires strict TSV parsing for flashcard term ingestion.

## Command/Method

```bash
bun run test:unit
```

Covered by `tests/unit/tsv-parser.test.ts`.

## Observed Result

`bun run test:unit` passed and included:

```text
✓ tests/unit/tsv-parser.test.ts (5 tests)
```

The test suite verifies:

- Valid TSV parses into `{ front, back }` rows.
- Empty lines are ignored and whitespace is trimmed.
- Lines without a tab are rejected.
- Lines with multiple tabs are rejected ("exactly one tab").
- Empty input after filtering is rejected ("no terms found").

## Verdict

PASS
