import { test, expect } from '@playwright/test'

test('set page learn: answers through questions and shows results', async ({ page }) => {
  await page.goto('/set/demo?mode=learn&seed=1')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Learn' })).toBeVisible()

  await expect(page.getByText('0/2')).toBeVisible()

  await page.getByRole('button', { name: 'True', exact: true }).click()
  await expect(page.getByText('1/2')).toBeVisible()

  await page.getByRole('button', { name: 'True', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.locator('body')).toContainText('Accuracy:')

  await page.getByRole('button', { name: 'Restart', exact: true }).first().click()
  await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0)
})
