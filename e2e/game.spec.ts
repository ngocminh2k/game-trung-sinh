import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('browser-acceptance-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

function atLocation(locationId: string, posX: number, posY: number, update?: (game: GameState) => GameState): GameState {
  return freshGame((game) => {
    const located = { ...game, player: { ...game.player, locationId, posX, posY } }
    return update === undefined ? located : update(located)
  })
}

async function beginPlaying(page: Page): Promise<void> {
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Acceptance save is ready.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await beginPlaying(page)
}

async function openDialogue(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  await page.getByRole('button', { name: 'Talk' }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

test('starts as exploration, travels without losing a day, and persists', async ({ page }) => {
  await openGame(page, freshGame(), 'vi')
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  // Boot consumed two story-choice days; ordinary travel must not cost more.
  await expect(page.locator('.day-chip')).toContainText('Ngày 3')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Local area map' })).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
  await expect(page.locator('.day-chip')).toContainText('Day 3')
  await page.reload()
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await beginPlaying(page)
  await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
})

test('opens dialogue for NPC talk and blocks movement until dismissal', async ({ page }) => {
  await openGame(page)
  const startCell = await page.getByTestId('map-current-cell').textContent()
  await openDialogue(page)
  const close = page.getByRole('button', { name: /Continue/ })
  await expect(close).toBeFocused()
  await expect(page.locator('.topbar')).toHaveAttribute('inert', '')
  await expect(page.locator('.stage-notices')).toHaveAttribute('inert', '')
  await page.locator('#free-command').fill('wait')
  await page.locator('.command-form button').focus()
  await page.keyboard.press('Tab')
  await expect(close).toBeFocused()
  await page.keyboard.press('ArrowDown')
  await expect(page.getByTestId('map-current-cell')).toHaveText(startCell ?? '')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  await expect(page.locator('.hud-panel')).not.toHaveAttribute('inert', '')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByTestId('map-current-cell')).not.toHaveText(startCell ?? '')
})

test('regional map nodes and local exits are visible and usable', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('event-node-village-market-exit')).toBeVisible()
  await expect(page.getByTestId('event-node-village-elder-porch')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('event-node-market-square')).toBeVisible()
  await expect(page.getByTestId('event-node-market-village-exit')).toBeVisible()
})

test('dialogue contains authored choices and accepts a free-form action', async ({ page }) => {
  await openGame(page)
  await openDialogue(page)
  await page.locator('#free-command').fill('become moon emperor immediately')
  await page.locator('.command-form button').click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
  await expect(page.locator('.chronicle li').last()).toContainText('thought slips free')
})

test('Journal is a full mode with an inventory inspector and an explicit return', async ({ page }) => {
  await openGame(page)
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await expect(page.getByTestId('world-content')).toBeHidden()
  await expect(page.getByTestId('inventory-inspector')).toBeVisible()
  await page.getByRole('button', { name: 'Back to world' }).click()
  await expect(page.getByTestId('world-content')).toBeVisible()
})

test('combat presents deliberate technique and defence controls', async ({ page }) => {
  await openGame(page, atLocation('misty_forest', 4, 1, (game) => ({
    ...game,
    player: { ...game.player, stage: 1, qi: 30 },
  })))
  await page.getByRole('button', { name: 'Start encounter' }).click()
  const encounter = page.getByLabel('Active encounter')
  await expect(encounter).toBeVisible()
  await page.getByRole('button', { name: 'Defend' }).click()
  await expect(encounter).toContainText('Enemy health')
})

test('route evidence is carried into the next dialogue', async ({ page }) => {
  await openGame(page, atLocation('village', 2, 2, (game) => ({
    ...game,
    flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true },
  })))
  const routeEncounter = page.getByTestId('route-encounter-screen')
  await expect(routeEncounter).toBeVisible()
  await expect(routeEncounter.getByRole('button')).toHaveCount(2)
  await routeEncounter.getByRole('button').first().click()

  await openDialogue(page)
  await expect(page.getByTestId('route-proof')).toContainText('Public')
  const choices = page.locator('.story-choices .choice-button')
  await expect(choices).toHaveCount(3)
  await expect(choices.nth(2)).toBeEnabled()
  await choices.nth(2).click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
  await expect(page.getByTestId('route-proof')).toBeVisible()
})

const endings: Array<{ name: string; ending: string; flags: GameState['flags']; choice: number }> = [
  { name: 'rootless star', ending: 'Ending: The Rootless Star', flags: { story_scene: 'last_page', story_truth: 3 }, choice: 0 },
  { name: 'kingdom of the rift', ending: 'Ending: Kingdom of the Rift', flags: { story_scene: 'last_page', story_power: 3, story_ha_bound: true }, choice: 0 },
  { name: 'remembering ghosts', ending: 'Ending: City of Remembering Ghosts', flags: { story_scene: 'last_page', story_wealth: 2 }, choice: 0 },
  { name: 'spring for an enemy', ending: 'Ending: Spring for an Enemy', flags: { story_scene: 'last_page', story_mercy: 3, story_khoa_trusted: true }, choice: 1 },
  { name: 'quiet harmony', ending: 'Ending: Harmony Under a Thatched Roof', flags: { story_scene: 'last_page' }, choice: 2 },
]

for (const endingCase of endings) {
  test(`story ending: ${endingCase.name}`, async ({ page }) => {
    await openGame(page, freshGame((game) => ({ ...game, flags: { ...game.flags, ...endingCase.flags } })))
    await openDialogue(page)
    await page.locator('.story-choices .choice-button').nth(endingCase.choice).click()
    await expect(page.locator('.ending-banner')).toContainText(endingCase.ending)
    await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  })
}
