
- 2026-03-28: Added `src-tauri/rust-toolchain.toml` pinning Rust 1.88.0 to satisfy Tauri v2 transitive dependency MSRV (build failed on rustc 1.86 due to crates requiring >=1.88).
- 2026-03-28: Nuxt is configured as SPA (`ssr: false`) and built via `nuxt generate`; Tauri `frontendDist` points at `../dist`.
- 2026-03-28: Tauri bundling targets limited to `app` during scaffold to avoid DMG AppleScript timeouts in headless/CI-like environments.

- 2026-03-28: Desktop E2E harness uses the official Tauri WebDriver approach (`tauri-driver` + WebdriverIO). On macOS, `test:e2e:desktop` is configured to skip and developers should use Playwright web-smoke instead.

- 2026-03-28: Web smoke (Playwright) is opt-in via `TRACER_WEB_E2E=1` and never auto-downloads browsers. Default `bun run test` does not run web E2E on macOS unless explicitly enabled.

- 2026-03-28: SQLite schema is managed via `tauri-plugin-sql` migrations embedded in the Tauri binary (`include_str!`) and registered for `sqlite:tracer.db` at startup.

- 2026-03-29: Nuxt dev watcher configuration explicitly ignores `src-tauri/**` (including `src-tauri/target`) to keep `bun run tauri:dev` stable on macOS by preventing chokidar from watching Cargo build artifacts.

- 2026-03-29: DB access layer is centralized under `src/composables/db/*` with a single initializer (`useTracerDb`) loading `sqlite:tracer.db`; all SQL is isolated to repository modules (no raw SQL in pages/components).

- 2026-03-29: Unit tests use a sqlite3 CLI-backed `DbClient` shim for repository roundtrip verification to avoid reliance on Tauri runtime paths while still exercising the repository SQL.

- 2026-03-29: App lock uses Stronghold with an Argon2-derived key from the user’s app password + a local salt file; disabling startup lock enables auto-unlock by storing only the derived key (hex) in the OS keychain (no plaintext app password stored).

- 2026-03-29: Global navigation shell is implemented via `AppShell` in `app.vue`; the navbar can be hidden per-route using `definePageMeta({ hideNavbar: true })` (used on `first-run` and `unlock` now; flashcard modes will use the same hook).

- 2026-03-29: Dark mode is persisted in `app_settings.dark_mode` via `createSettingsRepo` and applied by toggling the `dark` class on `document.documentElement` in a small `theme` composable.

- 2026-03-29: Implemented a session-only “unlocked” flag in a small composable (`src/composables/lock-session.ts`) so the app can navigate to `/` after a successful unlock without requiring any additional persistent state beyond the existing keychain marker.

- 2026-03-29: Home page (`/`) presents a combined, read-only list of flashcard sets and per-set study guides. Create entry points are surfaced as simple routes under `/create/*` with stub pages; lock behavior is preserved by duplicating the existing startup gate on those create routes.

- 2026-03-29: Basic creation flow persists sets via `createSetsRepo(db).create(...)` and always normalizes draft inputs using `normalizeTerms` before storing `terms_json` (array of `{ id, front, back }`).

- 2026-03-29: Set page (`/set/:id`) implements Task 10 as a single page shell: it includes an in-page flashcard viewer (Space to flip, Arrow keys to navigate) plus an Export modal producing strict TSV and a below-page term/definition list; study-mode routes are represented as lightweight entry links (no mode logic yet).
- 2026-03-29: Added a `build` script (`nuxt build`) because Task verification expects `bun run build`.

- 2026-03-29: Default AI model selection is stored as a single `app_settings.default_model_id` string formatted as `providerId:modelId`.
- 2026-03-29: AI entry routes that require a default model redirect to Settings with `/settings?reason=missing-default-model&from=<path>`; the Settings page shows a user-facing banner when `reason=missing-default-model`.

- 2026-03-29: AI provider registry resolves `providerId:modelId` to a Vercel AI SDK model instance. Provider credentials/config are loaded from Stronghold via Tauri commands (never from SQLite/localStorage), and all provider HTTP uses `tauri-plugin-http` fetch (capability-scoped allowlist).

- 2026-03-29: GitHub Models token is stored only in Stronghold under the existing AI secrets channel (`github_models_token`). OAuth device flow is the default; when device flow is unavailable/fails we fall back to PKCE with a localhost callback listener (`http://127.0.0.1:{random_port}/callback`) and state verification.

- 2026-03-30: Synthesize implementation:
  - `pages/create/synthesize.vue` builds an AI prompt using strict TSV context (`source<TAB>term<TAB>definition`) and requires TSV-only output (`term<TAB>definition`).
  - On malformed output, the page surfaces a friendly parse error and exposes the raw model output in a read-only textarea with Copy/Select-all affordances.
  - Web preview mode explicitly disables Create and shows a banner because Synthesize depends on Tauri-only DB + vault.

- 2026-03-30: Generate mode output contract uses two fenced blocks (`study_guide_md`, `flashcards_tsv`) rather than a single TSV-only response so we can persist both a study guide (markdown) and flashcards (validated TSV) from one model call.

- 2026-03-30: Generate mode includes a minimal `/study-guide/:setId` viewer route and a conditional link from `/set/:id` so the persisted study guide is accessible without implementing any new study-mode UX.

- 2026-03-30: Web preview detection for Task 16 is handled at the set page level: if Tauri IPC is unavailable (no `__TAURI_INTERNALS__.invoke` function), `/set/:id` initializes an in-memory demo set instead of redirecting to `/unlock`. This keeps web Playwright E2E stable without changing lock semantics for the desktop app.

- 2026-03-30: Flashcards mode run state is kept in-memory in `pages/set/[id].vue` (order, cursor, answers). Star state is the only thing persisted: on desktop it uses `createStarsRepo(db)` (SQLite); on web preview it becomes a safe in-memory Set to keep E2E non-crashing.

- 2026-03-30: Learn mode is always available offline (deterministic baseline questions). AI is optional augmentation only: it runs only when the Learn hybrid setting is enabled AND a default model is configured, and it is disabled in web preview. Baseline questions are always included even if augmentation fails.

- 2026-03-30: Match mode tile selection/shuffle is implemented as a deterministic generator (`src/composables/match/generator.ts`) that filters blank terms, selects up to `min(8, deckSize)` pairs, and shuffles a 2×N tile list using a seeded PRNG.

- 2026-03-30: Study guide view renders markdown via an internal, dependency-free renderer (`src/composables/markdown/parse.ts` + `components/MarkdownRenderer.vue`) supporting headings, lists, and fenced code blocks. Rendering is text-only (no HTML execution) to keep the prototype safe.

- 2026-03-30: Web preview E2E coverage for the study guide uses the existing demo set flow: `/set/demo` exposes a Study guide link and `/study-guide/:setId` uses a demo markdown payload so Playwright can validate rendering without Tauri DB access.

- 2026-03-30: Task 21 search uses a single query param (`q`) on the Home route and a shared pure filter function to keep navbar search + home filtering + synthesize filtering aligned.

- 2026-03-30: Task 22 documentation lives in a single artifact at `docs/architecture.md` and enumerates key files/dirs + run commands + platform caveats.

- 2026-03-30: Task 23 AI error UX is standardized via a single taxonomy (`src/composables/ai/ux-errors.ts`) and a shared modal component (`components/AiErrorModal.vue`) so Synthesize/Generate/Chat present the same actionable messages and (when relevant) a single “Go to Settings” path.

- 2026-03-31: F4 scope fidelity audit recorded in `.sisyphus/evidence/f4-scope-fidelity.md`. Verdict APPROVE: navigation shell matches spec (navbar suppressed for flashcard modes via `components/AppShell.vue`; back button global via `components/BackButton.vue`), set export uses strict TSV (`pages/set/[id].vue`), and Synthesize/Generate follow the plan-locked strict TSV AI I/O contract (`parseTermsTsv`; Generate uses fenced study-guide contract). Noted acceptable compromises: Synthesize lacks Enter-to-add (Add button exists), Learn omits written questions, and avatar is an initial.

## Task 25 — Deterministic test mode

- Implemented deterministic mode by stubbing at the transport/model boundary:
  - `resolveAiModel()` returns a deterministic `LanguageModelV3` when `TRACER_TEST_MODE=1` (unless `TRACER_LIVE_AI=1`).
  - `aiHttpFetch()` throws in test mode to prevent accidental network dependence; `TRACER_LIVE_AI=1` explicitly opts back into live network calls.
- OAuth stubs are implemented in the OAuth helper layer (`github-oauth.ts`) and GitHub catalog helper (`github-models.ts`) so UI code does not need branching.
