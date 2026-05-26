import { test, expect } from '@playwright/test'

test('navbar search: shows dropdown results without changing the page query', async ({ page }) => {
  await page.goto('/settings')

  const search = page.getByPlaceholder('Search sets…')
  await expect(search).toBeVisible()

  await search.click()
  await expect(page.getByRole('listbox', { name: 'Search results' })).toBeVisible()
  await expect(page.getByRole('option', { name: /Demo set/ })).toBeVisible()

  await search.fill('demo')
  await page.waitForTimeout(600)

  await expect(page).toHaveURL(/\/settings(?:[?#]|$)/)
  await expect(page.getByRole('option', { name: /Demo set/ })).toBeVisible()
})
