import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('economy-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame()): Promise<void> {
  const session: GameSession = { game, locale: 'en', chronicle: ['Economy acceptance save.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

async function readCurrency(page: Page, testId: string): Promise<number> {
  const raw = await page.getByTestId(testId).textContent() ?? ''
  const match = raw.match(/(\d[\d,]*)/)
  return match === null ? -1 : Number(match[1].replace(/,/g, ''))
}

test('trading at the market: gold first, silver covers any shortfall', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    player: { ...game.player, locationId: 'market', gold: 11, silver: 400, stage: 2 },
  })))
  // The dock tabs live inside the journal screen — open it first.
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.locator('#dock-tab-market').click()
  await expect(page.getByTestId('currency-exchange')).toBeVisible()

  const silverBefore = await readCurrency(page, 'currency-silver')
  expect(silverBefore).toBe(400)

  // Qi-Gathering Pill costs 30 gold; holding only 11, the shortfall (19 gold =
  // 190 silver) is covered from silver at the authored 10:1 rate.
  const pillRow = page.locator('.shop-list > div').filter({ hasText: 'Qi-Gathering Pill' })
  await pillRow.getByRole('button', { name: 'Buy' }).click()

  await expect(page.getByTestId('currency-gold')).toContainText('0')
  const silverAfter = await readCurrency(page, 'currency-silver')
  expect(silverAfter).toBeLessThan(silverBefore)
  // The bag after trading shows the purchase.
  await expect(page.locator('.market-bag-list')).toContainText('Qi-Gathering Pill')
})

test('currency exchange: 1 spirit stone → 10 gold and 10 silver → 1 gold', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    player: { ...game.player, locationId: 'market', gold: 0, silver: 25, spiritStones: 2, stage: 2 },
  })))
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.locator('#dock-tab-market').click()

  await page.getByRole('button', { name: /Exchange 1 spirit stone → 10 gold/ }).click()
  await expect(page.getByTestId('currency-gold')).toContainText('10')
  await expect(page.getByTestId('currency-spirit-stones')).toContainText('1')

  await page.getByRole('button', { name: /Exchange 10 silver → 1 gold/ }).click()
  await expect(page.getByTestId('currency-gold')).toContainText('11')
  await expect(page.getByTestId('currency-silver')).toContainText('15')
})
