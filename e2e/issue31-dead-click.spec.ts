// Issue #31 anti-regression & RESIDUAL #31:
// 1. At desktop viewports (>=921px), exactly ONE topbar control set exists:
//    legacy header.topbar is hidden and its duplicated controls unmount into
//    ProtoShell's .proto-topbar (no floating legacy buttons over the HUD band,
//    no duplicate testids, no strict-mode dodging with .first()).
// 2. Below 921px, the legacy header.topbar remains active and carries the controls.
// 3. The "open journal -> drink pill -> exit to menu" flow reaches the engine.
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

function outOfCombatGame(): GameState {
  const game = applyAction(newGame('issue31-dead-click-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  expect(game.encounter).toBeNull()
  // Start hurt: pill_hp heals +25, which would clamp invisibly at full HP.
  return { ...game, player: { ...game.player, hp: 55 } }
}

async function openGame(page: Page, locale: Locale): Promise<void> {
  const slot = { slotId: 1, savedAt: Date.now(), session: { game: outOfCombatGame(), locale, chronicle: ['Issue 31.'] } }
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

// What covers the button's own centre pixel? null = the button itself is on top.
// Strict locator: NO .first() — duplicate matching nodes throw immediately.
async function blockerOf(page: Page, selector: string): Promise<string | null> {
  const target = page.locator(selector)
  await expect(target).toBeVisible()
  return target.evaluate((el) => {
    const r = el.getBoundingClientRect()
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    if (top !== null && (el === top || el.contains(top))) return null
    if (top === null) return 'nothing at that point'
    const name = (n: Element) => `${n.tagName}.${typeof n.className === 'string' ? n.className.trim().split(/\s+/)[0] : ''}`
    return `covered by <${name(top)}>`
  })
}

async function expectReachable(page: Page, selector: string): Promise<void> {
  expect(await blockerOf(page, selector), selector).toBeNull()
}

for (const viewport of [{ width: 1280, height: 720 }, { width: 1100, height: 800 }]) {
  for (const locale of ['en', 'vi'] as Locale[]) {
    test(`shell buttons stay clickable at ${viewport.width}x${viewport.height} (${locale})`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openGame(page, locale)

      // Exactly ONE topbar is visible; legacy topbar is hidden and empty
      await expect(page.locator('.game-shell > header.topbar')).toBeHidden()
      await expect(page.locator('.game-shell > header.topbar :is(button, .topbar-actions)')).toHaveCount(0)

      // Merged controls are unique, visible inside .proto-topbar, and clickable
      for (const sel of [
        '#journal-launcher',
        '[data-testid="game-exit-menu"]',
        '.proto-topbar .language-toggle button:nth-child(1)',
        '.proto-topbar .language-toggle button:nth-child(2)',
        // The proto layer must not lose its own controls to the topbar fix either.
        '.proto-leftrail .tabs button[data-tab="items"]',
        '.proto-righthud .proto-bar.hp',
      ]) {
        await expectReachable(page, sel)
      }

      await page.screenshot({ path: `test-results/issue31-clickable-${viewport.width}-${locale}.png` })
    })
  }
}

for (const locale of ['en', 'vi'] as Locale[]) {
  test(`residual guard: legacy buttons do not float at >=921px and active below (${locale})`, async ({ page }) => {
    // 1. Desktop (>=921px): legacy topbar retired, exactly ONE control set in .proto-topbar
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)

    await expect(page.locator('.game-shell > header.topbar')).toBeHidden()
    await expect(page.locator('.game-shell > header.topbar :is(button, .topbar-actions)')).toHaveCount(0)
    await expect(page.locator('#journal-launcher')).toHaveCount(1)
    await expect(page.locator('[data-testid="game-exit-menu"]')).toHaveCount(1)
    await expect(page.locator('.proto-topbar #journal-launcher')).toBeVisible()
    await expect(page.locator('.proto-topbar [data-testid="game-exit-menu"]')).toBeVisible()
    await expect(page.locator('.proto-topbar .language-toggle button')).toHaveCount(2)
    await expectReachable(page, '#journal-launcher')

    // 2. Narrow (<921px): legacy topbar active and carrying the controls
    await page.setViewportSize({ width: 900, height: 700 })
    await expect(page.locator('.game-shell > header.topbar')).toBeVisible()
    await expect(page.locator('.game-shell > header.topbar #journal-launcher')).toBeVisible()
    await expect(page.locator('.game-shell > header.topbar [data-testid="game-exit-menu"]')).toBeVisible()
    await expect(page.locator('.game-shell > header.topbar .language-toggle button')).toHaveCount(2)
    await expect(page.locator('.proto-topbar #journal-launcher')).toHaveCount(0)
    await expectReachable(page, 'header.topbar #journal-launcher')
  })

  test(`open journal -> drink pill -> exit to menu (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)

    await page.locator('#journal-launcher').click()
    const journal = page.getByTestId('journal-screen')
    await expect(journal).toBeVisible()
    await expectReachable(page, '#journal-screen .journal-return')
    await expectReachable(page, '#dock-tab-inventory')
    await page.locator('#dock-tab-inventory').click()

    const hp = page.locator('.proto-bar.hp .num')
    await expect(hp).toHaveText('55/100')

    const pillLabel = locale === 'vi' ? 'Viên hồi nguyên' : 'Restoration Pill'
    const useLabel = locale === 'vi' ? 'Dùng' : 'Use'
    await page.locator('#dock-panel-inventory .item-row').filter({ hasText: pillLabel })
      .getByRole('button', { name: useLabel, exact: true }).click()

    // use_item reached the engine: +25 HP and the single pill left the bag.
    await expect(hp).toHaveText('80/100')
    await expect(page.locator('#dock-panel-inventory .item-row').filter({ hasText: pillLabel })).toHaveCount(0)

    await page.locator('#journal-screen .journal-return').click()
    await expect(journal).toBeHidden()

    await expectReachable(page, '[data-testid="game-exit-menu"]')
    await page.locator('[data-testid="game-exit-menu"]').click()
    await expect(page.getByTestId('main-menu')).toBeVisible()
  })
}
