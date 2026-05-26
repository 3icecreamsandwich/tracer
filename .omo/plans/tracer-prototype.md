# Tracer Prototype (Tauri v2 + Nuxt + SQLite + Vercel AI SDK)

## TL;DR
> **Summary**: Bootstrap an empty repo into a production-shaped Tauri+Nuxt desktop app implementing Tracer’s flashcard flows (Basic/Synthesize/Generate), set page modes (Flashcards/Learn/Match/Chat), and Settings (dark mode, default model, BYOK + OAuth providers) with secure local storage.
> **Deliverables**:
> - Working desktop app (Tauri) with all pages/modes described in `instruct.md`
> - SQLite persistence (sets + study guides + stars + settings + profile)
> - Secure secrets storage (Stronghold) + app lock + reset flow
> - AI integration (Vercel AI SDK in-frontend) + GitHub Models OAuth (device code w/ PKCE fallback)
> - Documentation: “each program file’s purpose” (prototype doc)
> **Effort**: XL
> **Parallel**: YES — 5 waves
> **Critical Path**: Scaffold → DB+types → Stronghold+lock → Core UI flows → AI providers+OAuth → Modes+polish → Docs+final verification

## Context
### Original Request
- See `/Users/ec027e21/Development/tracer/instruct.md`.

### Interview Summary (decisions locked)
- Repo is empty; must scaffold from scratch.
- Package manager: **Bun**.
- UI: Nuxt + Tailwind; modern neutral styling with light/dark.
- First startup: collect name/email/password; app locked by default.
- Lock can be disabled in Settings; then **auto-unlock** on next startup.
- Secrets store: **Tauri Stronghold** (primary). App password unlocks Stronghold.
- Forgot password: offer **Reset Tracer** (wipes Stronghold vault + SQLite DB).
- SQLite: `tauri-plugin-sql` + migrations; flashcard terms stored as JSON in a `terms` column.
- AI: Vercel AI SDK executed in the **frontend**; HTTP via **tauri-plugin-http**.
- Missing default model: block Synthesize/Generate/Chat and redirect to Settings.
- AI I/O format for sets: **TSV** (`term\tdefinition` per line); enforce strict output (no chatter).
- Generate ingestion: hybrid (extract text when possible; rasterize PDF pages as fallback); default cap **10 pages / 10 images**.
- Generate output: creates **flashcard set + study guide (Markdown)**.
- Synthesize: add **optional Theme** input.
- Set page modes: implement **Flashcards, Learn, Match, Chat**.
  - Learn: deterministic by default; Settings toggle enables hybrid AI augmentation (only after default model chosen).
  - Match: default **4x4 (8 pairs)**, **60s**.
  - Chat: **session-only** history; “prefer grounded” to current set.
- Starred cards: persist per set across modes.
- OAuth+BYOK full: must support both key-based providers and at least one OAuth provider end-to-end.
  - OAuth provider: **GitHub Models**.
  - OAuth flow: **device code** preferred; fallback to **auth-code + PKCE + localhost callback**.
  - GitHub OAuth `client_id`: shipped with app.

### Metis Review (gaps addressed)
- Guardrails added: avoid scope creep in provider list; implement “many providers” via curated presets + optional OpenAI-compatible custom endpoint.
- Add explicit error-handling acceptance criteria for: OAuth failures, Stronghold unlock failures, provider failures/offline.

## Work Objectives
### Core Objective
Deliver a working Tracer desktop prototype matching `instruct.md` behaviors, with secure local storage and AI-powered generation/synthesis/chat.

### Deliverables
1. Tauri+Nuxt app scaffold with dev/build scripts
2. SQLite schema + migrations + access layer
3. Stronghold-backed secrets + app lock + reset
4. Pages:
   - First-run profile
   - Home (Sets list + Create list)
   - Create: Basic / Synthesize / Generate
   - Flashcard Set Page (viewer + export modal + list)
   - Modes: Flashcards / Learn / Match / Chat
   - Settings (dark mode + default model + providers/models + auth)
5. AI provider layer:
   - BYOK: at least OpenAI, Anthropic, Google Gemini API key (curated)
   - OAuth: GitHub Models usable for Chat/Generate/Synthesize
   - “OpenAI-compatible custom endpoint” advanced option (enables “as many providers as possible”)
6. Documentation file describing each program file purpose

### Definition of Done (agent-verifiable)
- [ ] `bun install` succeeds.
- [ ] `bun tauri:dev` launches app window and navigates core flows.
- [ ] `bun tauri:build` succeeds.
- [ ] DB migrations apply; sets persist across restarts.
- [ ] Stronghold vault created; lock/unlock works; reset wipes data.
- [ ] AI flows succeed end-to-end with at least one BYOK provider and GitHub Models OAuth provider.
- [ ] E2E smoke tests pass (Playwright) and unit tests pass (Vitest) with Bun.

### Must Have
- Strict TSV parsing and prompt hardening (no “Sure…” preamble accepted).
- Robust error UX for missing model/keys/auth, offline, provider errors.

### Must NOT Have (guardrails)
- No plaintext secrets in SQLite, localStorage, or files.
- No “fake” provider integrations: any listed provider must either be functional, or clearly marked “coming soon” and hidden behind an advanced toggle.
- No silent truncation of user content without warning (PDF/page limits must be surfaced).

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: **tests-after** (repo is empty; build vertically but add tests in each task)
- Unit tests: **Vitest** for pure logic (TSV parsing, question generation, scoring).
- Desktop E2E: **tauri-driver + WebdriverIO** (official Tauri WebDriver approach).
- Web-only E2E (macOS/dev convenience): **Playwright** against Nuxt web build (does not cover Tauri-specific APIs).
- Evidence policy: every task produces `.sisyphus/evidence/task-{N}-{slug}.md` (or `.png/.webm` for UI runs).

## Execution Strategy
### Parallel Execution Waves
Wave 1: Scaffolding + core infra (Nuxt/Tauri/Tailwind, plugins, test harness)
Wave 2: Storage layer (SQLite schema/migrations, data access composables, Stronghold primitives)
Wave 3: Core UX pages (First run, Home, Basic, Set page shell, Settings shell)
Wave 4: AI layer + OAuth + Synthesize/Generate + Chat
Wave 5: Learning modes (Flashcards/Learn/Match) + export + docs + polish

### Dependency Matrix (high level)
- Wave 1 blocks everything.
- Wave 2 blocks persistence + auth + settings.
- Wave 3 blocks AI UI integration and mode work.
- Wave 4 blocks “done” for Synthesize/Generate/Chat.
- Wave 5 finalizes user-visible completeness and documentation.

## TODOs
> Implementation + test = ONE task. Never separate.
> EVERY task MUST include QA scenarios and evidence paths.

- [x] 1. Scaffold Nuxt + Tauri + Tailwind + Bun scripts

  **What to do**:
  - Initialize Nuxt project using Bun.
  - Initialize Tauri v2 with `--no-frontend`.
  - Add Tailwind + base styling scaffold.
  - Add scripts: `dev`, `tauri:dev`, `tauri:build`, `test`.
  - Confirm Nuxt configured for Tauri (ssr disabled; strict port).

  **Must NOT do**: Add backend Nitro server as a requirement (frontend-only runtime).

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — multi-tool scaffolding, config correctness
  - Skills: [`/git-master`] — if repo becomes git; otherwise omit

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: all | Blocked By: none

  **References**:
  - External: https://v2.tauri.app/start/frontend/nuxt/

  **Acceptance Criteria**:
  - [ ] `bun install` succeeds.
  - [ ] `bun tauri:dev` launches a window showing Nuxt default page.

  **QA Scenarios**:
  ```
  Scenario: Launch dev app
    Tool: Bash
    Steps: bun tauri:dev
    Expected: Tauri window opens; Nuxt page renders without console errors
    Evidence: .sisyphus/evidence/task-1-scaffold.md

  Scenario: Production build
    Tool: Bash
    Steps: bun tauri:build
    Expected: Build completes successfully and outputs bundle artifacts
    Evidence: .sisyphus/evidence/task-1-build.md
  ```

  **Commit**: YES | Message: `chore(scaffold): bootstrap nuxt+tauri workspace` | Files: [project root, src-tauri/*]

- [x] 2. Add core dependencies + test harness (Vitest + Playwright) with Bun

- [x] 2. Add core dependencies + test harness (Vitest + tauri-driver + WebdriverIO; optional Playwright web-smoke)

  **What to do**:
  - Add Vitest config for pure TS logic tests.
  - Add Desktop E2E harness following official Tauri WebDriver testing:
    - Install `tauri-driver`
    - Add WebdriverIO test runner and config that launches the built debug Tauri binary
    - Add OS notes: Desktop E2E runs in CI on **Linux + Windows** (macOS WebKit driver is not available)
  - Add optional Playwright web-smoke suite that runs against `bun run dev` (or `bun run preview`) for macOS/dev-only checks.
  - Add scripts to run unit + e2e:
    - `test:unit` (Vitest)
    - `test:e2e:desktop` (WebdriverIO + tauri-driver)
    - `test:e2e:web` (Playwright, optional)
    - `test` runs unit + whichever e2e suite is available on the platform.
  - Add minimal sample tests to prove harness works.

  **Must NOT do**: Overbuild CI; keep local runnable.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — test infra choices and wiring
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: tasks 8+ requiring tests | Blocked By: 1

  **References**:
  - External: https://v2.tauri.app/develop/tests/webdriver/
  - External: https://github.com/tauri-apps/webdriver-example

  **Acceptance Criteria**:
  - [ ] `bun test` (or `bun run test`) runs and reports green on sample tests.

  **QA Scenarios**:
  ```
  Scenario: Unit test harness
    Tool: Bash
    Steps: bun test
    Expected: Vitest executes and passes
    Evidence: .sisyphus/evidence/task-2-vitest.md

  Scenario: Desktop E2E harness boot (Linux/Windows)
    Tool: Bash
    Steps: bun run test:e2e:desktop
    Expected: WebdriverIO runs against tauri-driver and completes sample smoke
    Evidence: .sisyphus/evidence/task-2-wdio.md

  Scenario: Web-smoke (macOS/dev-only)
    Tool: Bash
    Steps: bun run test:e2e:web
    Expected: Playwright runs web-smoke without failures
    Evidence: .sisyphus/evidence/task-2-playwright-web.md
  ```

  **Commit**: YES | Message: `test(scaffold): add vitest and playwright harness` | Files: [test config + sample tests]

- [x] 3. Implement SQLite schema + migrations (sets, guides, stars, settings, profile)

  **What to do**:
  - Add `tauri-plugin-sql` with SQLite feature.
  - Create migrations to define:
    - `profile` (id, name, email, created_at)
    - `flashcard_sets` (id, title, description, terms_json, created_at, updated_at)
      - `terms_json` MUST be a JSON array of objects with a stable UUID field: `{ id: string, front: string, back: string, ... }`
    - `starred_terms` (set_id, term_id TEXT) where `term_id` matches the UUID in `terms_json`
    - `study_guides` (id, set_id, markdown, created_at)
    - `app_settings` (startup_lock_enabled, default_model_id, dark_mode, learn_hybrid_enabled)
  - Enforce JSON validity for `terms_json` via `CHECK (json_valid(...))`.
  - Add indexes for set listing and joins.

  **Must NOT do**: Store API keys or OAuth tokens in SQLite.

  **Recommended Agent Profile**:
  - Category: `deep` — schema design impacts all features
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 5-12 | Blocked By: 1

  **References**:
  - External: https://v2.tauri.app/plugin/sql/
  - External: https://www.sqlite.org/json1.html

  **Acceptance Criteria**:
  - [ ] App runs migrations on first launch and can insert/select a test set.

  **QA Scenarios**:
  ```
  Scenario: JSON constraint rejects invalid terms
    Tool: Bash
    Steps: Run app test that inserts invalid JSON into flashcard_sets.terms_json
    Expected: Insert fails with constraint error; app surfaces friendly message
    Evidence: .sisyphus/evidence/task-3-json-constraint.md

  Scenario: Round-trip terms JSON
    Tool: Bash
    Steps: Insert set with two terms; restart app; verify set list shows it
    Expected: Terms parse correctly and persist
    Evidence: .sisyphus/evidence/task-3-roundtrip.md
  ```

  **Commit**: YES | Message: `feat(db): add sqlite schema and migrations` | Files: [src-tauri migrations + plugin wiring]

- [x] 4. Build typed data access layer (DB composables + validators)

  **What to do**:
  - Implement a single DB initializer composable that loads `sqlite:flashcards.db` once.
  - Create typed repositories for:
    - profile (get/set)
    - sets (list/create/get/update)
    - stars (toggle/list)
    - study guides (create/get by set)
    - settings (get/set)
  - Add strict validators:
    - TSV parser → array of terms
    - Terms JSON schema validation (front/back non-empty)
    - Terms MUST include stable UUID `id` (generate if absent)

  **Must NOT do**: Scatter raw SQL in UI components.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — cross-cutting typing + architecture
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: UI tasks | Blocked By: 3

  **References**:
  - Pattern: (new) `src/composables/db/*` (create)

  **Acceptance Criteria**:
  - [ ] Unit tests cover TSV parsing (valid/invalid) and term validation.

  **QA Scenarios**:
  ```
  Scenario: Parse TSV with tabs/newlines
    Tool: Bash
    Steps: bun test (tsv parser suite)
    Expected: Correctly parses; rejects lines without a tab
    Evidence: .sisyphus/evidence/task-4-tsv-tests.md

  Scenario: DB layer creates and lists sets
    Tool: WebdriverIO (tauri-driver)
    Steps: Create a set via UI; return home; verify appears
    Expected: Set appears in list and opens
    Evidence: .sisyphus/evidence/task-4-ui-roundtrip.md
  ```

  **Commit**: YES | Message: `feat(db): add typed repositories and validators` | Files: [composables + tests]

- [x] 5. Integrate Stronghold + app lock (password verifier, unlock, auto-unlock, reset)

  **What to do**:
  - Install/configure `tauri-plugin-stronghold`.
  - Implement Stronghold initialization and a vault file location under app data dir.
  - Use the **app password** to unlock Stronghold.
  - Store only a password verifier (hash+salt) in Stronghold (never plaintext).
  - Implement flows:
    - First run: set password, create vault
    - Startup lock enabled: prompt for password, unlock vault
    - Startup lock disabled: auto-unlock by storing the vault password in OS keychain when the user explicitly disables lock (requires one-time password entry to confirm). Use Rust `keyring` crate to read/write keychain entry. This matches documented Stronghold patterns.
    - Forgot password: “Reset Tracer” wipes Stronghold vault + SQLite DB and restarts onboarding
  - Add error UX for wrong password + repeated failures.

  **Must NOT do**: Store password plaintext anywhere; leak secrets to logs.

  **Recommended Agent Profile**:
  - Category: `deep` — security + lifecycle sensitive
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: AI keys/tokens + lock UX | Blocked By: 1

  **References**:
  - External: https://tauri.app/plugin/stronghold/
  - External: https://github.com/tauri-apps/plugins-workspace/issues/1959

  **Acceptance Criteria**:
  - [ ] On cold start with lock enabled: app requires password before showing main UI.
  - [ ] Wrong password shows error and does not unlock secrets.
  - [ ] Disabling startup lock leads to next launch auto-unlocking without prompts.
  - [ ] Reset Tracer fully wipes and returns to first-run.

  **QA Scenarios**:
  ```
  Scenario: Lock/unlock happy path
    Tool: Playwright
    Steps: First run -> set password -> restart app -> enter password -> reach home
    Expected: Home page visible; secrets accessible
    Evidence: .sisyphus/evidence/task-5-lock-happy.md

  Scenario: Wrong password
    Tool: Playwright
    Steps: Restart app -> enter wrong password
    Expected: Clear error; no navigation to home
    Evidence: .sisyphus/evidence/task-5-lock-wrong.md

  Scenario: Reset Tracer
    Tool: Playwright
    Steps: From lock screen choose Reset -> confirm -> app restarts
    Expected: First-run form shown; previous sets gone
    Evidence: .sisyphus/evidence/task-5-reset.md
  ```

  **Commit**: YES | Message: `feat(security): add stronghold-backed app lock and reset` | Files: [src-tauri stronghold + UI screens]

- [x] 6. Implement global layout + navigation shell + theming

  **What to do**:
  - Build a consistent navigation bar on all pages except the flashcard modes (per spec).
  - Include: Home button, search bar (scaffold functionality), profile avatar leading to Settings.
  - Implement back button on all pages including modes.
  - Add dark/light mode with Tailwind and persist setting in SQLite.
  - Keep UI “clean, modern, neutral”; minimal separators.

  **Must NOT do**: Add heavy component libraries unless necessary.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: all page work | Blocked By: 1,3

  **References**:
  - Source: `instruct.md` Navigation + Styling sections

  **Acceptance Criteria**:
  - [ ] Navbar appears on required pages; Settings reachable.
  - [ ] Dark mode toggle persists across restarts.

  **QA Scenarios**:
  ```
  Scenario: Dark mode persistence
    Tool: Playwright
    Steps: Open Settings -> enable Dark Mode -> restart app
    Expected: Dark mode still enabled
    Evidence: .sisyphus/evidence/task-6-darkmode.md
  ```

  **Commit**: YES | Message: `feat(ui): add layout, navigation, and theming` | Files: [layouts/components/pages]

- [x] 7. First-run profile + subsequent startup lock screens

  **What to do**:
  - Implement first-run page collecting name/email/password.
  - Save profile to SQLite; store password verifier in Stronghold.
  - On subsequent launches:
    - if lock enabled: show unlock screen
    - if lock disabled: auto-unlock and route to home

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: home | Blocked By: 3,5,6

  **Acceptance Criteria**:
  - [ ] First run routes to home after save.
  - [ ] Lock screen appears appropriately.

  **QA Scenarios**:
  ```
  Scenario: First run -> home
    Tool: Playwright
    Steps: Launch -> fill profile -> submit
    Expected: Home page rendered with empty placeholder
    Evidence: .sisyphus/evidence/task-7-first-run.md
  ```

  **Commit**: YES | Message: `feat(profile): add first-run profile and startup routing` | Files: [pages + db + security glue]

- [x] 8. Home page: Sets list + Create list (Basic/Synthesize/Generate)

  **What to do**:
  - Render “Sets” heading with list of existing flashcard sets and study guides.
  - If none, show placeholder element.
  - Render “Create” list with three items: Basic, Synthesize, Generate.
  - Wire navigation to each mode page.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: creation flows | Blocked By: 4,6,7

  **Acceptance Criteria**:
  - [ ] Home lists sets after creation and remains stable across restart.

  **QA Scenarios**:
  ```
  Scenario: Empty home state
    Tool: Playwright
    Steps: Fresh install -> complete first run -> view home
    Expected: Placeholder visible under Sets; Create list visible
    Evidence: .sisyphus/evidence/task-8-empty-home.md
  ```

  **Commit**: YES | Message: `feat(home): render sets list and create entry points` | Files: [home page + components]

- [x] 9. Basic creation flow (multi-card entry + ctrl/cmd+enter + create)

  **What to do**:
  - Create page with top bar fields: Title, Description.
  - Add repeating card form element with Term + Definition inputs; tab order correct.
  - Add “+” button to append a new empty card.
  - Implement ctrl/cmd+enter to append new card.
  - On Create: validate (non-empty title; term/definition non-empty), persist to SQLite, redirect to new set page.

  **Must NOT do**: Allow invalid empty cards to be saved.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: set page usage | Blocked By: 4,6,8

  **Acceptance Criteria**:
  - [ ] Creating a set persists and redirects to set page.
  - [ ] Keyboard shortcut works on macOS and Windows.

  **QA Scenarios**:
  ```
  Scenario: Create set with 3 cards
    Tool: Playwright
    Steps: Home -> Basic -> fill title/desc -> enter 3 cards using cmd/ctrl+enter -> Create
    Expected: Redirect to set page showing title + first card
    Evidence: .sisyphus/evidence/task-9-basic-create.md
  ```

  **Commit**: YES | Message: `feat(basic): add manual set creation flow` | Files: [basic page + components + db]

- [x] 10. Flashcard Set Page shell (viewer, navigation, export modal, term list)

  **What to do**:
  - Page shows set title + description.
  - Viewer shows current card; supports space to flip; arrow keys or buttons to navigate.
  - Ratio display “a/b”.
  - Button grid: Flashcards/Learn/Match/Chat (routes/sub-modes).
  - Export button opens modal; copy-able TSV-like export but using spec: term + TAB + definition per line.
  - Below: list of term-definition pairs.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: mode implementations | Blocked By: 4,6,9

  **Acceptance Criteria**:
  - [ ] Keyboard navigation + flip works.
  - [ ] Export modal produces correct format.

  **QA Scenarios**:
  ```
  Scenario: Export formatting
    Tool: Playwright
    Steps: Open set -> Export -> copy text
    Expected: Lines are "term\tdefinition" and newline-separated
    Evidence: .sisyphus/evidence/task-10-export.md
  ```

  **Commit**: YES | Message: `feat(set): add set page shell with viewer and export` | Files: [set page + components]

- [x] 11. Settings page (dark mode, default model, provider list, auth entry points)

  **What to do**:
  - Settings page with avatar + name.
  - Dark mode toggle persisted.
  - Default AI Model setting:
    - If none: show Set button
    - Else: show Change button
    - Modal: search providers, then models; Enter selects.
  - Provider auth area:
    - BYOK key inputs (at minimum OpenAI, Anthropic, Gemini API key)
    - OAuth: GitHub Models “Authenticate” button
  - Learn: toggle for enabling hybrid (disabled until default model chosen).
  - Startup lock: toggle “Require password on startup”.
  - Reset Tracer destructive button.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: AI modes gating | Blocked By: 4,5,6,7

  **Acceptance Criteria**:
  - [ ] Selecting a default model persists and is used for AI features.
  - [ ] Trying to enter AI modes without default model blocks + routes here.

  **QA Scenarios**:
  ```
  Scenario: No default model gating
    Tool: Playwright
    Steps: From home click Generate with no model
    Expected: User is redirected to Settings and sees message to pick Default AI Model
    Evidence: .sisyphus/evidence/task-11-gating.md
  ```

  **Commit**: YES | Message: `feat(settings): add theming, model picker, and auth UI` | Files: [settings page + modals]

- [x] 12. AI provider layer: registry, curated presets, OpenAI-compatible custom endpoint

  **What to do**:
  - Implement a single “AI Provider Registry” module that:
    - Maps `providerId:modelId` → AI SDK model instance
    - Loads required credential (API key or OAuth token) from Stronghold
    - Uses `tauri-plugin-http` as the fetch implementation
  - Provide curated presets (functional):
    - OpenAI (api key)
    - Anthropic (api key)
    - Google Gemini (api key)
    - GitHub Models (OAuth bearer token) — see task 13
  - Add an “Advanced” option: OpenAI-compatible custom base URL + model name + bearer/api key.
  - Add a “models list” data source:
    - Prefer a static curated list for prototype (avoid chasing models.dev scraping)
    - Optionally add a “Refresh” that pulls from GitHub Models catalog when authenticated.

  **Must NOT do**: Store keys in localStorage; call provider APIs with browser fetch that triggers CORS.

  **Recommended Agent Profile**:
  - Category: `deep` — cross-provider architecture, security
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 14-16 | Blocked By: 5,11

  **References**:
  - External: https://ai-sdk.dev/ (AI SDK docs)
  - External: https://ai-sdk.dev/providers/openai-compatible-providers

  **Acceptance Criteria**:
  - [ ] Unit tests: registry resolves models; missing creds produce friendly typed errors.

  **QA Scenarios**:
  ```
  Scenario: Missing key error
    Tool: Playwright
    Steps: Select OpenAI model as default without setting key -> attempt Chat
    Expected: Clear error instructing to set OpenAI key in Settings
    Evidence: .sisyphus/evidence/task-12-missing-key.md
  ```

  **Commit**: YES | Message: `feat(ai): add provider registry and credential-backed model resolution` | Files: [serverless ai layer + settings bindings]

- [x] 13. GitHub Models OAuth (device code + PKCE fallback) + token storage

  **What to do**:
  - Implement GitHub OAuth for GitHub Models as the required OAuth provider.
  - Default: device-code flow UX:
    - Show URL + user code; provide copy buttons.
    - Poll token endpoint until success/failure timeout.
    - Use endpoints and rules per GitHub docs:
      - `POST https://github.com/login/device/code`
      - `POST https://github.com/login/oauth/access_token` with grant_type `urn:ietf:params:oauth:grant-type:device_code`
      - handle `authorization_pending`, `slow_down` (+5s), `expired_token`, `access_denied`, `device_flow_disabled`
      - request minimum scope: `models:read`
  - If device flow fails/unavailable: fallback to auth-code + PKCE + localhost callback.
    - Authorization endpoint: `GET https://github.com/login/oauth/authorize`
    - Redirect URI: loopback `http://127.0.0.1:{random_port}/callback`
    - Validate `state` on callback
    - Exchange: `POST https://github.com/login/oauth/access_token` with `code_verifier`
  - Store token in Stronghold.
  - Verify token by calling GitHub Models catalog endpoint and listing models.
  - Token lifecycle:
    - On 401/403 from GitHub Models, mark token invalid and prompt re-auth.
    - Do not attempt refresh (GitHub OAuth tokens are typically non-refreshable for OAuth apps).

  **Must NOT do**:
  - Do not ship any client_secret.
  - Do not log tokens.

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 14-16 | Blocked By: 5,11,12

  **References**:
  - External: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps
  - External: https://docs.github.com/en/rest/models/catalog
  - External: https://github.blog/changelog/2025-05-15-modelsread-now-required-for-github-models-access/

  **Acceptance Criteria**:
  - [ ] User can authenticate; token saved; GitHub Models can be set as default model.
  - [ ] A revoked/expired token is detected and user is prompted to re-auth.

  **QA Scenarios**:
  ```
  Scenario: Device code OAuth success
    Tool: Playwright
    Steps: Settings -> Authenticate GitHub Models -> complete device code in browser -> return
    Expected: Status shows authenticated; models list loads
    Evidence: .sisyphus/evidence/task-13-github-oauth.md

  Scenario: OAuth failure
    Tool: Playwright
    Steps: Start OAuth then cancel/timeout
    Expected: Clear error; app remains usable
    Evidence: .sisyphus/evidence/task-13-github-oauth-fail.md
  ```

  **Commit**: YES | Message: `feat(auth): add github models oauth and token storage` | Files: [settings auth + ai layer]

- [x] 14. Synthesize mode (select sets + optional theme + AI merge → TSV → DB)

  **What to do**:
  - Page with search bar to search existing sets.
  - Add selected sets list.
  - Optional Theme input.
  - On Create:
    - Build prompt including selected sets rendered as TSV.
    - Ask model to output TSV only, no extra text.
    - Parse TSV strictly; if parse fails, show error + “copy raw output” for debugging.
    - Persist as new set; redirect.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: none | Blocked By: 12,10,11

  **Acceptance Criteria**:
  - [ ] Synthesize produces a valid set and redirects.

  **QA Scenarios**:
  ```
  Scenario: Synthesize with theme
    Tool: Playwright
    Steps: Create 2 small sets -> Synthesize -> select both -> theme "Biology" -> Create
    Expected: New set created; terms non-empty
    Evidence: .sisyphus/evidence/task-14-synthesize.md
  ```

  **Commit**: YES | Message: `feat(synthesize): add themed merge via ai` | Files: [synthesize page + prompts + parsing]

- [x] 15. Generate mode (file picker + hybrid ingestion + study guide markdown + TSV set)

  **What to do**:
  - Page with “Open Files” button.
  - Allow PDFs and images; enforce cap (10 pages total across PDFs; 10 images).
  - Hybrid ingestion:
    - Try extract text from PDFs.
    - For scanned PDFs/no text: rasterize pages to images.
  - Prompt AI to return:
    - Study guide in Markdown
    - TSV set output (strict)
    - Use a clearly delimited format, e.g. two fenced blocks: ```study_guide_md``` and ```flashcards_tsv```
  - Parse outputs, persist:
    - new flashcard set
    - linked study guide markdown
  - Redirect to set page (and provide link to study guide view).

  **Must NOT do**: Attempt unlimited pages; silently drop pages.

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: none | Blocked By: 12,10,11

  **Acceptance Criteria**:
  - [ ] Generate creates both set and study guide; persists after restart.

  **QA Scenarios**:
  ```
  Scenario: Generate with small PDF
    Tool: Playwright
    Steps: Generate -> Open Files -> select 1 PDF (<=10 pages) -> Create
    Expected: New set created; study guide markdown view available
    Evidence: .sisyphus/evidence/task-15-generate.md

  Scenario: Over-limit
    Tool: Playwright
    Steps: Select PDF >10 pages
    Expected: App blocks and asks user to trim
    Evidence: .sisyphus/evidence/task-15-generate-limit.md
  ```

  **Commit**: YES | Message: `feat(generate): add file ingestion and ai-generated guide+set` | Files: [generate page + parsing + db]

- [x] 16. Chat mode (session-only, prefer-grounded, streaming UI)

  **What to do**:
  - Chat UI with user messages on right, AI responses on left.
  - Provide set context in system prompt; instruct “prefer grounded”.
  - Implement streaming responses via AI SDK.
  - Do not persist chat history; clear on leave.
  - Enforce gating: require default model.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: none | Blocked By: 12,10

  **Acceptance Criteria**:
  - [ ] Streaming responses render incrementally.

  **QA Scenarios**:
  ```
  Scenario: Grounded question
    Tool: Playwright
    Steps: Open Chat for a set -> ask about a term from set
    Expected: Response references set content
    Evidence: .sisyphus/evidence/task-16-chat-grounded.md
  ```

  **Commit**: YES | Message: `feat(chat): add set-grounded streaming chat mode` | Files: [chat ui + prompts]

- [x] 17. Flashcards mode (shuffle, restart, star, results)

  **What to do**:
  - Implement Flashcards mode per spec:
    - Shuffle order
    - Restart resets index and ratio to 0/total
    - Star persists to DB per set/term
  - Track accuracy during a session (correct/incorrect via explicit buttons).
  - When finished: results page showing accuracy + links to other modes or restart.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: 18-19 | Blocked By: 10,4

  **Acceptance Criteria**:
  - [ ] Starred cards remain starred after restart.

  **QA Scenarios**:
  ```
  Scenario: Star persists
    Tool: Playwright
    Steps: Open Flashcards -> star a card -> restart app -> open Flashcards
    Expected: Card shows starred state
    Evidence: .sisyphus/evidence/task-17-star-persist.md
  ```

  **Commit**: YES | Message: `feat(mode): implement flashcards mode with results` | Files: [mode pages/components]

- [x] 18. Learn mode (deterministic Qs + optional AI augmentation toggle)

  **What to do**:
  - Deterministic generation:
    - True/False: show statement from term/definition; randomize truth
    - Multiple choice: correct definition + 3 distractors from same deck
  - Optional hybrid augmentation:
    - If Settings toggle enabled and default model available: ask AI to generate additional questions for the deck (bounded count), but always include deterministic baseline.
  - Track accuracy and show results page like Flashcards.

  **Must NOT do**: Require AI for Learn to function.

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 10,11,12

  **Acceptance Criteria**:
  - [ ] Unit tests validate deterministic question generator (no duplicate answers; stable bounds).

  **QA Scenarios**:
  ```
  Scenario: Learn deterministic run
    Tool: Playwright
    Steps: Open Learn -> answer through deck
    Expected: Results page shows accuracy; no crashes
    Evidence: .sisyphus/evidence/task-18-learn-deterministic.md
  ```

  **Commit**: YES | Message: `feat(mode): implement learn mode with deterministic questions` | Files: [learn mode + tests]

- [x] 19. Match mode (4x4, timer, scoring, results)

  **What to do**:
  - Implement Start button.
  - Choose 8 term-definition pairs at random.
  - Render 16 tiles (8 terms + 8 definitions) randomized.
  - Timer starts on Start; default 60s.
  - Matching logic: select two; if match, keep revealed; else hide.
  - End condition: all matched or timer expires.
  - Results page shows accuracy + time.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 10

  **Acceptance Criteria**:
  - [ ] Grid is randomized each run; scoring is consistent.

  **QA Scenarios**:
  ```
  Scenario: Match completes
    Tool: Playwright
    Steps: Open Match -> Start -> complete matches
    Expected: Results shown; timer stops
    Evidence: .sisyphus/evidence/task-19-match.md
  ```

  **Commit**: YES | Message: `feat(mode): implement match mode with timer` | Files: [match mode]

- [x] 20. Study guide view page (Markdown renderer)

  **What to do**:
  - Add a page/view to render the study guide Markdown linked to a set.
  - Provide navigation from set page.

  **Recommended Agent Profile**:
  - Category: `visual-engineering`
  - Skills: [`/frontend-ui-ux`]

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 15,10

  **Acceptance Criteria**:
  - [ ] Markdown renders correctly (headings, lists, code blocks).

  **QA Scenarios**:
  ```
  Scenario: Open generated study guide
    Tool: WebdriverIO (tauri-driver)
    Steps: Generate set -> open study guide
    Expected: Markdown visible and formatted
    Evidence: .sisyphus/evidence/task-20-guide-view.md
  ```

  **Commit**: YES | Message: `feat(guide): add markdown study guide viewer` | Files: [guide page + renderer]

- [x] 21. Search bar (basic implementation) + set search used by Synthesize

  **What to do**:
  - Implement simple search over set titles/descriptions.
  - Wire navbar search to navigate to results (or filter home list).
  - Ensure Synthesize search bar uses same logic.

  **Recommended Agent Profile**:
  - Category: `unspecified-low`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: none | Blocked By: 4,6

  **Acceptance Criteria**:
  - [ ] Searching for a set title returns it.

  **QA Scenarios**:
  ```
  Scenario: Search finds set
    Tool: WebdriverIO (tauri-driver)
    Steps: Create set titled "Biology" -> search "Bio"
    Expected: Set appears in results
    Evidence: .sisyphus/evidence/task-21-search.md
  ```

  **Commit**: YES | Message: `feat(search): add basic set search` | Files: [search components]

- [x] 22. Documentation: describe each program file’s purpose

  **What to do**:
  - Write a single documentation artifact that enumerates key files/directories and explains purpose.
  - Include: data model, secrets model, AI providers, and how to run dev/build/tests.

  **Recommended Agent Profile**:
  - Category: `writing`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Final verification | Blocked By: 1-21

  **Acceptance Criteria**:
  - [ ] Doc exists and covers every non-trivial program file.

  **QA Scenarios**:
  ```
  Scenario: Documentation completeness
    Tool: Bash
    Steps: Verify doc mentions all top-level dirs and key modules
    Expected: No major module lacks description
    Evidence: .sisyphus/evidence/task-22-doc.md
  ```

  **Commit**: YES | Message: `docs: add file-by-file prototype documentation` | Files: [documentation file]

<!-- Remaining tasks inserted below in batches -->

- [x] 23. Error handling + offline/provider failure UX standardization

  **What to do**:
  - Define a single error taxonomy for AI operations:
    - missing_default_model
    - missing_credentials
    - oauth_not_authenticated
    - provider_rate_limited
    - network_offline
    - provider_error
    - parse_error_tsv
  - Implement a shared UI component/modal for errors with “Go to Settings” when actionable.
  - Ensure Synthesize/Generate/Chat use it consistently.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Final verification | Blocked By: 12,13,14,15,16

  **Acceptance Criteria**:
  - [ ] Simulated offline mode yields friendly error and no crash.

  **QA Scenarios**:
  ```
  Scenario: Offline chat
    Tool: WebdriverIO (tauri-driver)
    Steps: Disable network -> open Chat -> send message
    Expected: network_offline error shown; no stuck spinner
    Evidence: .sisyphus/evidence/task-23-offline.md
  ```

  **Commit**: YES | Message: `feat(ux): standardize ai error handling` | Files: [shared error components]

- [x] 24. Security audit pass (no secret leakage) + logging guardrails

  **What to do**:
  - Ensure no secrets are written to:
    - SQLite
    - localStorage
    - logs
  - Add a “redaction” helper for any debug logging.
  - Validate that Stronghold entries are used for:
    - API keys
    - OAuth tokens
    - password verifier

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Final verification | Blocked By: 5,12,13

  **Acceptance Criteria**:
  - [ ] Grep-based check finds no obvious key patterns stored in repo artifacts.

  **QA Scenarios**:
  ```
  Scenario: Secret leak scan
    Tool: Bash
    Steps: Run project scan for patterns (e.g., 'sk-' 'gho_' 'Bearer ')
    Expected: No secrets found in persisted stores except Stronghold file
    Evidence: .sisyphus/evidence/task-24-secret-scan.md
  ```

  **Commit**: YES | Message: `chore(security): add redaction and secret-leak guardrails` | Files: [helpers + docs]

- [x] 25. Deterministic test mode: mock AI providers + mock OAuth

  **What to do**:
  - Add a `TRACER_TEST_MODE=1` behavior that:
    - Replaces AI provider calls with a local deterministic stub returning fixed TSV/Markdown
    - Replaces OAuth with a “mock token” path
  - Keep one optional live-provider smoke test behind `TRACER_LIVE_AI=1`.
  - Ensure CI uses deterministic mode to satisfy “zero human intervention”.

  **Must NOT do**: Make core app behavior diverge in test mode beyond transport.

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 5 | Blocks: Final verification | Blocked By: 12,13,14,15,16

  **Acceptance Criteria**:
  - [ ] Desktop E2E suite passes without any manual OAuth or network dependency.

  **QA Scenarios**:
  ```
  Scenario: Desktop E2E deterministic
    Tool: Bash
    Steps: TRACER_TEST_MODE=1 bun run test:e2e:desktop
    Expected: All E2E tests pass headlessly (where supported)
    Evidence: .sisyphus/evidence/task-25-e2e-deterministic.md
  ```

  **Commit**: YES | Message: `test(e2e): add deterministic ai/oauth stubs for automation` | Files: [ai layer + auth layer + tests]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> Do NOT auto-proceed after verification.
- [x] F1. Plan Compliance Audit — oracle

  **What to do**:
  - Verify every implemented change maps to a TODO.
  - Verify all “Must NOT Have” guardrails are satisfied.
  - Verify evidence files exist for each task.

  **Recommended Agent Profile**:
  - Category: `oracle`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: completion | Blocked By: all tasks 1-25

  **Acceptance Criteria**:
  - [ ] Oracle approves compliance OR lists concrete violations with file paths.

  **QA Scenarios**:
  ```
  Scenario: Audit plan compliance
    Tool: Bash
    Steps: Review .sisyphus/plans/tracer-prototype.md + produced evidence + git diff (if git present)
    Expected: Written verdict (approve/reject) with specific references
    Evidence: .sisyphus/evidence/f1-plan-compliance.md
  ```

- [x] F2. Code Quality Review — unspecified-high

  **What to do**:
  - Run type checks, lint (if configured), unit tests.
  - Review architecture consistency (db layer, ai layer, secrets).
  - Identify dead code, duplicated logic, and unsafe patterns.

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: completion | Blocked By: all tasks 1-25

  **Acceptance Criteria**:
  - [ ] Review approves quality OR provides prioritized fix list with file paths.

  **QA Scenarios**:
  ```
  Scenario: Run full test suite
    Tool: Bash
    Steps: bun run test:unit && bun run test:e2e:desktop (or available suite)
    Expected: All pass; failures documented
    Evidence: .sisyphus/evidence/f2-tests.md
  ```

- [x] F3. Real Manual QA — unspecified-high (+ webdriverio; optional playwright web-smoke)

  **What to do**:
  - Execute end-to-end smoke flows in deterministic mode:
    - First run -> home -> Basic create -> set page -> export
    - Synthesize -> create -> open set
    - Generate -> create set + guide -> open guide
    - Chat: send message -> get response
    - Modes: Flashcards/Learn/Match complete -> results
    - Settings toggles: dark mode, lock enable/disable, reset

  **Recommended Agent Profile**:
  - Category: `unspecified-high`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: completion | Blocked By: all tasks 1-25

  **Acceptance Criteria**:
  - [ ] All smoke flows pass with evidence; any failures include repro steps.

  **QA Scenarios**:
  ```
  Scenario: Deterministic smoke suite
    Tool: Bash
    Steps: TRACER_TEST_MODE=1 bun run test:e2e:desktop
    Expected: All scenarios pass
    Evidence: .sisyphus/evidence/f3-smoke-desktop.md

  Scenario: Optional web-smoke
    Tool: Bash
    Steps: TRACER_TEST_MODE=1 bun run test:e2e:web
    Expected: Web smoke passes (if configured)
    Evidence: .sisyphus/evidence/f3-smoke-web.md
  ```

- [x] F4. Scope Fidelity Check — deep

  **What to do**:
  - Compare implemented UX against `instruct.md`:
    - Page list and navigation rules
    - Keyboard shortcuts and controls
    - TSV export format
    - Mode completeness
  - Identify deviations as “must fix” vs “acceptable prototype compromise”.

  **Recommended Agent Profile**:
  - Category: `deep`
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave Final | Blocks: completion | Blocked By: all tasks 1-25

  **Acceptance Criteria**:
  - [ ] Reviewer approves fidelity OR lists concrete deltas with exact spec lines referenced.

  **QA Scenarios**:
  ```
  Scenario: Spec-by-spec review
    Tool: Bash
    Steps: Read instruct.md and verify each major requirement has an implemented path and test/evidence
    Expected: Written checklist with pass/fail per section
    Evidence: .sisyphus/evidence/f4-scope-fidelity.md
  ```

## Commit Strategy
- Prefer small, vertical commits per TODO. Do not commit secrets.

## Success Criteria
- Meets Definition of Done + Final Verification approvals + user “okay”.
