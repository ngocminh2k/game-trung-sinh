import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('sys-notify-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame()): Promise<void> {
  const session: GameSession = { game, locale: 'en', chronicle: ['System notification save.'] }
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

test('accepting and turning in a system quest announces load and exact reward', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    inventory: { ...game.inventory, beast_fang: 3 },
  })))
  await expect(page.getByTestId('system-panel')).toBeVisible()
  await expect(page.getByTestId('system-feed')).toHaveCount(0)

  await page.getByRole('button', { name: /Accept quest/ }).first().click()
  const feed = page.getByTestId('system-feed')
  await expect(feed).toBeVisible()
  await expect(feed).toContainText(/Main quest loaded/)
  await expect(feed).toContainText(/Battle I/)
  await expect(feed).toContainText(/Deliver beast fangs to the System/)
  // The panel shows at most three notification lines.
  expect(await feed.locator('li').count()).toBeLessThanOrEqual(3)

  await page.getByRole('button', { name: /Turn in/i }).first().click()
  await expect(feed).toContainText(/Ding!/)
  await expect(feed).toContainText(/45 gold/)
  await expect(feed).toContainText(/Beast Fang/)
})

test('pressing on the System origin returns the authored data dodge', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    flags: { ...game.flags, story_scene: 'scene_system_doubt' },
  })))

  // Story scenes open through the journal's People tab (Talk reopens the panel).
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  await page.getByRole('button', { name: 'Talk' }).first().click()

  await page.getByRole('button', { name: /Then who wrote you/i }).click()
  await expect(page.getByTestId('system-feed')).toContainText(/Insufficient data to answer/)
})
