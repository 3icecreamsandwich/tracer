# Desktop E2E (Tauri) – WebDriver harness

This harness is intended for CI on **Linux + Windows**, using Tauri's WebDriver approach (`tauri-driver` + WebdriverIO).

## Platform notes

- **Linux/Windows**: supported.
- **macOS**: not supported by Tauri WebDriver in practice (no Safari/WebKit WebDriver driver for this workflow). Use `test:e2e:web` (Playwright) as a developer smoke check instead.

For web-smoke, this repo is configured so Playwright is **opt-in** and does **not** auto-download browsers.
Run with:

```bash
TRACER_WEB_E2E=1 bun run test
```

## How it works

1. Build the debug Tauri app binary (or have it already built).
2. Start `tauri-driver` (it exposes a WebDriver endpoint).
3. Run WebdriverIO tests against that endpoint, launching the app via `tauri:options`.

## Running

Prereqs (CI images typically install these):

- `cargo install tauri-driver --locked`
- Linux: install `webkit2gtk-driver`
- Windows: ensure a compatible Edge WebDriver is available on `PATH`

```bash
bun run test:e2e:desktop
```
