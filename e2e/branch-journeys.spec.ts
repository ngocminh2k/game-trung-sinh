import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function bootedGame(seed: string, update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame(seed), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game: GameState): Promise<void> {
  const session: GameSession = { game, locale: 'en', chronicle: ['Branch journey save.'] }
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

async function clickStoryChoice(page: Page, choiceLabel: string | RegExp): Promise<void> {
  // Mirrors fresh-endings clickChoice: the story panel is transient; a route
  // encounter owns the screen (and may leave a backdrop over the journal), so
  // story choices there are clicked after closing any open panel.
  const panelOpen = await page.getByTestId('narration-panel').isVisible().catch(() => false)
  const routeOpen = await page.getByTestId('route-encounter-screen').isVisible().catch(() => false)
  if (routeOpen) {
    if (panelOpen) await page.keyboard.press('Escape')
  } else if (!panelOpen) {
    await page.getByRole('button', { name: 'Open Journey journal' }).click()
    await page.getByRole('tab', { name: /People here/ }).click()
    await page.getByRole('button', { name: 'Talk' }).first().click()
  }
  await page.getByRole('button', { name: choiceLabel }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

test.describe('T13 branch journeys: every road reaches an ending screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
  })

  test('mercy road: share_last_page lands on Spring for an Enemy with its epilogue', async ({ page }) => {
    await openGame(page, bootedGame('branch-mercy', (game) => ({
      ...game,
      rememberedNames: ['Hà', 'Ngô', 'Mai Hoa'],
      flags: { ...game.flags, story_scene: 'last_page', story_mercy: 3, story_khoa_trusted: true },
    })))
    await clickStoryChoice(page, /give the choice/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await expect(banner).toContainText('Spring for an Enemy')
    // The mercy epilogue sublayer renders under the banner.
    await expect(page.locator('.ending-epilogue')).toBeVisible()
    const epilogue = await page.locator('.ending-epilogue').textContent() || ''
    expect(epilogue.trim().length).toBeGreaterThan(0)
  })

  test('path road: open_last_page with truth lands on Rootless Star', async ({ page }) => {
    await openGame(page, bootedGame('branch-path', (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'last_page', story_truth: 3 },
    })))
    await clickStoryChoice(page, /open the mirror/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await expect(banner).toContainText('Rootless Star')
  })

  test('blade road: open_last_page with power lands on Borrowed Face', async ({ page }) => {
    await openGame(page, bootedGame('branch-blade', (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'last_page', story_power: 3 },
    })))
    await clickStoryChoice(page, /open the mirror/i)
    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await expect(banner).toContainText('Borrowed Face')
  })

  test('rootless road: refusal silences the System all the way to the ending', async ({ page }) => {
    let game = applyAction(newGame('branch-rootless'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
    game = applyAction(game, { kind: 'story_choice', choiceId: 'refuse_all' }).state
    await openGame(page, game)

    // Canon §3: no System panel, no System notifications anywhere.
    await expect(page.getByTestId('system-panel')).toHaveCount(0)
    await expect(page.getByTestId('system-feed')).toHaveCount(0)
    await expect(page.getByText(/【Hệ Thống】|【System】/)).toHaveCount(0)

    // The truth journey still plays out without any System voice.
    await clickStoryChoice(page, /hide the pin|giấu trâm/i)
    await expect(page.getByTestId('system-panel')).toHaveCount(0)
    await clickStoryChoice(page, /sit with ngo|ngồi với ngô/i)

    await page.keyboard.press('Escape')
    for (const key of ['ArrowLeft', 'ArrowLeft', 'ArrowRight']) await page.keyboard.press(key)
    await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // The route encounter supplies proof; its authored scene advances the story.
    await clickStoryChoice(page, /copy the eighth name|chép tên thứ tám/i)
    await clickStoryChoice(page, /copy all seven names|chép bảy cái tên/i)
    await clickStoryChoice(page, /record ha|chép lời hà/i)
    await expect(page.getByTestId('game-screen')).toBeVisible()

    // Sect trial: expose_vo — mirror: confess — last page: open.
    await clickStoryChoice(page, /read ha|đưa lời hà/i)
    await clickStoryChoice(page, /tell khoa|nói sự thật/i)
    await clickStoryChoice(page, /open the mirror|mở gương/i)

    const banner = page.locator('.ending-banner')
    await expect(banner).toBeVisible({ timeout: 10000 })
    await expect(banner).toContainText('Rootless Star')
    await expect(page.getByTestId('system-panel')).toHaveCount(0)
    await expect(page.getByTestId('system-feed')).toHaveCount(0)
  })
})
