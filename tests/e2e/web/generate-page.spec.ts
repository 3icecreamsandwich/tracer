import { test, expect } from '@playwright/test'

test('generate: web preview shows gating banner and disables generate', async ({ page }) => {
  await page.goto('/create/generate')

  await expect(page.getByRole('heading', { name: 'Create · Generate' })).toBeVisible()
  await expect(
    page.getByText('Generate requires the desktop app (Tauri) for vault + database access.')
  ).toBeVisible()

  const generate = page.getByRole('button', { name: 'Generate' })
  await expect(generate).toBeDisabled()

  await expect(page.getByPlaceholder('Generated set…')).toBeVisible()
  await expect(page.getByPlaceholder(/Focus on key definitions/i)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Choose files' })).toBeVisible()
})
