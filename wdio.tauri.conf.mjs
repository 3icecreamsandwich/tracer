import path from 'node:path'
import process from 'node:process'

const appName = process.platform === 'win32' ? 'tracer.exe' : 'tracer'
const appPath = path.resolve(process.cwd(), 'src-tauri', 'target', 'debug', appName)

export const config = {
  runner: 'local',
  specs: ['./tests/e2e/desktop/specs/**/*.e2e.mjs'],
  maxInstances: 1,
  logLevel: 'info',
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000
  },
  protocol: 'http',
  hostname: '127.0.0.1',
  port: 4444,
  path: '/',
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'wry',
      'tauri:options': {
        application: appPath
      }
    }
  ],
  services: []
}
