# Task 24 — Secret leakage scan evidence

Date: 2026-03-30

## Summary

- No app-authored `localStorage`/`sessionStorage` usage in `src/**`.
- GitHub Models request uses `Authorization: Bearer ${token}` (expected), and error/UX surfaces now redact token-like strings.
- `sk-…` occurrences in app code are placeholders in Settings inputs (not stored values).

## Pattern scans (source-focused)

### `Bearer `

Matches in `src/**`:

- `src/composables/ai/github-models.ts:23` — `Authorization: \`Bearer ${token}\``
- `src/composables/security/redact.ts` — redaction regex for Bearer tokens

### `sk-`

Matches in `pages/settings.vue` (placeholders only):

- `pages/settings.vue:146` — `placeholder="sk-…"`
- `pages/settings.vue:160` — `placeholder="sk-ant-…"`

### `gho_`

- No matches in `src/**`.

### `localStorage` / `sessionStorage`

- `src/**`: no matches
- `pages/settings.vue:607` contains a comment stating we avoid storing plaintext secrets in SQLite/localStorage.

## Notes

- This scan intentionally avoids `node_modules/**` and `dist/**` because they contain third-party and built output strings unrelated to app secret handling.
