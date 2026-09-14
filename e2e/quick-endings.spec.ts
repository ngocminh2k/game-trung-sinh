import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const BASE_URL_OVERRIDE = 'http://127.0.0.1:5173'
const SHOTS_DIR = 'F:/game-trung-sinh/ending-shots'
const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function bootedGame(seed: string, update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame(seed), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game: GameState): Promise<void> {
  const session: GameSession = { game, locale: 'vi', chronicle: ['Quick endings run.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto(BASE_URL_OVERRIDE + '/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await page.waitForSelector('[data-testid="game-screen"]', { timeout: 15000 })
}

async function clickStoryChoice(page: Page, choiceLabel: string | RegExp): Promise<void> {
  const panelOpen = await page.getByTestId('narration-panel').isVisible().catch(() => false)
  const routeOpen = await page.getByTestId('route-encounter-screen').isVisible().catch(() => false)
  if (routeOpen) {
    if (panelOpen) await page.keyboard.press('Escape')
  } else if (!panelOpen) {
    try {
      await page.getByRole('button', { name: 'Open Journey journal' }).click({ timeout: 3000 })
      await page.getByRole('tab', { name: /People here/ }).click({ timeout: 3000 })
      await page.getByRole('button', { name: 'Talk' }).first().click({ timeout: 3000 })
    } catch (_) {}
  }
  await page.getByRole('button', { name: choiceLabel }).click({ timeout: 8000 })
}

test.describe.serial('Quick endings driver: capture banners + screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
  })

  test('Ending 1: Spring for an Enemy (mercy road)', async ({ page }) => {
    await openGame(page, bootedGame('q-1', (game) => ({
      ...game,
      rememberedNames: ['Hà', 'Ngô', 'Mai Hoa'],
      flags: { ...game.flags, story_scene: 'scene_ascension', story_mercy: 3, story_khoa_trusted: true },
    })))
    await clickStoryChoice(page, /give the choice|đưa quyết định/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `${SHOTS_DIR}/e1-spring-for-enemy.png`, fullPage: true })
    const text = (await banner.textContent() || '').trim()
    console.log(`[E1] banner: ${text}`)
    expect(text).toContain('Spring for an Enemy')
  })

  test('Ending 2: Rootless Star (truth road)', async ({ page }) => {
    await openGame(page, bootedGame('q-2', (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'scene_ascension', story_truth: 3 },
    })))
    await clickStoryChoice(page, /open the mirror|mở gương/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `${SHOTS_DIR}/e2-rootless-star.png`, fullPage: true })
    const text = (await banner.textContent() || '').trim()
    console.log(`[E2] banner: ${text}`)
    expect(text).toContain('Rootless Star')
  })

  test('Ending 3: Borrowed Face (power road)', async ({ page }) => {
    await openGame(page, bootedGame('q-3', (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'scene_ascension', story_power: 3 },
    })))
    await clickStoryChoice(page, /open the mirror|mở gương/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `${SHOTS_DIR}/e3-borrowed-face.png`, fullPage: true })
    const text = (await banner.textContent() || '').trim()
    console.log(`[E3] banner: ${text}`)
    expect(text).toContain('Borrowed Face')
  })

  test('Ending 4: Iron Lantern (default)', async ({ page }) => {
    await openGame(page, bootedGame('q-4', (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'scene_ascension' },
    })))
    await clickStoryChoice(page, /open the mirror|mở gương/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await page.screenshot({ path: `${SHOTS_DIR}/e4-iron-lantern.png`, fullPage: true })
    const text = (await banner.textContent() || '').trim()
    console.log(`[E4] banner: ${text}`)
    expect(text).toContain('Iron Lantern')
  })
})