import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

function freshGame() {
  let game = applyAction(newGame('gate04-mobile-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return game
}

async function resumeGame(page: Page) {
  const session = { game: freshGame(), locale: 'vi', chronicle: ['Mobile check.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

test('mobile 375px: topbar wraps, no horizontal overflow, exit button visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 720 })
  await resumeGame(page)

  // header sits inside <main>, so its implicit banner role is scoped away.
  const topbar = page.locator('header.topbar')
  await expect(topbar).toBeVisible()
  // The wrap fix: actions must stack under the brand, not overflow it.
  const brandBox = await page.locator('.brand').boundingBox()
  const exitBox = await page.getByTestId('game-exit-menu').boundingBox()
  expect(brandBox).not.toBeNull()
  expect(exitBox).not.toBeNull()
  expect(exitBox!.y).toBeGreaterThanOrEqual(brandBox!.y + brandBox!.height)
  // No horizontal scroll on the document.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBe(0)

  // The new exit button is present and styled (not bare).
  const exit = page.getByTestId('game-exit-menu')
  await expect(exit).toBeVisible()

  await page.screenshot({ path: 'test-results/issue17-mobile-375.png', fullPage: true })
})

test.use({ hasTouch: true, viewport: { width: 390, height: 844 } })

test('touch viewport: system personas reveal without hover', async ({ page }) => {
  // hasTouch makes Chromium report (hover: none) for CSS — no WebKit needed.
  // iPhone descriptor: isMobile + hasTouch make Chromium report (hover:none),
  // which is the CSS path under test — a JS matchMedia stub would not apply.
  await page.goto('/')
  await page.getByTestId('menu-new-game').click()
  const firstTile = page.getByTestId('system-tile-sys_battle')
  await expect(firstTile).toBeVisible()
  const persona = firstTile.locator('.system-tile-persona')
  // Under (hover: none) the persona is displayed even without hover.
  await expect(persona).toBeVisible()
  await page.screenshot({ path: 'test-results/issue17-newgame-touch.png', fullPage: true })
})
