## F3 Smoke (Web) — Playwright — Deterministic Mode

Date: 2026-03-30
Host: macOS (darwin)

### Command (required)

```bash
TRACER_TEST_MODE=1 bun run test:e2e:web
```

### Observed output (first attempt)

```text
$ node ./tests/e2e/web/run.mjs
[test:e2e:web] skipped: Google Chrome not found at /Applications/Google Chrome.app (set TRACER_WEB_CHANNEL to another installed channel).
```

### Deterministic-mode + local browser channel workaround (used)

The harness defaults to `TRACER_WEB_CHANNEL=chrome` (see `tests/e2e/web/run.mjs` + `playwright.config.ts`) and on macOS it skips if system Chrome is not installed.

Re-run using Playwright's Chromium channel:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

### Observed output (workaround run)

```text
$ node ./tests/e2e/web/run.mjs
[WebServer] $ nuxt dev --host 127.0.0.1 --port 3000

Running 13 tests using 1 worker

  ✓   1 [system-chromium] › tests/e2e/web/generate-page.spec.ts:3:1 › generate: web preview shows gating banner and disables generate
  ✓   2 [system-chromium] › tests/e2e/web/navbar-search.spec.ts:3:1 › navbar search: navigates to home with q query
  ✓   3 [system-chromium] › tests/e2e/web/set-page-chat.spec.ts:3:1 › set page chat: streams mock response and resets on navigation
  ✓   4 [system-chromium] › tests/e2e/web/set-page-chat.spec.ts:28:1 › set page chat: shows offline AI error modal in web preview
  ✓   5 [system-chromium] › tests/e2e/web/set-page-flashcards.spec.ts:3:1 › set page flashcards: tracks correct/incorrect, shows results, restarts
  ✓   6 [system-chromium] › tests/e2e/web/set-page-learn.spec.ts:3:1 › set page learn: answers through questions and shows results
  ✓   7 [system-chromium] › tests/e2e/web/set-page-match.spec.ts:8:1 › set page match: completes and shows results
  ✓   8 [system-chromium] › tests/e2e/web/set-page-match.spec.ts:80:1 › set page match: timer timeout shows results
  ✓   9 [system-chromium] › tests/e2e/web/set-page-shell.spec.ts:3:1 › set page shell: viewer keyboard + export modal
  ✓  10 [system-chromium] › tests/e2e/web/settings-gate-banner.spec.ts:3:1 › settings: shows and dismisses missing-default-model banner
  ✓  11 [system-chromium] › tests/e2e/web/smoke.spec.ts:3:1 › smoke: home page loads
  ✓  12 [system-chromium] › tests/e2e/web/study-guide-page.spec.ts:3:1 › study guide: navigates from set page and renders markdown blocks
  ✓  13 [system-chromium] › tests/e2e/web/synthesize-page.spec.ts:3:1 › synthesize: web preview shows gating banner and disables create

  13 passed (43.7s)
```

### Status

- RESULT: PASS (13/13) using `TRACER_WEB_CHANNEL=chromium`

### Rerun stability (refresh)

This suite was re-run to refresh evidence. On the first rerun attempt, 1 test failed; a second rerun passed.

#### Rerun attempt #1 (FAIL: 12/13)

Command:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Observed failure excerpt:

```text
✘   1 [system-chromium] › tests/e2e/web/generate-page.spec.ts:3:1 › generate: web preview shows gating banner and disables generate

Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Create · Generate' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

#### Rerun attempt #2 (PASS: 13/13)

Command:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Result summary:

```text
13 passed
```

#### Rerun attempt #3 (PASS: 13/13)

Command:

```bash
TRACER_TEST_MODE=1 TRACER_WEB_CHANNEL=chromium bun run test:e2e:web
```

Observed output summary:

```text
13 passed (36.8s)
```

### Deterministic setup notes

- `TRACER_TEST_MODE=1` set in the shell for both runs.
- `tests/e2e/web/run.mjs` forces web-preview mode by setting `process.env.VITE_TRACER_FORCE_WEB = '1'` before running Playwright.

### Smoke flow coverage (by spec)

This web E2E suite covers the following flows in web-preview mode:

- Basic app boot: `tests/e2e/web/smoke.spec.ts` ("home page loads")
- Navbar search: `tests/e2e/web/navbar-search.spec.ts` (search → home `q=`)
- Settings gating UX: `tests/e2e/web/settings-gate-banner.spec.ts` (missing-default-model banner)
- Create/Synthesize gating: `tests/e2e/web/synthesize-page.spec.ts` (banner + Create disabled)
- Create/Generate gating: `tests/e2e/web/generate-page.spec.ts` (banner + Generate disabled)
- Set shell + export: `tests/e2e/web/set-page-shell.spec.ts` (viewer keyboard + export modal + copy)
- Study guide: `tests/e2e/web/study-guide-page.spec.ts` (navigation + markdown render)
- Study modes: flashcards/learn/match:
  - `tests/e2e/web/set-page-flashcards.spec.ts`
  - `tests/e2e/web/set-page-learn.spec.ts`
  - `tests/e2e/web/set-page-match.spec.ts` (complete + timer timeout)
- Chat mode: `tests/e2e/web/set-page-chat.spec.ts` (mock stream + offline modal)

### Manual web smoke (optional)

Not executed here (no interactive Playwright MCP/browser-driving capability available in this environment beyond the automated `bun run test:e2e:web` run above).

### Overall gate assessment

Web smoke is green (13/13 on the latest rerun). Desktop E2E is not executable on macOS by harness design, so on this host F3 relies on web smoke as the available E2E signal; desktop E2E should be covered on Linux/Windows CI.

VERDICT: APPROVE
