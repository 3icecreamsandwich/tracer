import { spawn } from 'node:child_process'
import process from 'node:process'

const isMac = process.platform === 'darwin'
if (isMac) {
  console.log('[test:e2e:desktop] skipped on macOS (see tests/e2e/desktop/README.md)')
  process.exit(0)
}

const tauriDriverCmd = process.env.TAURI_DRIVER_PATH ?? 'tauri-driver'
const wdioCmd = process.platform === 'win32' ? 'wdio.cmd' : 'wdio'

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', ...opts })
    child.on('exit', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} exited with code ${code}`))
    })
  })
}

await run('bun', ['run', 'tauri', 'build', '--debug', '--no-bundle'])

// Start tauri-driver on default port (4444)
const driver = spawn(tauriDriverCmd, [], {
  stdio: 'inherit',
  env: process.env
})

// Ensure we always shut down the driver
const shutdown = () => {
  if (!driver.killed) driver.kill()
}
process.on('exit', shutdown)
process.on('SIGINT', () => {
  shutdown()
  process.exit(130)
})
process.on('SIGTERM', () => {
  shutdown()
  process.exit(143)
})

try {
  // Give the driver a moment to bind the port
  await new Promise((r) => setTimeout(r, 1000))
  await run(wdioCmd, ['run', './wdio.tauri.conf.mjs'], { env: process.env })
} finally {
  shutdown()
}
