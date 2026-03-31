import assert from 'node:assert/strict'

describe('Tauri app smoke', () => {
  it('opens a window with a non-empty title', async () => {
    await browser.waitUntil(
      async () => {
        const title = await browser.getTitle()
        return typeof title === 'string' && title.length > 0
      },
      { timeout: 60000, timeoutMsg: 'window did not become ready' }
    )

    const title = await browser.getTitle()
    assert.equal(typeof title, 'string')
    assert.ok(title.length > 0)
  })
})
