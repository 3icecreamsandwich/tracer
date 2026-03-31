import { test, expect } from '@playwright/test'

test('navbar search: navigates to home with q query', async ({ page }) => {
  await page.goto('/settings')

  const search = page.getByPlaceholder('Search sets…')
  await expect(search).toBeVisible()

  await search.fill('biology')
  await search.press('Enter')

  await expect(page).toHaveURL(/\/?(\?|$)/)
  await expect(page).toHaveURL(/\bq=biology\b/)
  await expect(page.getByRole('heading', { name: 'Sets' })).toBeVisible()
})
