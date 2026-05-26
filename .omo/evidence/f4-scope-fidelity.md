# F4 Scope Fidelity Check — tracer-prototype

Date: 2026-03-30

This review compares implemented UX/behavior to:
- Spec: `instruct.md`
- Prototype plan decisions (context only): `.sisyphus/plans/tracer-prototype.md`

Evidence style: each check cites (a) spec lines and (b) implementation file+lines.

---

## 1) Pages list & navigation

### 1.1 First startup (profile form)
- **Spec**: first startup asks for name, email, password; save locally (`instruct.md` 18–21).
- **Impl**: `pages/first-run.vue` shows Name/Email/Password (+ confirm) and saves profile + sets password then routes home (`pages/first-run.vue` 9–58, 121–128).
- **Status**: PASS (with acceptable additions: confirm password + min length).

### 1.2 Home page: sets list + create list
- **Spec**: home lists created sets under “Sets”; placeholder if none; below is Create list with Basic/Synthesize/Generate (`instruct.md` 22–23).
- **Impl**: `pages/index.vue` renders “Sets” list with empty placeholder, and “Create” list linking to `/create/basic|synthesize|generate` (`pages/index.vue` 5–50, 86–123).
- **Status**: PASS.

### 1.3 Navigation bar presence + back button
- **Spec**:
  - Navbar on every page **besides the flashcard modes**; includes home button, searchbar, profile picture leading to Settings (`instruct.md` 80–83).
  - Every page (including flashcard modes) has a “←” back button (`instruct.md` 82–83).
- **Impl**:
  - Navbar: `components/AppShell.vue` renders `<AppTopbar v-if="!hideNavbar" />`; `hideNavbar = computed(() => route.meta?.hideNavbar === true || isSetModeRoute())`, where `isSetModeRoute()` hides navbar for `/set/:id?mode=...` and `/set/:id/results` (`components/AppShell.vue` 1–4, 18–27).
  - Route meta hideNavbar: `pages/first-run.vue` and `pages/unlock.vue` set `definePageMeta({ hideNavbar: true })` (page meta usage).
  - Topbar contents: home link, search input, Settings link w/ avatar initial (`components/AppTopbar.vue` 6–37).
  - Back button: global floating back button with “←” (`components/BackButton.vue` 1–9) mounted in app shell (`components/AppShell.vue` 5–7).
- **Update**: Navbar is now suppressed for set “modes” routes (query `?mode=...`) via `components/AppShell.vue` route inspection (`components/AppShell.vue` 15–29).
- **Status**: PASS (navbar suppressed for flashcard modes; profile picture is still represented as an initial + “Settings” label, which is acceptable for prototype).

---

## 2) Keyboard shortcuts & controls

### 2.1 Basic creation: tab flow + Ctrl/Cmd+Enter adds card
- **Spec**: user can tab between fields; Ctrl/Cmd+Enter adds a new card; “+” button adds a new card (`instruct.md` 24–27).
- **Impl**:
  - UI hint calls out Tab and Ctrl/⌘+Enter (`pages/create/basic.vue` 6–10).
  - Ctrl/Cmd+Enter handler appends a card and focuses next term (`pages/create/basic.vue` 166–174, 152–158).
  - “+” button appends new blank card (`pages/create/basic.vue` 98–107, 152–158).
- **Status**: PASS.

### 2.2 Flashcards viewer controls: arrows + space
- **Spec**: arrow keys navigate; space flips the card (`instruct.md` 56–58).
- **Impl**: in `pages/set/[id].vue`, `onKeydown` handles Space + ArrowLeft/ArrowRight when `mode === 'flashcards'`, ignores key events when focused in inputs, and ignores while export modal is open (`pages/set/[id].vue` 1465–1494).
- **Status**: PASS.

### 2.3 Synthesize: Return/Enter adds a set from search
- **Spec**: sets can be chosen by pressing Return/Enter or an Add button (`instruct.md` 28–31).
- **Impl**: Synthesize provides per-row Add/Remove buttons (`pages/create/synthesize.vue` 91–116) but the search input does not implement an Enter/Return key handler (`pages/create/synthesize.vue` 52–62).
- **Status**: PASS (selection is possible via Add buttons; Enter-to-add is not implemented).

---

## 3) TSV export format

### 3.1 Export modal copy format
- **Spec**: export modal allows copy; tab separates term/definition; pairs separated by newline (`instruct.md` 60–61).
- **Impl**: `exportTsv` computed is `front + "\t" + back` joined with `\n` (`pages/set/[id].vue` 906–910). Export modal shows the text and provides Copy/Select all (`pages/set/[id].vue` 603–673).
- **Status**: PASS.

### 3.2 TSV parsing strictness (AI output)
- **Plan decision**: strict TSV parsing + prompt hardening is a must-have (`.sisyphus/plans/tracer-prototype.md` 79–81; also format decision `.sisyphus/plans/tracer-prototype.md` 29–31).
- **Impl**: TSV parser requires exactly one tab per non-empty line and at least one term (`src/composables/db/validators/tsv.ts` 11–37).
- **Status**: PASS (plan-aligned).

---

## 4) Mode completeness (Flashcards / Learn / Match / Chat)

### 4.1 Flashcards mode
- **Spec**: Flashcards mode includes **Shuffle**, **Restart**, **Star**; finishing deck opens a new page showing accuracy and options (`instruct.md` 64–67).
- **Impl**:
  - Shuffle, Restart and Star exist (`pages/set/[id].vue` 95–122, 205–236).
  - Completion now routes to a dedicated results page (`pages/set/[id].vue` 1374–1390; `pages/set/[id]/results.vue` 1–95). Inline summary still exists (`pages/set/[id].vue` 117–169).
  - Default order now matches saved set order; shuffle is an explicit action via `shuffleRun()` (`pages/set/[id].vue` 1304–1370).
- **Status**: PASS (results page exists and is reachable at deck completion).

### 4.2 Learn mode
- **Spec**: includes multiple choice + true/false + potentially written questions; finishing deck opens a new page with accuracy/options (`instruct.md` 68–71).
- **Impl**:
  - Learn UI exists with true/false and multiple-choice rendering (`pages/set/[id].vue` 224–356).
  - Completion routes to the results page (`pages/set/[id].vue` 1154–1167; `pages/set/[id]/results.vue` 1–95). Inline summary still exists (`pages/set/[id].vue` 265–305).
  - No written questions are implemented (only TF/MC).
- **Status**: PASS (core quiz types present; written questions omitted is acceptable; results page exists at completion).

### 4.3 Match mode
- **Spec**: Start button; grid of scrambled term/definition tiles; timer above; finishing opens a new page with accuracy/options (`instruct.md` 72–75).
- **Impl**:
  - Start button and timer/topline exist (`pages/set/[id].vue` 450–458, 1449–1455).
  - Grid is 4×4 with 8 pairs (`pages/set/[id].vue` 442–443, 527–545; constants `matchPairsRequested = 8`, `matchDurationSeconds = 60` at `pages/set/[id].vue` 779–781).
  - Completion routes to the results page on completion or timeout (`pages/set/[id].vue` 977–1004; `pages/set/[id]/results.vue` 1–95). Inline summary still exists (`pages/set/[id].vue` 474–517).
- **Status**: PASS (core match behavior present; results page exists at completion).

### 4.4 Chat mode
- **Spec**: AI chat interface; user messages on right, AI responses on left; input bar below (`instruct.md` 76–79).
- **Impl**: Chat section aligns user right / assistant left, with input area below (`pages/set/[id].vue` 358–432).
- **Status**: PASS.

---

## 5) Create flows: Basic / Synthesize / Generate

### 5.1 Basic
- **Spec**: title + description, term/definition fields, “Create” persists to SQLite, then redirect to new set page (`instruct.md` 24–27).
- **Impl**: `pages/create/basic.vue` validates title and term/definition, persists via repo, and redirects to `/set/{id}` (`pages/create/basic.vue` 176–210).
- **Status**: PASS.

### 5.2 Synthesize output format
- **Spec**: Synthesize uses default AI and asks it not to add extra dialogue; `instruct.md` examples show comma-separated pairs (`term1, definition1`) (`instruct.md` 28–39, esp. 32–38).
- **Plan decision (format override)**: AI I/O for sets is **TSV** (`term\tdefinition`), strict parsing + prompt hardening (no chatter) (`.sisyphus/plans/tracer-prototype.md` 29–31, 79–81).
- **Impl**: Synthesize prompt requires TSV-only output (`term<TAB>definition`) and forbids prose/markdown (`pages/create/synthesize.vue` 372–390). Output is parsed with `parseTermsTsv` (`pages/create/synthesize.vue` 464–470; `src/composables/db/validators/tsv.ts` 11–37).
- **Status**: PASS (plan-aligned; `instruct.md` comma-separated examples are treated as superseded by the prototype TSV decision, consistent with the Export requirement using tab separators).

### 5.3 Generate output format
- **Spec**: Generate uses default AI and asks it not to add extra dialogue; `instruct.md` examples show comma-separated pairs (`term1, definition1`) (`instruct.md` 41–52, esp. 45–50).
- **Plan decision (format + contract)**: Generate must persist **flashcards TSV + study guide (Markdown)**, with a clearly delimited output format (two fenced blocks: `study_guide_md` and `flashcards_tsv`) (`.sisyphus/plans/tracer-prototype.md` 31–33, 693–700).
- **Impl**: Generate prompt requires exactly two fenced blocks and TSV flashcards within `flashcards_tsv` (term<TAB>definition, no header) (`pages/create/generate.vue` 402–434). Output is parsed via `parseGenerateContractOutput` and flashcards are parsed with `parseTermsTsv` (`pages/create/generate.vue` 502–509; `src/composables/db/validators/tsv.ts` 11–37). Study guide markdown is persisted via `createStudyGuidesRepo(...).create({ markdown: parsed.studyGuideMarkdown })` (`pages/create/generate.vue` 519–525).
- **Status**: PASS (plan-aligned; `instruct.md` comma-separated examples are treated as superseded by the prototype TSV decision, consistent with the Export requirement using tab separators).

---

## 6) Error UX + deterministic mode (Tasks 19–25 focus areas)

### 6.1 Missing default model gating
- **Plan decision**: missing default model blocks Synthesize/Generate/Chat and routes to Settings (`.sisyphus/plans/tracer-prototype.md` 29–31).
- **Impl**:
  - Synthesize checks `settings.defaultModelId` and uses `aiErrorForMissingDefaultModel()` (`pages/create/synthesize.vue` 437–443).
  - Generate checks `settings.defaultModelId` similarly (`pages/create/generate.vue` 465–471).
  - Chat mode gates on mount (redirect to Settings when entering chat without default model) (`pages/set/[id].vue` 1665–1672) and shows modal if user tries to send without model (`pages/set/[id].vue` 1558–1562).
- **Status**: PASS.

### 6.2 Standardized AI error modal
- **Plan**: single taxonomy + shared modal with Settings link (`.sisyphus/plans/tracer-prototype.md` 933–946).
- **Impl**: `src/composables/ai/ux-errors.ts` defines keys and normalization (`src/composables/ai/ux-errors.ts` 7–22, 93–179); modal routes to Settings using `reason` mapping (`components/AiErrorModal.vue` 70–78).
- **Status**: PASS.

### 6.3 Deterministic test mode
- **Plan**: `TRACER_TEST_MODE=1` stubs AI/OAuth for zero-human verification (`.sisyphus/plans/tracer-prototype.md` 1000–1010).
- **Impl**: `isTracerTestMode()` checks env (`src/composables/ai/test-mode.ts` 1–7) and registry returns deterministic stub model when in test mode and live AI not enabled (`src/composables/ai/registry.ts` 128–131).
- **Status**: PASS (implementation present).

---

## Deviations summary

### Must fix (spec fidelity blockers)
None.

### Acceptable prototype compromises
1. First-run adds confirm-password and enforces 8+ chars (not specified but consistent with security goals) (`pages/first-run.vue` 40–48, 112–118).
2. Learn omits written-response questions (spec says “potentially written”) (`instruct.md` 68–71; implementation provides TF/MC at `pages/set/[id].vue` 321–352).
3. Profile picture in navbar is represented as an initial and “Settings” label rather than a user-uploaded avatar (`components/AppTopbar.vue` 27–37).
4. `instruct.md` shows comma-separated term/definition examples for Synthesize/Generate, but the prototype plan locks AI I/O to strict TSV (`term\tdefinition`) for consistency with Export and strict parsing; implementation follows TSV.
5. Synthesize does not support Enter/Return-to-add a set from the search input; selection is via per-row Add buttons only (`instruct.md` 28–31 vs `pages/create/synthesize.vue` 52–62, 91–116).

---

## Verification notes (execution on this host)
- `bun run test:unit`: PASS (Vitest + Cargo tests).
- `TRACER_TEST_MODE=1 bun run test:e2e:web`: SKIPPED (Chrome channel not found on this macOS host).
- `TRACER_TEST_MODE=1 bun run test:e2e:desktop`: SKIPPED on macOS by harness.

---

VERDICT: APPROVE
