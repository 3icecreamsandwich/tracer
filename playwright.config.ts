import { defineConfig } from '@playwright/test'

const channel = process.env.TRACER_WEB_CHANNEL ?? 'chrome'

export default defineConfig({
  testDir: './tests/e2e/web',
  use: {
    baseURL: 'http://127.0.0.1:3000'
  },
  projects: [
    {
      name: `system-${channel}`,
      use: {
        browserName: 'chromium',
        channel
      }
    }
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  workers: 1,
  retries: 0
})
