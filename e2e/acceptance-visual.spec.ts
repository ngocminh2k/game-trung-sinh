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
  const slot = { slotId: 1, savedAt: Date.now(), session }
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

const DEATH = freshGame((g) => ({ ...g, terminal: true, endingId: 'tragic_death', player: { ...g.player, alive: false } }))
const ENDING = freshGame((g) => ({ ...g, terminal: true, endingId: 'forgiven_enemy' }))

for (const size of SIZES) {
  test.describe(`${size.tag} desktop acceptance`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height })
      mkdirSync(`artifacts/${size.tag}`, { recursive: true })
    })

    test('UX-03 world mode keeps the 3-column map | story | hud layout in bounds', async ({ page }) => {
      await openGame(page, freshGame((game) => ({ ...game, systemId: 'sys_battle' })))
      const metrics = await page.evaluate(() => {
        const grid = document.querySelector<HTMLElement>('.proto-grid-main')
        const leftrail = document.querySelector<HTMLElement>('.proto-leftrail')
        const center = document.querySelector<HTMLElement>('.proto-center')
        const map = document.querySelector<HTMLElement>('.proto-map')
        const righthud = document.querySelector<HTMLElement>('.proto-righthud')
        const ticker = document.querySelector<HTMLElement>('.proto-ticker')
        const pins = [...document.querySelectorAll<HTMLElement>('.proto-map .pin')]
        if (grid === null || leftrail === null || center === null || map === null || righthud === null || ticker === null) {
          throw new Error('ProtoShell 3-column layout missing')
        }
        const gridBox = grid.getBoundingClientRect()
        const leftBox = leftrail.getBoundingClientRect()
        const centerBox = center.getBoundingClientRect()
        const mapBox = map.getBoundingClientRect()
        const hudBox = righthud.getBoundingClientRect()
        const tickerBox = ticker.getBoundingClientRect()
        return {
          scrollHeight: document.documentElement.scrollHeight,
          innerHeight: window.innerHeight,
          gridWidth: gridBox.width,
          leftWidth: leftBox.width,
          centerWidth: centerBox.width,
          hudWidth: hudBox.width,
          mapRatio: mapBox.width / gridBox.width,
          hudRatio: hudBox.width / gridBox.width,
          leftRatio: leftBox.width / gridBox.width,
          panelsOverlap: leftBox.right > centerBox.left || centerBox.right > hudBox.left,
          railsShareRow: Math.abs(leftBox.top - hudBox.top) < 2,
          mapInBounds: mapBox.top >= gridBox.top && mapBox.bottom <= tickerBox.top + 1,
          pinCount: pins.length,
          pinsInBounds: pins.length > 0 && pins.every((pin) => {
            const box = pin.getBoundingClientRect()
            return box.left >= mapBox.left - 2 && box.right <= mapBox.right + 2 && box.top >= mapBox.top - 2 && box.bottom <= mapBox.bottom + 2
          }),
        }
      })
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight)
      // Anti-vacuous guards: the measured boxes must have non-zero geometry
      expect(metrics.gridWidth).toBeGreaterThan(0)
      expect(metrics.leftWidth).toBeGreaterThan(0)
      expect(metrics.centerWidth).toBeGreaterThan(0)
      expect(metrics.hudWidth).toBeGreaterThan(0)
      expect(metrics.pinCount).toBeGreaterThan(0)
      // Desktop 3-column layout: left rail (56px), center map (1fr), right HUD (280px)
      // At 1280px: left ~4.4%, hud ~21.9%, map ~73.8%
      // At 1600px: left ~3.5%, hud ~17.5%, map ~79.0%
      expect(metrics.leftRatio).toBeGreaterThan(0.02)
      expect(metrics.leftRatio).toBeLessThan(0.08)
      expect(metrics.mapRatio).toBeGreaterThan(0.65)
      expect(metrics.mapRatio).toBeLessThan(0.85)
      expect(metrics.hudRatio).toBeGreaterThan(0.15)
      expect(metrics.hudRatio).toBeLessThan(0.25)
      expect(metrics.panelsOverlap).toBe(false)
      expect(metrics.railsShareRow).toBe(true)
      expect(metrics.mapInBounds).toBe(true)
      expect(metrics.pinsInBounds).toBe(true)
      await page.screenshot({ path: `artifacts/${size.tag}/world.png` })
    })

    test('A-08 journal mode screenshot restores focus to its launcher', async ({ page }) => {
      await openGame(page)
      const launcher = page.getByRole('button', { name: /Open Journey journal|Mở Hành trang/i })
      await launcher.click()
      await expect(page.getByTestId('journal-screen')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/journal.png` })
      // The <kbd>Esc</kbd> inside the return button is aria-hidden, so it does
      // NOT contribute to the accessible name: '← Back to world Esc' matches
      // nothing (that exact-name locator is what stalled 30s before this rewrite).
      await page.getByRole('button', { name: /← Back to world|← Về thế giới/ }).click()
      await expect(page.getByTestId('journal-screen')).toBeHidden()
      await expect(launcher).toBeFocused()
      const metrics = await page.evaluate(() => ({
        scrollHeight: document.documentElement.scrollHeight,
        innerHeight: window.innerHeight,
      }))
      expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight)
    })

    test('A-08 combat mode screenshot', async ({ page }) => {
      await openGame(page, atLocation('misty_forest', 4, 1, (game) => ({ ...game, player: { ...game.player, stage: 1, qi: 30 } })))
      const fightBtn = page.locator('button[data-chip="fight"]')
      await expect(fightBtn).toBeVisible()
      await fightBtn.click()
      await expect(page.getByTestId('proto-combat')).toBeVisible()
      await expect(page.getByTestId('combat-attack')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/combat.png` })
    })

    test('A-08 route encounter screenshot', async ({ page }) => {
      await openGame(page, freshGame((game) => ({ ...game, flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true } })))
      await expect(page.getByTestId('route-encounter-screen')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/route-encounter.png` })
    })

    test('A-08 ending screenshot', async ({ page }) => {
      // FIXED (issue #40 Step 2): .ending-banner used to mount inside
      // .world-content (hidden via `display:none` at >=921px), so the terminal
      // ending state could not be seen on desktop at all. Lifted out into
      // .game-shell (GameScreen.tsx) so it renders above the proto layer at
      // every width. See test/issue40-terminal-surface.test.tsx for the
      // structural unit test that locks this placement.
      await openGame(page, ENDING)
      await expect(page.locator('.ending-banner')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/ending.png` })
    })

    test('A-08 death screenshot', async ({ page }) => {
      // FIXED (issue #40 Step 2): same class of defect as the ending banner —
      // DeathScreen used to sit inside .world-content, invisible at >=921px.
      // Now lifted out into .game-shell.
      await openGame(page, DEATH)
      // Strict: the DEATH fixture must render the death surface specifically —
      // an OR with .ending-banner would stay green if the mutual exclusion in
      // GameScreen.tsx ever inverted (reviewer-step2 LOW).
      await expect(page.locator('.death-screen')).toBeVisible()
      await page.screenshot({ path: `artifacts/${size.tag}/death.png` })
    })
  })
}
