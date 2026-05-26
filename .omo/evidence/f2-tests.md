# F2 — Code Quality Review (repo state)

Date: 2026-03-31

## Quality gate status

### TypeScript diagnostics (repo root)

Command/tool:
- `lsp_diagnostics` (filePath='.', extension='.ts', severity='error')

Result: **PASS**
- Files scanned: 50 (tool cap)
- Total TS diagnostics (error): 0

### Unit tests

Command:
```bash
bun run test:unit
```

Result: **PASS**
- Vitest: 16 test files, 45 tests passed
- Rust: `cargo test` PASS (1 test passed)

### Build

Command:
```bash
bun run build
```

Result: **PASS**

Notable warnings:
- `WARN  [plugin nuxt:module-preload-polyfill] Sourcemap is likely to be incorrect ...` (non-fatal)

## Architecture / consistency review (AI, DB, secrets)

### Secrets handling (Stronghold + redaction)

- Secrets access is centralized in `src/composables/ai/credentials.ts`:
  - Tauri runtime: `invoke('ai_secrets_*')` (Stronghold-backed)
  - Non-Tauri: in-memory `Map` (no persistence)
- User-facing error surfaces redact token-like strings via `src/composables/security/redact.ts` (used by e.g. `src/composables/lock.ts` and `src/composables/ai/ux-errors.ts`).

### Deterministic test mode / network guard

- Network is blocked by default in unit tests when `TRACER_TEST_MODE=1` (unless `TRACER_LIVE_AI=1`) via `src/composables/ai/http.ts`.
- `src/composables/ai/registry.ts` returns a deterministic `LanguageModel` stub in test mode.
- GitHub OAuth + models catalog calls are deterministic in test mode (`src/composables/ai/github-oauth.ts`, `src/composables/ai/github-models.ts`).

## Anti-pattern scan (app code)

Searched (app-owned code only) for: `TODO|FIXME|@ts-ignore|as any`.

### TODO / FIXME / @ts-ignore

Result: **PASS**
- No `TODO`, `FIXME`, or `@ts-ignore` found in `src/**`, `pages/**`, `components/**`, `tests/**`, `src-tauri/src/**`.

### `as any` usages (notable)

Result: **PASS (not blocking)**
- The remaining `as any` usages are primarily for environment bridging (Vite `import.meta.env`, `navigator`, dynamic errors) and test harness shims.

Examples:
- AI/env/OAuth:
  - `src/composables/ai/test-mode.ts:2,4,10,12` (Vite vs Node env access)
  - `src/composables/ai/registry.ts:96,178-183` (error status probing; proxying provider model)
  - `src/composables/ai/github-oauth.ts:64,198,313` (env var read; URL-encoded fallback parsing)
  - `src/composables/ai/github-models.ts:38` (attaching `.status` for downstream handling)
  - `src/composables/ai/ux-errors.ts:45,59` (error shape probing; `navigator` offline detection)
- App runtime shims:
  - `src/composables/tauri.ts:2` (force-web env override)
  - `pages/set/[id].vue:1754` (Tauri invoke presence detection)
- Tests:
  - `tests/e2e/web/set-page-match.spec.ts:83-91` (clock offset shim)
  - `tests/unit/test-mode-stubs.test.ts:27,50` (AI SDK stub response shape)

## Duplication / dead code notes

- Duplicate `githubHeaders` constant exists in:
  - `src/composables/ai/registry.ts`
  - `src/composables/ai/github-models.ts`

## Verdict

**APPROVE** — quality gates are green (TS diagnostics: 0 errors; unit tests: PASS; build: PASS). 
