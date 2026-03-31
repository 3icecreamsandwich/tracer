import process from 'node:process'
import { spawn } from 'node:child_process'

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit', env: process.env })
    child.on('exit', (code) => resolve(code ?? 1))
  })
}

const unitCode = await run('bun', ['run', 'test:unit'])
if (unitCode !== 0) process.exit(unitCode)

const canRunDesktop = process.platform !== 'darwin'

if (canRunDesktop) {
  const desktopCode = await run('bun', ['run', 'test:e2e:desktop'])
  process.exit(desktopCode)
}

const allowWeb = process.env.TRACER_WEB_E2E === '1'
if (!allowWeb) {
  process.exit(0)
}

const webCode = await run('bun', ['run', 'test:e2e:web'])
process.exit(webCode)
