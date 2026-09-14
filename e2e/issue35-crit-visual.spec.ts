// Issue #35 anti-regression: a combat_crit chronicle line must render with a
// visual signal that differs from a plain combat_hit line by MORE than colour
// alone (repo a11y rule + issue AC): distinct text colour, heavier font-weight,
// and a ::before glyph prefix. Verified in both locales at both desktop
// viewports.
//
// The engine emits COMBAT_CRIT (reducer.ts:1196) which narrator.ts turns into a
// visible "CRITICAL STRIKE!" / "ĐỘNH CHÍ MẠNG!" line, and panels.tsx maps the
// `combat_crit` kind to the `is-crit` class. Crit RNG cannot be steered to fire
// on command, so (as in issue31) the run is seeded directly from localStorage
// with an index-aligned chronicleKinds carrying a crit + a hit line, then we
// assert the computed style of the two lines actually differs.
import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

// Newest two lines: a crit (last) and a plain hit (second-to-last), with kinds
// aligned by absolute index (chronicle.length - 2 and - 1).
function critGame(): GameState {
  return newGame('issue35-crit-seed')
}

async function openGame(page: Page, locale: Locale): Promise<void> {
  const slot = {
    slotId: 1,
    savedAt: 1,
    session: {
      game: critGame(),
      locale,
      chronicle: [
        locale === 'vi' ? 'Súc vật bị thương, 8 sát thương.' : 'The beast reels, 8 damage.',
        locale === 'vi' ? 'ĐỘNH CHÍ MẠNG! 42 sát thương chí mạng!' : 'CRITICAL STRIKE! 42 critical damage!',
      ],
      chronicleKinds: ['combat_hit', 'combat_crit'],
    },
  }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
  // The chronicle feed sits inside the journal overlay's dock, hidden until the
  // journal is opened (same desktop geometry issue31 documents). Then activate
  // its tab — the feed is only mounted while the chronicle tab is active.
  await page.locator('#journal-launcher').click()
  await expect(page.getByTestId('journal-screen')).toBeVisible()
  // ponytail: at <=1200px .dock-tabs wraps to 3 columns and the fixed journal
  // overlay clips the 4th (chronicle) tab below the viewport, so Playwright's
  // hit-test click (even forced) cannot land — a layout quirk out of #35 scope.
  // Activating the tab is setup only (real clickability is issue31's concern);
  // dispatch it directly so getComputedStyle on the line can be read at both
  // viewports.
  await page.locator('#dock-tab-chronicle').evaluate((el) => (el as HTMLElement).click())
  await expect(page.getByTestId('chronicle-panel')).toBeVisible()
}

type LineStyle = { color: string; fontWeight: string; beforeContent: string; className: string }

async function styleOf(page: Page, kind: string): Promise<LineStyle> {
  const li = page.locator(`.chronicle li[data-kind="${kind}"]`).first()
  await expect(li).toBeVisible()
  return li.evaluate((el) => {
    const s = getComputedStyle(el)
    const before = getComputedStyle(el, '::before')
    return {
      color: s.color,
      fontWeight: s.fontWeight,
      beforeContent: before.content,
      className: el.className,
    }
  })
}

for (const viewport of [{ width: 1280, height: 720 }, { width: 1100, height: 800 }]) {
  for (const locale of ['vi', 'en'] as Locale[]) {
    test(`crit line is visually distinct from a hit (${viewport.width}x${viewport.height}, ${locale})`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await openGame(page, locale)

      const crit = await styleOf(page, 'combat_crit')
      const hit = await styleOf(page, 'combat_hit')

      // The crit line carries its own class; the hit line does not.
      expect(crit.className).toContain('is-crit')
      expect(hit.className).not.toContain('is-crit')

      // Distinct by MORE than colour: a non-empty ::before glyph prefix...
      expect(crit.beforeContent, 'crit ::before glyph').toMatch(/["']?✦/)
      expect(hit.beforeContent, 'hit has no crit glyph').not.toMatch(/✦/)
      // ...and a heavier weight than a plain hit.
      expect(Number(crit.fontWeight)).toBeGreaterThan(Number(hit.fontWeight))
      // ...plus a different colour as a third (redundant, not sole) channel.
      expect(crit.color).not.toBe(hit.color)

      await page.screenshot({ path: `test-results/issue35-crit-${viewport.width}-${locale}.png` })
    })
  }
}

// The crit WORD must be legible in the narration text in both locales — the
// whole complaint in #35 was "no playtester ever saw the word crit".
for (const locale of ['vi', 'en'] as Locale[]) {
  test(`crit line text names the crit in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await openGame(page, locale)
    const text = await page.locator('.chronicle li[data-kind="combat_crit"]').first().innerText()
    expect(text.toLowerCase()).toMatch(locale === 'vi' ? /chí mạng/ : /critical/)
  })
}
