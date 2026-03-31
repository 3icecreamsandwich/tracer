import { test, expect } from '@playwright/test'

test('set page chat: streams mock response and resets on navigation', async ({ page }) => {
  await page.goto('/set/demo?mode=chat')

  await expect(page.getByRole('heading', { name: 'Demo set' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Chat' })).toBeVisible()

  const log = page.getByRole('log')
  const input = page.locator('#chat-input')
  const send = page.getByRole('button', { name: 'Send' })

  await input.fill('What is Term 1?')
  await send.click()

  await expect(log).toContainText('Web preview')
  await expect(log).toContainText('Your message: What is Term 1?')

  await page.goto('/set/demo')
  await expect(page.getByRole('region', { name: 'Chat' })).toHaveCount(0)

  await page.goto('/set/demo?mode=chat')
  await expect(page.getByRole('region', { name: 'Chat' })).toBeVisible()
  await expect(page.getByRole('log')).toContainText('Ask a question')
  await expect(page.getByRole('log')).not.toContainText('Your message: What is Term 1?')
})

test('set page chat: shows offline AI error modal in web preview', async ({ page }) => {
  await page.goto('/set/demo?mode=chat')

  await page.locator('#chat-input').fill('Hello')

  await page.context().setOffline(true)
  await page.getByRole('button', { name: 'Send' }).click()

  await expect(page.getByRole('dialog', { name: 'AI error' })).toContainText('You are offline')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'AI error' })).toHaveCount(0)

  await page.context().setOffline(false)
})
