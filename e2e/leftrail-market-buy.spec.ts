// Rail Chợ: the left rail's market tab used to be three passive price read-outs.
// It now lists real wares, so the whole purchase has to be playable from the
// rail alone — one click on a Mua button, and the bag changes. 1280x800, where
// the rail is the proto shell's own surface (no journal involved).
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

function marketGame(): GameState {
  // Post-prologue, standing in Chợ Tụ Vân with coin. savedAt = now keeps the
  // offline-meditation catch-up out of the fixture.
  const game = applyAction(newGame('leftrail-market-e2e'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  return { ...game, player: { ...game.player, locationId: 'market', gold: 500, silver: 0 } }
}

async function openGame(page: Page, game: GameState): Promise<void> {
  const slot = { slotId: 1, savedAt: Date.now(), session: { game, locale: 'vi', chronicle: ['Rail market purchase.'] } }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

const goldOf = async (page: Page): Promise<number> => {
  const raw = (await page.getByTestId('currency-gold').first().textContent()) ?? ''
  const match = raw.match(/(\d[\d,]*)/)
  return match === null ? -1 : Number(match[1].replace(/,/g, ''))
}

const charmSlots = (page: Page) => page.locator('.proto-leftrail [data-item-id="jade_charm"]')

test('buying a jade charm from the rail market tab lands it in the bag', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openGame(page, marketGame())

  // Ngoc boi is on the shelf and is not in the starting bag. The bag tab is the
  // read-out for game.inventory, so it is the delta the test claims to prove.
  await page.locator('.proto-leftrail button[data-tab="items"]').click()
  await expect(charmSlots(page)).toHaveCount(0)

  // One click selects the tab and expands the rail out of its icon strip.
  await page.locator('.proto-leftrail button[data-tab="market"]').click()
  const wares = page.locator('.proto-leftrail .proto-market-row')
  await expect(wares.first()).toBeVisible()

  const charm = wares.filter({ hasText: 'Ngọc bội' })
  await expect(charm.first()).toBeVisible()
  const goldBefore = await goldOf(page)
  expect(goldBefore, 'the fixture must start with coin').toBe(500)

  await charm.locator('button', { hasText: 'Mua' }).click()

  await expect.poll(() => goldOf(page)).toBeLessThan(goldBefore)
  await page.locator('.proto-leftrail button[data-tab="items"]').click()
  await expect(charmSlots(page)).toHaveCount(1)
})
