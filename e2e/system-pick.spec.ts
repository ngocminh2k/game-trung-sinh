import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  const game = newGame('system-pick-e2e')
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['System E2E run.'] }
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
}

async function openStory(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  await page.getByRole('button', { name: 'Talk' }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

async function savedGame(page: Page): Promise<GameState> {
  return await page.evaluate((slotsKey) => JSON.parse(window.localStorage.getItem(slotsKey) ?? '{}')['1'].session.game, SLOTS_KEY)
}

test('selects Battle System, turns in its first quest, and leaves the story scene unchanged', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    inventory: { ...game.inventory, beast_fang: 1 },
  })))
  await expect(page.getByTestId('narration-panel')).toContainText('This Life Opens Its Eyes')

  await page.getByRole('button', { name: /Accept the host contract, but keep/i }).click()
  await expect(page.getByTestId('narration-panel')).toContainText('Ten Systems Apply for the Job')
  await page.getByRole('button', { name: /Battle System — it rewards/i }).click()
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  await expect(page.getByTestId('system-panel')).toContainText('【Battle System】')

  const sceneBeforeQuest = (await savedGame(page)).flags.story_scene
  await page.getByTestId('system-panel').getByRole('button', { name: 'Accept quest' }).first().click()
  await expect(page.getByTestId('system-panel').getByRole('button', { name: 'Turn in' }).first()).toBeEnabled()
  const beforeTurnIn = await savedGame(page)

  await page.getByTestId('system-panel').getByRole('button', { name: 'Turn in' }).first().click()
  await expect(page.getByTestId('system-panel')).toContainText('Locked')

  const afterTurnIn = await savedGame(page)
  expect(afterTurnIn.quests.q_sys_battle_01?.status).toBe('completed')
  expect(afterTurnIn.player.gold).toBe(beforeTurnIn.player.gold + 45)
  expect(afterTurnIn.player.spiritStones).toBe((beforeTurnIn.player.spiritStones ?? 0) + 1)
  expect(afterTurnIn.flags.story_scene).toBe(sceneBeforeQuest)

  await openStory(page)
  await expect(page.getByTestId('narration-panel')).not.toContainText('Ten Systems Apply for the Job')
  await expect(page.getByRole('button', { name: /Battle System — it rewards/i })).toHaveCount(0)
})

test('rootless boot path never renders the System panel', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('narration-panel')).toContainText('This Life Opens Its Eyes')

  await page.getByRole('button', { name: /Refuse activation/i }).click()
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  await expect(page.getByTestId('system-panel')).toHaveCount(0)
  expect((await savedGame(page)).flags.system_refused).toBe(true)
})
