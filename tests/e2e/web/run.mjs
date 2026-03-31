import process from 'node:process'
import { spawn } from 'node:child_process'
import { access } from 'node:fs/promises'

const cmd = process.platform === 'win32' ? 'playwright.cmd' : 'playwright'

function run(args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: process.env })
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

const channel = process.env.TRACER_WEB_CHANNEL ?? 'chrome'

process.env.VITE_TRACER_FORCE_WEB = '1'

if (process.platform === 'darwin' && channel === 'chrome') {
  try {
    await access('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
  } catch {
    console.log('[test:e2e:web] skipped: Google Chrome not found at /Applications/Google Chrome.app (set TRACER_WEB_CHANNEL to another installed channel).')
    process.exit(0)
  }
}

const testCode = await run(['test'])
process.exit(testCode)
