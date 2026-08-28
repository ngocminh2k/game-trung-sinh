import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SESSION_KEY = 'phe-can-ky:save:v1'

type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  const game = newGame('browser-acceptance-seed')
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
  await page.addInitScript(({ key, value }) => {
    if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, value)
  }, { key: SESSION_KEY, value: JSON.stringify(session) })
  await page.goto('/')
  await beginPlaying(page)
}

test('starts through the loading screen, switches language, travels, and persists', async ({ page }) => {
  await openGame(page, freshGame(), 'vi')
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Local area map' })).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
  await page.reload()
  await beginPlaying(page)
  await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
})

test('regional map nodes and local exits are visible and usable', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('event-node-village-market-exit')).toBeVisible()
  await expect(page.getByTestId('event-node-village-elder')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('event-node-market-square')).toBeVisible()
  await expect(page.getByTestId('event-node-market-village-exit')).toBeVisible()
})

test('story choices and unsupported free text both keep the player in an authored state', async ({ page }) => {
  await openGame(page)
  const chronicle = page.locator('.chronicle li')
  const before = await chronicle.count()
  await page.locator('#free-command').fill('become moon emperor immediately')
  await page.locator('.command-form button').click()
  await expect(chronicle).toHaveCount(before + 1)
  await page.locator('.story-choices .choice-button').first().click()
  await expect(page.locator('.story-choices .choice-button')).toHaveCount(3)
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

test('route evidence is a two-way decision that gates cave and trial choices', async ({ page }) => {
  await openGame(page, atLocation('village', 2, 2, (game) => ({
    ...game,
    flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true },
  })))
  const routeEncounter = page.getByTestId('route-encounter-screen')
  await expect(routeEncounter).toBeVisible()
  await expect(routeEncounter.getByRole('button')).toHaveCount(2)
  await routeEncounter.getByRole('button').first().click()
  await expect(page.getByTestId('route-proof')).toContainText('Public')

  const choices = page.locator('.story-choices .choice-button')
  await choices.nth(0).click()
  await expect(choices.nth(1)).toBeDisabled()
  await expect(choices.nth(2)).toBeEnabled()
  await choices.nth(2).click()
  await expect(choices.nth(0)).toBeEnabled()
  await expect(choices.nth(2)).toBeDisabled()
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
    await page.locator('.story-choices .choice-button').nth(endingCase.choice).click()
    await expect(page.locator('.ending-banner')).toContainText(endingCase.ending)
    await expect(page.locator('#free-command')).toBeDisabled()
  })
}
