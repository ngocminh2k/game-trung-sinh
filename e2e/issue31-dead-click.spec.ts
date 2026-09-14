// Issue #31 anti-regression: the legacy topbar's journal / language / exit buttons
// and the ProtoShell HUD must all stay clickable at desktop viewports (>=1100px),
// and the "open journal -> drink a pill" flow must actually reach the engine.
//
// Root cause was hit-testing, not visuals: .world-content is hidden at >=921px, so
// header.topbar (a static grid item) stretched to the full shell height, its
// flex-centred buttons landed mid-screen under the later-painting, absolutely
// positioned .proto-grid-main, and every click hit the HUD instead.
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
  const slot = { slotId: 1, savedAt: 1, session: { game: outOfCombatGame(), locale, chronicle: ['Issue 31.'] } }
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
async function blockerOf(page: Page, selector: string): Promise<string | null> {
  const target = page.locator(selector).first()
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

// Pre-fix CSS, re-injected after the app's own stylesheet so it wins on order.
const UNFIX = '.game-shell > header.topbar{position:static !important;z-index:auto !important;pointer-events:auto !important}'

for (const viewport of [{ width: 1280, height: 720 }, { width: 1100, height: 800 }]) {
  for (const locale of ['en', 'vi'] as Locale[]) {
    test(`shell buttons stay clickable at ${viewport.width}x${viewport.height} (${locale})`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openGame(page, locale)

      for (const sel of ['#journal-launcher', '[data-testid="game-exit-menu"]', 'header.topbar .language-toggle button',
        // The proto layer must not lose its own controls to the topbar fix either.
        '.proto-leftrail .tabs button[data-tab="items"]', '.proto-righthud .proto-bar.hp']) {
        await expectReachable(page, sel)
      }

      await page.screenshot({ path: `test-results/issue31-clickable-${viewport.width}-${locale}.png` })
    })
  }
}

for (const locale of ['en', 'vi'] as Locale[]) {
  test(`regression guard: without the fix the journal click is swallowed (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)
    await page.addStyleTag({ content: UNFIX })
    // Pre-fix, the centre pixel belongs to the proto HUD (e.g. DIV.tg-points).
    expect(await blockerOf(page, '#journal-launcher')).toMatch(/proto|tg-/)
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
