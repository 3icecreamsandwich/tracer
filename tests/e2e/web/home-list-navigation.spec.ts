import { test, expect } from '@playwright/test'

test('home list rows: set and study guide cards navigate', async ({ page }) => {
  await page.goto('/?q=demo')
  await expect(page.getByRole('heading', { name: 'Sets' })).toBeVisible()

  const setCard = page.getByRole('link', { name: /^Demo set$/ })
  await expect(setCard).toBeVisible()
  await setCard.click()
  await expect(page).not.toHaveURL(/\/unlock(\?|$)/)
  await expect(page).toHaveURL(/\/set\/demo(\?|$)/)

  await page.goBack()

  const guideCard = page.getByRole('link', { name: /^Study guide · Demo set$/ })
  await expect(guideCard).toBeVisible()
  await guideCard.click()
  await expect(page).not.toHaveURL(/\/unlock(\?|$)/)
  await expect(page).toHaveURL(/\/study-guide\/demo(\?|$)/)
})
