import { test, expect } from '@playwright/test'

test('synthesize: web preview shows gating banner and disables create', async ({ page }) => {
  await page.goto('/create/synthesize')

  await expect(page.getByRole('heading', { name: 'Create · Synthesize' })).toBeVisible()
  await expect(
    page.getByText('Synthesize requires the desktop app (Tauri) for vault + database access.')
  ).toBeVisible()

  const create = page.getByRole('button', { name: 'Create' })
  await expect(create).toBeDisabled()

  await expect(page.getByRole('searchbox', { name: 'Search sets' })).toBeVisible()
  await expect(page.getByPlaceholder('Theme…')).toBeVisible()
})
