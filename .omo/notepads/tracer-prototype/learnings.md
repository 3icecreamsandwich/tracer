
- 2026-03-29: `tauri-plugin-sql` migrations can be verified deterministically without the Tauri runtime by applying the migration SQL to a temp sqlite file via the `sqlite3` CLI from a Vitest test (use `-bail` and `.read` to fail fast).

- 2026-03-29: Nuxt/Tauri dev can hit `EMFILE: too many open files` when the Nuxt/Vite watcher traverses `src-tauri/target/**` during Rust builds; ignoring `**/src-tauri/**` at the Vite watcher level prevents chokidar from watching Cargo artifacts and stabilizes `bun run tauri:dev` on macOS.

- 2026-03-29: Settings persistence patterns:
  - `app_settings.default_model_id` is a single string and can be represented as `providerId:modelId`.
  - “No default model selected” gating can redirect AI entry routes to `/settings` with a `reason=missing-default-model` query param so the Settings page can show an actionable banner.
  - For `/set/:id`, only gate chat entry (e.g. `?mode=chat`) to preserve existing web fallback shell behavior used by Playwright.

- 2026-03-29: For Playwright web E2E, pages that directly call Tauri-only APIs (lock/db) need a web-preview guard (e.g. `__TAURI_INTERNALS__` check) or the web runner will fail; Settings now supports a lightweight web preview mode so `/settings?...` can be tested for redirect banner UX.

- 2026-03-29: When running Vercel AI SDK inside Tauri, pass a custom `fetch` implementation (or provider factory `fetch` option) that uses `@tauri-apps/plugin-http` to avoid CORS and to respect Tauri capability allow-scopes.

- 2026-03-29: GitHub Models OAuth implementation notes:
  - Device flow endpoints: `POST https://github.com/login/device/code` then poll `POST https://github.com/login/oauth/access_token` and handle `authorization_pending`, `slow_down` (add +5s), `expired_token`, `access_denied`, `device_flow_disabled`.
  - PKCE fallback can be implemented without a client_secret by starting a local `127.0.0.1:0` callback listener and exchanging with `code_verifier`.
  - Token verification can use `GET https://models.github.ai/catalog/models` with `Authorization: Bearer <token>` and the standard GitHub REST headers.

- 2026-03-30: Synthesize page patterns:
  - Use `parseTermsTsv` + `normalizeTerms` for strict AI TSV parsing and term validation (reused from validators).
  - For web preview (no Tauri), guard synthesize route with `__TAURI_INTERNALS__` and show a gating banner to keep Playwright web E2E green.
  - When prompting, embed source material as strict TSV and instruct “TSV-only, exactly one tab per line, no header”.

- 2026-03-30: Generate mode patterns:
  - For multimodal ingestion, use Vercel AI SDK `generateText()` message parts: include PDFs as `{ type: 'file', data: Uint8Array, mediaType: 'application/pdf' }` and images as `{ type: 'image', image: Uint8Array, mediaType }`.
  - Enforce ingestion limits in the UI and fail closed (no silent truncation): block if PDFs exceed 10 total pages or images exceed 10.
  - For AI output reliability, request two explicit fenced blocks (`study_guide_md` and `flashcards_tsv`) and parse them strictly; on parse failure, show a user-facing error and expose the raw model output for copy/debug.

- 2026-03-30: Playwright web E2E can show `/unlock` on routes that call Tauri `invoke()` if the runtime is absent but the app assumes Tauri. For web-preview-safe behavior, ensure set page can fall back to an in-memory “demo set” when Tauri IPC is unavailable.

- 2026-03-30: Chat mode implementation can be tested in web preview by streaming a mock response via an async generator and appending chunks to the last assistant message; Playwright assertions against incremental text validate streaming behavior.

- 2026-03-30: Flashcards mode (set page) is now a true “run” (not just browsing): keep in-memory run state (shuffled order + per-term correct/incorrect) and show a results view when all cards are attempted. Use Playwright assertions tolerant of shuffle (assert progression/results, not fixed order).

- 2026-03-30: When flashcards runs are shuffled, E2E shell tests must not assume a fixed first card. Prefer extracting the visible card number from the viewer button text, then asserting flip/navigation behavior relative to that value.

- 2026-03-30: Learn mode question generation can be deterministic and offline by using a seeded PRNG and generating two baseline question types per term: (1) True/False statements by swapping in a wrong definition when available, and (2) Multiple choice using 1 correct definition + 3 same-deck distractors. This supports reproducible runs via a `seed` query param and enables stable unit tests.

- 2026-03-30: For Playwright web-preview E2E, any new study mode must be initialized in the set page demo fallback (`initWebDemoSet`) or tests like `/set/demo?mode=learn` will show `0/0` due to missing run initialization.

- 2026-03-30: Match mode can be made deterministic and testable by factoring tile generation into a seeded pure function (2 tiles per pair) and using `?seed=` in Playwright for stable runs.
- 2026-03-30: For Playwright timer tests without adding app-only test hooks, overriding `Date.now` via `page.addInitScript` and advancing a synthetic offset is enough to trigger interval-driven timeouts.

- 2026-03-30: For prototype-safe markdown rendering without new deps, a small block parser + Vue template rendering is enough for headings/lists/code fences while staying safe-by-default (no raw HTML; all text is interpolated).

- 2026-03-30: Playwright strict mode commonly fails when `getByRole()` matches multiple elements (e.g., multiple headings or listitems). Use `exact: true`, `.first()`, or a more specific locator.

- 2026-03-30: Basic set search should be shared between Home list filtering and Create/Synthesize list filtering; a small pure helper (`filterSetSearch`) keeps matching logic consistent and unit-testable.

- 2026-03-30: Task 22 docs: For this prototype, a single `docs/architecture.md` is a good “one artifact” to keep file-by-file purpose documentation discoverable without spreading notes across multiple READMEs.

- 2026-03-30: Playwright strict mode can treat `getByRole('button', { name: 'Close' })` as ambiguous when there are multiple close buttons (e.g. overlay click-target plus an explicit Close button). Use `exact: true` or target the modal dialog scope to keep E2E stable.

- 2026-03-30: Web preview chat uses a mock streaming generator; it will not naturally fail when Playwright toggles offline unless the UI checks `navigator.onLine === false` (or the mock attempts a real fetch). For offline UX tests, explicitly guard on `navigator.onLine` and raise a normalized `network_offline` error so the modal appears deterministically.

- 2026-03-30: Task 24: Treat error messages as untrusted input; redact token-like strings (e.g. `Bearer ...`, `sk-...`, `gho_...`, `AIza...`) before surfacing them to users.

- 2026-03-30: F2 review note: AI credential storage is Stronghold-backed via Tauri `invoke` (with a non-Tauri in-memory fallback), and a simple `aiHttpFetch` guard makes unit tests deterministic by default when `TRACER_TEST_MODE=1`.

- 2026-03-31: F2 re-validation: `lsp_diagnostics` at repo root for `.ts` (severity=error) reported 0 errors (50-file tool cap). Quality gates: `bun run test:unit` PASS (Vitest 45/45 + `cargo test` 1/1) and `bun run build` PASS; only notable warning remains Nuxt/Vite sourcemap warning from `nuxt:module-preload-polyfill`.

## Task 25 — Deterministic test mode

- Vite/Nuxt runtime only exposes env vars prefixed with `VITE_`, but unit tests run in Node where `process.env` is available; a small helper (`src/composables/ai/test-mode.ts`) reads both so `TRACER_TEST_MODE=1` works in both contexts.
- AI call sites rely on `generateText`/`streamText` mapping into the AI SDK `LanguageModelV3` interface; returning a `LanguageModelV3` stub from `resolveAiModel()` is enough to make Synthesize/Generate/Chat deterministic without touching the pages.
 - GitHub Models OAuth and catalog verification are the main network/OAuth dependencies; stubbing those calls removes manual browser/device flow requirements for automation.

- 2026-03-30: F3 smoke gate on macOS:
  - `bun run test:e2e:desktop` is an intentional harness skip on darwin (`tests/e2e/desktop/run.mjs`).
  - `bun run test:e2e:web` defaults to `TRACER_WEB_CHANNEL=chrome` and will skip on macOS if system Chrome is missing; using `TRACER_WEB_CHANNEL=chromium` runs successfully with Playwright's Chromium.

- 2026-03-31: Tauri runtime detection should not rely on UA sniffing; in Tauri v2 you can reliably detect via `window.__TAURI_INTERNALS__` or `globalThis.isTauri`, while preserving `VITE_TRACER_FORCE_WEB=1` as an explicit override for web preview/E2E.
