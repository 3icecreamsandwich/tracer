# Task 3 - SQLite JSON constraint evidence

Date: 2026-03-31
Host: macOS (darwin)

## Context

Plan task 3 requires `flashcard_sets.terms_json` to be guarded by SQLite JSON validity checks so invalid JSON cannot be inserted.

## Command/Method

Unit test execution:

```bash
bun run test:unit
```

Coverage note:

- `tests/unit/sql-migrations.test.ts` applies `src-tauri/migrations/001_core.sql` to a temp sqlite DB and asserts invalid JSON inserts fail with a constraint error.

## Observed Result

`bun run test:unit` passed and includes this test file:

```text
✓ tests/unit/sql-migrations.test.ts (1 test)
Test Files  16 passed (16)
Tests       45 passed (45)
```

Within `tests/unit/sql-migrations.test.ts`, the test attempts:

- `INSERT ... terms_json = 'not-json'` and expects a non-zero sqlite exit and stderr containing "constraint".

## Verdict

PASS (schema-level)

- JSON validity enforcement is proven at the migration/schema level.
- The plan's mention of app-friendly UI messaging is not exercised by this unit test.
