import { expect, test } from '@playwright/test'

test('home story panel is compact and event rail opens process modal', async ({ page }) => {
  await page.goto('/')

  const storyPanel = page.getByTestId('home-story-panel')
  const eventRail = page.getByTestId('home-event-rail')
  const soundSync = page.getByTestId('home-sound-sync')

  await expect(storyPanel).toBeVisible()
  await expect(eventRail).toBeVisible()
  await expect(page.getByTestId('home-sync-bridge')).toBeVisible()
  await expect(eventRail).toContainText('关键事件时间轴')

  const storyBox = await storyPanel.boundingBox()
  const soundBox = await soundSync.boundingBox()
  expect(storyBox?.width ?? 0).toBeLessThanOrEqual(390)
  expect(soundBox?.y ?? 0).toBeGreaterThan(((storyBox?.y ?? 0) + (storyBox?.height ?? 0)) - 1)

  await soundSync.scrollIntoViewIfNeeded()
  await expect(soundSync).toBeVisible()

  await eventRail.getByRole('button', { name: /巴黎解放/ }).click()

  const modal = page.getByTestId('evidence-modal')
  await expect(modal).toBeVisible()
  await expect(modal).toContainText('转折与交流')
  await expect(modal).toContainText('巴黎解放')
})

test('globe event pin previews on focus and opens the process modal on click', async ({ page }) => {
  await page.goto('/')

  const firstEventPin = page.getByTestId('globe-event-pin').first()
  await expect(firstEventPin).toBeVisible({ timeout: 15000 })

  await firstEventPin.focus()
  await expect(page.getByTestId('event-preview')).toBeVisible()
  await expect(page.getByTestId('evidence-modal')).not.toBeVisible()

  await firstEventPin.click({ force: true })
  await expect(page.getByTestId('evidence-modal')).toBeVisible()
})

test('mobile layout stacks story panel and event timeline without overlap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const storyPanel = page.getByTestId('home-story-panel')
  const eventRail = page.getByTestId('home-event-rail')

  await expect(storyPanel).toBeVisible()
  await expect(eventRail).toBeVisible()

  const storyBox = await storyPanel.boundingBox()
  const railBox = await eventRail.boundingBox()

  expect(storyBox).not.toBeNull()
  expect(railBox).not.toBeNull()
  expect(storyBox!.width).toBeLessThanOrEqual(390)
  expect(railBox!.width).toBeLessThanOrEqual(390)
  expect(storyBox!.y + storyBox!.height).toBeLessThanOrEqual(railBox!.y + 1)
})
