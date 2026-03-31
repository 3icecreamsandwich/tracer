# Tracer prototype architecture (file-by-file)

This document enumerates the key files/directories in this prototype and explains what they do.

## Top-level

- `package.json`: Bun scripts for dev/build/tests.
  - `bun run dev`: Nuxt dev server (127.0.0.1:3000).
  - `bun run build`: Nuxt build.
  - `bun run generate`: Nuxt generate into `.output/public`, then copies to `dist/` (used by Tauri build).
  - `bun run tauri:dev`: Desktop dev (runs Tauri; uses `beforeDevCommand` in Tauri config).
  - `bun run tauri:build`: Desktop build/bundle.
  - `bun run test:unit`: `vitest run` (frontend unit tests) + `cargo test` (Rust unit tests).
  - `bun run test`: orchestrated test runner (`tests/run.mjs`): unit tests + E2E depending on platform/env.

- `nuxt.config.ts`: Nuxt config.
  - `ssr: false` (single-page app).
  - Ignores `src-tauri/**` for Nuxt watch/build.

- `tailwind.config.ts` and `assets/css/tailwind.css`: TailwindCSS setup for styling.

- `app.vue`: App entry; mounts the top-level shell and page router content.

## Frontend UI

### Pages (routes)

- `pages/index.vue`: Home page; shows sets/study guides list and entry points for Create modes.
- `pages/first-run.vue`: First startup flow; captures initial profile + sets password verifier (locks app).
- `pages/unlock.vue`: Unlock flow; verifies password / triggers Stronghold unlock.
- `pages/settings.vue`: Settings page; dark mode, default AI selection, provider auth (API keys or OAuth).

- `pages/create/basic.vue`: Manual set creation UI.
- `pages/create/synthesize.vue`: Select existing sets and ask AI to synthesize a new set.
- `pages/create/generate.vue`: Import PDFs/images and ask AI to generate a set + study guide.

- `pages/set/[id].vue`: Flashcard set page; modes (Flashcards/Learn/Match/Chat), export, star terms.
- `pages/study-guide/[setId].vue`: Study guide view tied to a set.

### Components

- `components/AppShell.vue`: Shared layout (top bar + page container).
- `components/AppTopbar.vue`: Top navigation bar (home, search, profile/settings entry).
- `components/BackButton.vue`: Consistent back navigation affordance.
- `components/MarkdownRenderer.vue`: Renders study guide markdown (and any markdown content) safely.

## Data model (SQLite)

This prototype uses SQLite for persistent local storage.

### Schema and migrations

- `src-tauri/migrations/001_core.sql`: The canonical schema migration.
  - `profile`: singleton user profile.
  - `flashcard_sets`: set metadata + `terms_json` containing a JSON array of terms/definitions.
    - `terms_json` is guarded with `CHECK (json_valid(terms_json))`.
  - `starred_terms`: per-set starred terms.
  - `study_guides`: markdown content for a set.
  - `app_settings`: singleton settings row (`id = 1`), including default model selection.

### Typed DB access (frontend)

DB access is implemented as typed repositories so UI code stays strongly typed and avoids ad-hoc SQL.

- `src/composables/db/types.ts`: TypeScript types that mirror the schema (`FlashcardSet`, `Term`, `Profile`, `StudyGuide`, `AppSettings`, etc.).
- `src/composables/db/init.ts`: Creates/returns the SQL client (`useTracerDb()`), using the Tauri SQL plugin.
  - Uses `sqlite:tracer.db` (preloaded via Tauri config).
- `src/composables/db/sql.ts`: Shared SQL helpers/utilities used by repos.
- `src/composables/db/index.ts`: Barrel exports for DB composables.

Repositories:

- `src/composables/db/repos/sets.repo.ts`: CRUD for `flashcard_sets` (including parsing/storing `terms_json`).
- `src/composables/db/repos/study-guides.repo.ts`: CRUD for `study_guides`.
- `src/composables/db/repos/stars.repo.ts`: CRUD for `starred_terms`.
- `src/composables/db/repos/profile.repo.ts`: CRUD for `profile`.
- `src/composables/db/repos/settings.repo.ts`: CRUD for `app_settings` (singleton).
- `src/composables/db/repos/index.ts`: Repo exports.

Validation/parsing:

- `src/composables/db/validators/terms.ts`: Normalization and validation for `Term` objects.
- `src/composables/db/validators/tsv.ts`: TSV import/export parsing.
  - Parser is intentionally strict: each non-empty line must contain exactly one tab (term + definition).
- `src/composables/db/validators/index.ts`: Validator exports.

## Secrets, lock, and Stronghold model

The prototype treats “unlocking the app” as “unlocking access to secrets” (password verifier + provider credentials).

### Rust backend (source of truth)

- `src-tauri/src/security.rs`: Security core.
  - Stronghold vault file lives in the app local data directory as `vault.hold`.
  - A separate salt file `stronghold_salt.txt` is stored alongside the vault.
  - Stores the user’s password verifier (Argon2) and provider credentials/tokens.
  - Optional “startup lock off” uses the OS keychain (via `keyring`) to store an obfuscated derived marker so the app can auto-unlock without prompting.
  - Reset behavior attempts to remove keychain entries, the Stronghold vault, and possible SQLite DB paths.

- `src-tauri/src/lib.rs`: Tauri command wiring.
  - Exposes invoke commands used by the frontend for: lock/unlock, password verify/set, Stronghold get/set, and GitHub OAuth helpers.

- `src-tauri/src/main.rs`: Tauri app entry (bootstraps the Rust side).

### Frontend wrappers

- `src/composables/lock.ts`: Frontend API for locking/unlocking/reset, calling into Tauri commands.
  - Normalizes errors so UI can show consistent messaging.
- `src/composables/lock-session.ts`: Tracks “unlocked in this session” state to avoid repeated prompts.

## AI providers (Vercel AI SDK) + OAuth behavior

AI integration is done on the frontend using Vercel AI SDK providers, with HTTP requests routed through Tauri’s HTTP plugin when running as desktop.

### Provider catalog and registry

- `src/composables/ai/catalog.ts`: Curated list of available providers/models exposed to the UI.
- `src/composables/ai/ids.ts`: Provider/model identifier helpers.
- `src/composables/ai/registry.ts`: Provider registry.
  - Resolves `provider:model` into a Vercel AI SDK model instance.
  - Enforces that the selected provider/model exists in the curated catalog.
- `src/composables/ai/errors.ts`: Centralized error types/helpers for AI flows.

### Transport + credentials

- `src/composables/ai/http.ts`: HTTP transport selection.
  - In Tauri runtime, uses `@tauri-apps/plugin-http` so network requests work consistently in the desktop shell.
- `src/composables/ai/credentials.ts`: Reads/writes provider credentials.
  - In desktop/Tauri, secrets are stored in Stronghold via invoke commands.
  - In web-preview mode (no Tauri runtime), may fall back to in-memory behavior (no persistent secrets).

### OAuth provider behavior (GitHub Models)

GitHub Models uses OAuth instead of an API key. The flow is split between frontend helpers and Rust-side helpers.

- `src/composables/ai/github-oauth.ts`: OAuth helper code.
  - Supports device flow UX (URL + user code) and PKCE helpers.
  - Uses a Tauri “open external URL” command so the system browser is used.

- `src/composables/ai/github-models.ts`: Provider implementation for GitHub Models.
- `src/composables/ai/github-state.ts`: State helpers around GitHub auth/token presence.

On the Rust side:

- `src-tauri/src/lib.rs` exposes commands that support PKCE callback handling (local listener) and token storage in Stronghold.

### AI usage sites

- `src/composables/ai/chat.ts`: Chat prompt + response flow.
- `src/composables/ai/generate-contract.ts`: Prompt contract/format expectations for generation/synthesis.

## Non-AI learning modes

- `src/composables/learn/generator.ts`: Generates learn-mode questions from a set’s terms.
- `src/composables/match/generator.ts`: Generates match-mode prompts/grids.

## Search

- `src/composables/search/set-search.ts`: Shared search logic over set titles/descriptions.
  - Used by navbar search and synthesize selection search.

## Markdown

- `src/composables/markdown/parse.ts`: Markdown parsing/sanitization used by `MarkdownRenderer` and study guides.

## Tauri configuration

- `src-tauri/tauri.conf.json`: Desktop shell configuration.
  - `beforeDevCommand`: `bun run dev`.
  - `beforeBuildCommand`: `bun run generate`.
  - `frontendDist`: `../dist`.
  - SQL plugin preloads `sqlite:tracer.db`.

## Tests

### Unit tests

- `vitest.config.ts`: Vitest config for frontend unit tests.
- `tests/unit/*.test.ts`: Unit tests for DB repos/validators, AI registry/OAuth helpers, and generators.
- Rust unit tests run via `cargo test` as part of `bun run test:unit`.

### E2E tests

- `tests/run.mjs`: Test orchestrator.
  - Always runs unit tests.
  - Desktop E2E is intended for Linux/Windows.
  - Web E2E is an opt-in smoke test on macOS.

- `tests/e2e/web/` (Playwright): web smoke suite.
  - `tests/e2e/web/README.md`: platform/env expectations.
  - Opt-in: `TRACER_WEB_E2E=1 bun run test` or `bun run test:e2e:web`.
  - Uses a system-installed browser via Playwright `channel` (default `TRACER_WEB_CHANNEL=chrome`).
  - Does not run `playwright install`.

- `tests/e2e/desktop/` (WebdriverIO + tauri-driver): desktop suite.
  - `tests/e2e/desktop/README.md`: Linux/Windows intended; macOS not supported in practice.
  - `bun run test:e2e:desktop`.

### Platform caveats (known)

- macOS: Desktop E2E harness is not supported in practice; use web E2E smoke if needed.
- Web E2E requires an installed browser matching `TRACER_WEB_CHANNEL` (defaults to `chrome`).
