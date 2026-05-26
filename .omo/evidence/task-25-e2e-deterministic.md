## Task 25: Deterministic test mode (mock AI + mock OAuth)

### What changed
- Added `TRACER_TEST_MODE=1` behavior:
  - AI provider calls are replaced with a deterministic local `LanguageModelV3` stub.
  - OAuth (GitHub device + PKCE) returns a deterministic token without opening a browser.
  - GitHub Models catalog list returns a deterministic model list.
- Added a network guard: in `TRACER_TEST_MODE=1`, network calls via `aiHttpFetch` are blocked unless `TRACER_LIVE_AI=1`.

### Evidence

#### Unit tests
Command:
```bash
bun run test:unit
```
Result: PASS (Vitest + `cargo test`). Includes `tests/unit/test-mode-stubs.test.ts` exercising deterministic AI stub output and network guard.

#### Build
Command:
```bash
bun run build
```
Result: PASS.

#### Desktop E2E (deterministic)
Command:
```bash
TRACER_TEST_MODE=1 bun run test:e2e:desktop
```
Result: Not runnable on macOS by harness design (skipped on darwin in `tests/e2e/desktop/run.mjs`).

#### Web E2E (deterministic)
Command:
```bash
TRACER_TEST_MODE=1 bun run test:e2e:web
```
Result: Skipped on this machine because Chrome is not installed at `/Applications/Google Chrome.app` (see `tests/e2e/web/run.mjs`).

### Files touched (implementation)
- `src/composables/ai/test-mode.ts`
- `src/composables/ai/test-stub-model.ts`
- `src/composables/ai/http.ts`
- `src/composables/ai/registry.ts`
- `src/composables/ai/github-oauth.ts`
- `src/composables/ai/github-models.ts`

### Files touched (tests)
- `tests/unit/test-mode-stubs.test.ts`
