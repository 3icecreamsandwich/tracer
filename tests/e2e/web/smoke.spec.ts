import { test, expect } from '@playwright/test'

test('smoke: home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
  await expect(page.locator('body')).not.toContainText('404')
})
