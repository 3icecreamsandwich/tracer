import { test, expect } from '@playwright/test'

function isRevealedTileText(text: string) {
  const t = text.replace(/\s+/g, ' ').trim()
  return t !== 'Tile'
}

test('set page match: completes and shows results', async ({ page }) => {
  await page.goto('/set/demo?mode=match&seed=1')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Match' })).toBeVisible()

  await page.getByRole('button', { name: 'Start', exact: true }).click()

  const tiles = page.getByRole('button', { name: /Tile/ })
  await expect(tiles).toHaveCount(4)

  const resultsHeading = page.getByRole('heading', { name: 'Results' })

  const revealedText = async (idx: number) => (await tiles.nth(idx).textContent()) ?? ''

  const unmatched = new Set([0, 1, 2, 3])
  while (unmatched.size > 0) {
    if (await resultsHeading.isVisible()) break
    if ((await tiles.count()) === 0) break

    const list = [...unmatched]
    const i = list[0]!
    let matched = false

    for (let k = 1; k < list.length; k += 1) {
      if (await resultsHeading.isVisible()) {
        unmatched.clear()
        matched = true
        break
      }

      const j = list[k]!
      await tiles.nth(i).click()
      await tiles.nth(j).click()

      const finished = await expect(resultsHeading).toBeVisible({ timeout: 250 }).then(
        () => true,
        () => false
      )
      if (finished) {
        unmatched.clear()
        matched = true
        break
      }

      await page.waitForTimeout(800)

      if ((await tiles.count()) === 0) {
        unmatched.clear()
        matched = true
        break
      }

      const a = await revealedText(i)
      const b = await revealedText(j)
      if (isRevealedTileText(a) && isRevealedTileText(b)) {
        unmatched.delete(i)
        unmatched.delete(j)
        matched = true
        break
      }
    }

    expect(matched).toBe(true)
  }

  await expect(resultsHeading).toBeVisible()
  await expect(page.locator('body')).toContainText('Accuracy:')
  await expect(page.locator('body')).toContainText('Matched: 2/2')
  await expect(page.locator('body')).toContainText('Time:')
})

test('set page match: timer timeout shows results', async ({ page }) => {
  await page.addInitScript(() => {
    const realNow = Date.now.bind(Date)
    ;(window as any).__matchClockOffsetMs = 0
    Date.now = () => realNow() + Number((window as any).__matchClockOffsetMs ?? 0)
  })

  await page.goto('/set/demo?mode=match&seed=1')
  await page.getByRole('button', { name: 'Start', exact: true }).click()

  await page.evaluate(() => {
    ;(window as any).__matchClockOffsetMs = 61_000
  })

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.locator('body')).toContainText('Time:')
  await expect(page.locator('body')).toContainText('0s remaining')
})
