import { test, expect } from '@playwright/test'

test('set page flashcards: tracks correct/incorrect, shows results, restarts', async ({ page }) => {
  await page.goto('/set/demo?mode=flashcards')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Flashcards' })).toBeVisible()

  await expect(page.getByText('0/2')).toBeVisible()

  const viewer = page.getByRole('button', { name: /Term\s*\d/ })
  await expect(viewer).toBeVisible()
  const firstCard = await viewer.textContent()

  await page.getByRole('button', { name: 'Got it', exact: true }).click()
  await expect(page.getByText('1/2')).toBeVisible()

  await expect(viewer).toBeVisible()
  const secondCard = await viewer.textContent()
  expect(secondCard).not.toBeNull()
  expect(secondCard).not.toBe(firstCard)

  await page.getByRole('button', { name: 'Missed it', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  await expect(page.locator('body')).toContainText('Accuracy:')

  await page.getByRole('button', { name: 'Restart', exact: true }).first().click()
  await expect(page.getByText('0/2')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Results' })).toHaveCount(0)
})
