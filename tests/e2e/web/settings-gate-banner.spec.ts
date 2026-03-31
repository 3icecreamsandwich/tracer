import { test, expect } from '@playwright/test'

test('settings: shows and dismisses missing-default-model banner', async ({ page }) => {
  await page.goto('/settings?reason=missing-default-model&from=%2Fcreate%2Fgenerate')

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Action required')
  await expect(page.getByRole('status')).toContainText('Choose a Default AI Model')

  await page.getByRole('button', { name: 'Dismiss' }).click()
  await expect(page.getByRole('status')).toHaveCount(0)

  await expect(page).toHaveURL(/\/settings(\?|$)/)
  await expect(page).not.toHaveURL(/reason=missing-default-model/)
})
