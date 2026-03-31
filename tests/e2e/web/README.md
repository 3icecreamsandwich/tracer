# Web E2E (Playwright) – opt-in smoke

This suite is a developer convenience smoke check for the Nuxt web app.

## Opt-in

By default, `bun run test` does **not** run web E2E on macOS to avoid any browser download/install behavior.
To enable web-smoke:

```bash
TRACER_WEB_E2E=1 bun run test
```

Or run it directly:

```bash
bun run test:e2e:web
```

## Browser expectations

This harness does **not** run `playwright install`.
Playwright browser binaries must already be present.

This suite is configured to use a **system-installed browser** via Playwright's `channel`.

- Default: `TRACER_WEB_CHANNEL=chrome`
- Override (example): `TRACER_WEB_CHANNEL=msedge`

If the chosen browser is not installed, Playwright will fail with an executable-not-found error.

If you want to prevent downloads during dependency installation, set:

```bash
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 bun install
```
