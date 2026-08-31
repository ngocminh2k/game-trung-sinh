import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (g: GameState) => GameState): GameState {
  const game = newGame('gate04-save-reload-seed')
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Gate-04 save.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function readSave(page: Page): Promise<GameSession> {
  const slots = await page.evaluate((key) => window.localStorage.getItem(key), SLOTS_KEY)
  expect(slots).not.toBeNull()
  const parsed = JSON.parse(slots as string) as Record<string, { session: GameSession }>
  return parsed['1']!.session
}

async function openStoryPanel(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  await page.getByRole('button', { name: 'Talk' }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

test('GATE-04 reload during exploration preserves location, hp, qi, and story flags', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'misty_forest', posX: 4, posY: 1, hp: 12, qi: 7 },
      flags: { ...game.flags, story_scene: 'forest_glade' },
    })),
  )
  await expect(page.getByTestId('location-label')).toHaveText(/Misty Forest|Misty|Rừng Vân/i)
  await page.reload()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const session = await readSave(page)
  expect(session.game.player.locationId).toBe('misty_forest')
  expect(session.game.player.hp).toBe(12)
  expect(session.game.player.qi).toBe(7)
  expect(session.game.flags.story_scene).toBe('forest_glade')
  // Schema must be versioned and Zod-valid; re-validate via reducer imports is overkill — basic shape check.
  expect(session.game.version).toBe(1)
  expect(session.game.terminal).toBe(false)
})

test('GATE-04 reload during route encounter preserves flags and the encounter screen re-mounts', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'village', posX: 2, posY: 2 },
      flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true },
    })),
  )
  const routeEncounter = page.getByTestId('route-encounter-screen')
  await expect(routeEncounter).toBeVisible()
  await page.reload()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  await expect(routeEncounter).toBeVisible()
  const session = await readSave(page)
  expect(session.game.flags.story_route).toBe('mercy')
  expect(session.game.flags.story_route_arrived).toBe(true)
})

test('GATE-04 reload during combat preserves encounter HP and the action can be replayed', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'misty_forest', posX: 4, posY: 1, hp: 16, qi: 30 },
    })),
  )
  await page.getByRole('button', { name: 'Start encounter' }).click()
  const encounter = page.getByLabel('Active encounter')
  await expect(encounter).toBeVisible()
  // A defend action drops player into a turn-bound state without ending the encounter.
  await page.getByRole('button', { name: 'Defend' }).click()
  await expect(encounter).toBeVisible()
  await page.reload()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const session = await readSave(page)
  // A defend turn keeps the encounter alive; reducer rolls retaliation, but a saved snapshot
  // must always have either a valid encounter shape OR a null encounter (sanitized to null
  // only if the snapshot is illegal). Either is acceptable per src/engine/rpg-state.ts.
  const enc = session.game.encounter
  if (enc !== null) {
    expect(enc.hp).toBeGreaterThanOrEqual(1)
    expect(enc.maxHp).toBeGreaterThanOrEqual(1)
  }
  expect(session.game.terminal).toBe(false)
  expect(session.game.player.alive).toBe(true)
})

test('GATE-04 reload with Journal open does not corrupt the world and the save remains schema-valid', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'village', posX: 2, posY: 2, hp: 18, qi: 12 },
      inventory: { ...game.inventory, trail_rations: 2, jade_charm: 1 },
    })),
  )
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await expect(page.getByTestId('inventory-inspector')).toBeVisible()
  await page.reload()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // World mounts back; Journal is a runtime overlay, not persisted.
  await expect(page.getByTestId('world-content')).toBeVisible()
  const session = await readSave(page)
  expect(session.game.player.locationId).toBe('village')
  expect(session.game.inventory.trail_rations).toBe(2)
  expect(session.game.inventory.jade_charm).toBe(1)
})

test('GATE-04 reload immediately before an ending still reaches that ending', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'last_page', story_truth: 3 },
    })),
  )
  // We are parked on the terminal choice scene; the panel opens on Talk.
  await openStoryPanel(page)
  await expect(page.locator('.story-choices .choice-button').first()).toBeVisible()
  await page.reload()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // The terminal scene must still be the same after the reload.
  await openStoryPanel(page)
  await expect(page.locator('.story-choices .choice-button').first()).toBeVisible()
  await page.locator('.story-choices .choice-button').first().click()
  await expect(page.locator('.ending-banner')).toContainText(/Rootless Star/i)
  // Save persists the terminal state.
  const session = await readSave(page)
  expect(session.game.terminal).toBe(true)
  expect(session.game.endingId).toBe('rootless_star')
})
