import { mkdirSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

const SIZES = [
  { width: 1280, height: 800, tag: '1280x800' },
  { width: 1600, height: 900, tag: '1600x900' },
]

function freshGame(update?: (g: GameState) => GameState): GameState {
  // Sessions are saved post-boot: the fixture completes the two-step System
  // selection so the loaded slot opens in exploration, not the story scene.
  let game = applyAction(newGame('visual-acceptance-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
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
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

const DEATH = { ...newGame('death-fixture'), terminal: true, endingId: 'tragic_death' } as unknown as GameState
const ENDING = { ...newGame('ending-fixture'), terminal: true, endingId: 'forgiven_enemy' } as unknown as GameState

for (const size of SIZES) {
  test.describe(`${size.tag} desktop acceptance`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height })
      mkdirSync(`artifacts/${size.tag}`, { recursive: true })
    })

    test('UX-03 world mode keeps the 45/55 map and system reading surface in bounds', async ({ page }) => {
      await openGame(page, freshGame((game) => ({ ...game, systemId: 'sys_battle' })))
      const metrics = await page.evaluate(() => {
        const world = document.querySelector<HTMLElement>('.world-content .game-grid')
        const map = document.querySelector<HTMLElement>('.world-content .map-panel')
        const hud = document.querySelector<HTMLElement>('.world-content .hud-panel')
        const system = document.querySelector<HTMLElement>('.world-content .system-panel')
        const stats = document.querySelector<HTMLElement>('.world-content .stats-card')
        const icons = [...document.querySelectorAll<HTMLElement>('.map-exit-icon')]
        if (world === null || map === null || hud === null || system === null || stats === null) throw new Error('World layout missing')
        const worldBox = world.getBoundingClientRect()
        const mapBox = map.getBoundingClientRect()
        const hudBox = hud.getBoundingClientRect()
        const systemBox = system.getBoundingClientRect()
        const statsBox = stats.getBoundingClientRect()
        return {
          scrollHeight: document.documentElement.scrollHeight,
          innerHeight: window.innerHeight,
          mapRatio: mapBox.width / worldBox.width,
          hudRatio: hudBox.width / worldBox.width,
          panelsOverlap: mapBox.right > hudBox.left,
          systemAndStatsShareRow: Math.abs(systemBox.top - statsBox.top) < 2,
          iconsInBounds: icons.length > 0 && icons.every((icon) => {
            const box = icon.getBoundingClientRect()
            return box.left >= mapBox.left && box.right <= mapBox.right && box.top >= mapBox.top && box.bottom <= mapBox.bottom
          }),
        }
      })
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight)
      expect(metrics.mapRatio).toBeGreaterThan(.42)
      expect(metrics.mapRatio).toBeLessThan(.48)
      expect(metrics.hudRatio).toBeGreaterThan(.52)
      expect(metrics.hudRatio).toBeLessThan(.58)
      expect(metrics.panelsOverlap).toBe(false)
      expect(metrics.systemAndStatsShareRow).toBe(true)
      expect(metrics.iconsInBounds).toBe(true)
      await page.screenshot({ path: `artifacts/${size.tag}/world.png` })
    })

    test('A-08 journal mode screenshot restores focus to its launcher', async ({ page }) => {
      await openGame(page)
      const launcher = page.getByRole('button', { name: 'Open Journey journal' })
      await launcher.click()
      await expect(page.getByTestId('world-content')).toBeHidden()
      await page.getByRole('button', { name: '← Back to world Esc' }).click()
      await expect(page.getByTestId('world-content')).toBeVisible()
      await expect(launcher).toBeFocused()
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
