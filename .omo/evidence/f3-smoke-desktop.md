## F3 Smoke (Desktop) — WebDriverIO (Tauri) — Deterministic Mode

Date: 2026-03-30
Host: macOS (darwin)

### Command (required)

```bash
TRACER_TEST_MODE=1 bun run test:e2e:desktop
```

### Observed output

```text
$ node ./tests/e2e/desktop/run.mjs
[test:e2e:desktop] skipped on macOS (see tests/e2e/desktop/README.md)
```

### Status

- RESULT: SKIPPED (by harness)

### Skip reason (exact)

The desktop E2E runner explicitly exits early on macOS:

- `tests/e2e/desktop/run.mjs`:
  - `const isMac = process.platform === 'darwin'`
  - if true: logs the skip message and `process.exit(0)`

Repository documentation also states this harness is intended for Linux/Windows CI and not supported on macOS:

- `tests/e2e/desktop/README.md` ("macOS: not supported ... use test:e2e:web as developer smoke")

### Coverage

No desktop smoke flows executed on this host due to the intentional skip.

### Notes

To validate Desktop E2E smoke flows, run the same command on Linux/Windows with `tauri-driver` installed (per `tests/e2e/desktop/README.md`).

### Coverage gaps (impact)

Because the suite did not execute here, this run provides **no evidence** for desktop-only behavior beyond confirming the harness/platform limitation.

### Gate assessment (this host)

This skip is **expected and documented** for macOS, and web smoke is used as the developer/host-available E2E signal (see `.sisyphus/evidence/f3-smoke-web.md`).

External dependency to cover desktop E2E:

- Run `TRACER_TEST_MODE=1 bun run test:e2e:desktop` on **Linux or Windows** with `tauri-driver` installed (per `tests/e2e/desktop/README.md`).

VERDICT: APPROVE
