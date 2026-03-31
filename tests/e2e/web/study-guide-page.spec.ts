import { test, expect } from '@playwright/test'

test('study guide: navigates from set page and renders markdown blocks', async ({ page }) => {
  await page.goto('/set/demo')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()

  await page.getByRole('link', { name: 'Study guide' }).click()
  await expect(page).toHaveURL(/\/study-guide\//)

  await expect(page.getByRole('heading', { name: 'Study guide', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Demo study guide' })).toBeVisible()

  await expect(page.getByRole('list')).toBeVisible()
  await expect(page.getByRole('listitem').first()).toContainText('Lists render')

  const code = page.locator('pre code')
  await expect(code).toBeVisible()
  await expect(code).toContainText('const demo = true')
})
