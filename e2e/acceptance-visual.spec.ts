import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

const SIZES = [
  { width: 1280, height: 800, tag: '1280x800' },
  { width: 1600, height: 900, tag: '1600x900' },
]

function freshGame(update?: (g: GameState) => GameState): GameState {
  const game = newGame('visual-acceptance-seed')
  return update === undefined ? game : update(game)
}

function atLocation(locationId: string, posX: number, posY: number, update?: (g: GameState) => GameState): GameState {
  return freshGame((game) => {
    const located = { ...game, player: { ...game.player, locationId, posX, posY } }
    return update === undefined ? located : update(located)
  })
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Visual acceptance save.'] }
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

const DEATH = { ...newGame('death-fixture'), terminal: true, endingId: 'tragic_death' } as unknown as GameState
const ENDING = { ...newGame('ending-fixture'), terminal: true, endingId: 'forgiven_enemy' } as unknown as GameState

for (const size of SIZES) {
  test.describe(`${size.tag} desktop acceptance`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height })
      mkdirSync(`artifacts/${size.tag}`, { recursive: true })
    })

    test('UX-03 world mode has no outer scroll', async ({ page }) => {
      await openGame(page)
      const metrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }))
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight)
      await page.screenshot({ path: `artifacts/${size.tag}/world.png` })
    })

    test('A-08 journal mode screenshot (world stays mounted behind)', async ({ page }) => {
      await openGame(page)
      await page.getByRole('button', { name: 'Open Journey journal' }).click()
      await expect(page.getByTestId('world-content')).toBeHidden()
      const metrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }))
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight)
      await page.screenshot({ path: `artifacts/${size.tag}/journal.png` })
    })

    test('A-08 combat mode screenshot', async ({ page }) => {
      await openGame(page, atLocation('misty_forest', 4, 1, (game) => ({ ...game, player: { ...game.player, stage: 1, qi: 30 } })))
      await page.getByRole('button', { name: 'Start encounter' }).click()
      await expect(page.getByLabel('Active encounter')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/combat.png` })
    })

    test('A-08 route encounter screenshot', async ({ page }) => {
      await openGame(page, freshGame((game) => ({ ...game, flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true } })))
      await expect(page.getByTestId('route-encounter-screen')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/route-encounter.png` })
    })

    test('A-08 ending screenshot', async ({ page }) => {
      await openGame(page, ENDING)
      await expect(page.locator('.ending-banner')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/ending.png` })
    })

    test('A-08 death screenshot', async ({ page }) => {
      await openGame(page, DEATH)
      await expect(page.locator('.death-screen, .ending-banner')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/death.png` })
    })
  })
}
