import { test, expect } from '@playwright/test'

test('set page shell: viewer keyboard + export modal', async ({ page }) => {
  await page.goto('/set/demo')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()

  const ratio = page.getByText('0/2')
  await expect(ratio).toBeVisible()
  const viewer = page.getByRole('button', { name: /Term\s*[12]/ })
  await expect(viewer).toBeVisible()
  const first = (await viewer.textContent()) ?? ''
  const firstNum = /Term\s*(\d)/.exec(first)?.[1] ?? null
  expect(['1', '2']).toContain(firstNum)

  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: new RegExp(`Definition\\s*${firstNum}`) })).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(page.getByText('0/2')).toBeVisible()
  const secondViewer = page.getByRole('button', { name: /Term\s*[12]/ })
  await expect(secondViewer).toBeVisible()
  const second = (await secondViewer.textContent()) ?? ''
  const secondNum = /Term\s*(\d)/.exec(second)?.[1] ?? null
  expect(['1', '2']).toContain(secondNum)
  expect(secondNum).not.toBe(firstNum)

  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: new RegExp(`Definition\\s*${secondNum}`) })).toBeVisible()

  await page.keyboard.press('ArrowLeft')
  await expect(page.getByText('0/2')).toBeVisible()
  await expect(page.getByRole('button', { name: new RegExp(`Term\\s*${firstNum}`) })).toBeVisible()

  await page.getByRole('button', { name: 'Export' }).click()
  await expect(page.getByRole('heading', { name: 'Export' })).toBeVisible()

  const exportBox = page.locator('#export-tsv')
  await expect(exportBox).toBeVisible()
  await expect(exportBox).toHaveValue('Term 1\tDefinition 1\nTerm 2\tDefinition 2')

  await page.getByRole('button', { name: 'Copy' }).click()
  await expect(page.locator('body')).toContainText('Copied to clipboard')

  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Export' })).toHaveCount(0)
})
