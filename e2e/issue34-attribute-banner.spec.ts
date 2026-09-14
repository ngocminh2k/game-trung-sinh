// Issue #34 round 2 — the attribute banner must be REAL UI, not unstyled DOM.
//
// Two regressions are pinned here:
//   1. Hit-testing (same technique as e2e/issue31-dead-click.spec.ts): the
//      banner is a static grid item; the ProtoShell overlay (.proto-topbar at
//      z-index 30 + the absolutely-positioned .proto-grid-main) paints over the
//      viewport at EVERY width, so an unstyled banner's +1 buttons were
//      click-swallowed by the HUD. elementFromPoint at each button's centre
//      must resolve to the button itself at 1280x720 and 1100x800.
//   2. Anti-vacuous-green guard: re-injecting the pre-fix CSS (position:static)
//      MUST make the click hit something proto-owned again — proof the test
//      would have failed before screens.css got .attribute-banner rules.
//   3. A banner click actually allocates: ProtoShell's tetragrammaton readout
//      (.proto-tg, order charm/mind/body/luck) goes 3 -> 4 for body and the
//      .tg-points counter goes 2 -> 1.
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

// Post-prologue, out of combat (the #34 gate only arms outside encounters),
// with 2 points pending so the banner renders.
function gatedGame(): GameState {
  const game = applyAction(newGame('issue34-banner-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  expect(game.encounter).toBeNull()
  return { ...game, player: { ...game.player, pendingAttributePoints: 2 } }
}

async function openGame(page: Page, locale: Locale): Promise<void> {
  // savedAt must be NOW: a stale timestamp trips engine/offline.ts, which grants
  // 72h of capped breakthrough progress (+points) and would move the counters.
  const slot = { slotId: 1, savedAt: Date.now(), session: { game: gatedGame(), locale, chronicle: ['Issue 34.'] } }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
  await expect(page.getByTestId('attribute-banner')).toBeVisible()
}

// What covers the element's own centre pixel? null = it is on top. (issue31 twin)
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

// Pre-fix CSS (no .attribute-banner rules existed at all => static + z-index auto),
// re-injected after the app's own stylesheet so it wins on order.
const UNFIX = '.attribute-banner{position:static !important;z-index:auto !important}'

for (const viewport of [{ width: 1280, height: 720 }, { width: 1100, height: 800 }]) {
  for (const locale of ['en', 'vi'] as Locale[]) {
    test(`banner +1 buttons are hittable at ${viewport.width}x${viewport.height} (${locale})`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openGame(page, locale)

      for (const attr of ['body', 'mind', 'charm', 'luck']) {
        const sel = `[data-testid="attribute-banner-${attr}"]`
        expect(await blockerOf(page, sel), sel).toBeNull()
      }
      // Round 5: the escape-route link is HIDDEN at desktop widths. Its anchor
      // target (#attribute-allocation) lives inside .world-content, which
      // screens.css kills at >=921px when ProtoShell mounts — so the jump was
      // guaranteed to land on a display:none node, i.e. a dead link. The +1
      // buttons above are the only allocation control here.
      await expect(page.locator('.attribute-banner-link')).toBeHidden()

      await page.screenshot({ path: `test-results/issue34-banner-${viewport.width}-${locale}.png` })
    })
  }
}

// Is the centre pixel owned by a proto-layer element instead of the target?
// (The pre-fix blocker is e.g. DIV.grid-overlay inside .proto-map, so matching on
// class names alone is brittle — resolve the covering element's layer instead.)
async function coveredByProtoLayer(page: Page, selector: string): Promise<boolean> {
  return page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect()
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    if (top === null || top === el || el.contains(top)) return false
    return top.closest('.proto-grid-main, .proto-topbar, .proto-scene-main') !== null
  })
}

for (const locale of ['en', 'vi'] as Locale[]) {
  test(`regression guard: without the z-index fix the banner click is swallowed (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)
    expect(await coveredByProtoLayer(page, '[data-testid="attribute-banner-body"]')).toBe(false)
    await page.addStyleTag({ content: UNFIX })
    // Pre-fix, the centre pixel belongs to the proto HUD layer painted over it.
    expect(await coveredByProtoLayer(page, '[data-testid="attribute-banner-body"]')).toBe(true)
  })

  test(`clicking a banner +1 allocates a real point (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)

    // .proto-tg renders TG_STATS order charm, mind, body, luck -> index 2 = body.
    const bodyValue = page.locator('.proto-tg').nth(2).locator('.v')
    await expect(bodyValue).toHaveText('3')
    const points = page.locator('.tg-points')
    await expect(points).toContainText(locale === 'vi' ? 'Điểm chưa phân bổ: 2' : 'Unspent points: 2')

    await page.locator('[data-testid="attribute-banner-body"]').click()

    // Engine round-trip: one point paid, one attribute bought, banner re-counts.
    await expect(bodyValue).toHaveText('4')
    await expect(points).toContainText(locale === 'vi' ? 'Điểm chưa phân bổ: 1' : 'Unspent points: 1')
    await expect(page.getByTestId('attribute-banner')).toContainText(locale === 'vi' ? 'Phân bố 1 điểm' : 'Allocate 1 point before continuing')
  })
}
