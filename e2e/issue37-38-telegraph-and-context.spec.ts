// Issues #37 + #38 acceptance, played through the real UI.
//
// #37 — the player must see the entry tax BEFORE crossing, in every surface
// that matters (hover tooltip via title AND the screen-reader aria-label), and
// an out-of-tier fight must announce itself in the chronicle.
// #38 — reloading a save must leave an orientation line; the path tab must not
// stutter ("TThương nhân" through a screen reader); the chat modal must say
// Esc closes it.
//
// Fresh seed, deterministic day/weather — same fixture discipline as
// issue33-skill-tree-journey.spec.ts.
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

function forestEdgeGame(): GameState {
  // Post-prologue, standing in the village, one region-line away from
  // misty_forest (danger 1). savedAt = now so offline gains stay out of it.
  return applyAction(newGame('issue37-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
}

async function openGame(page: Page, game: GameState, chronicle: string[] = ['Issue 37/38.']): Promise<void> {
  const slot = { slotId: 1, savedAt: Date.now(), session: { game, locale: 'vi', chronicle } }
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

test.describe('issue #37 — danger is telegraphed before it bites', () => {
  test('the region-exit pin prices the entry tax (tooltip + aria)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openGame(page, forestEdgeGame())

    // Find the pin whose screen-reader label prices the entry tax. (ProtoShell
    // pins carry no title attribute — the visual surface is the pin-tip span.)
    const exitPins = page.locator('.proto-map button[data-pin-id]')
    const count = await exitPins.count()
    let risky = null
    for (let i = 0; i < count; i += 1) {
      const pin = exitPins.nth(i)
      const label = (await pin.getAttribute('aria-label')) ?? ''
      // Danger estimate format from travelRiskLabel: "⚠ bước vào −N..−M HP …"
      if (/bước vào −\d+\.\.−\d+ HP/.test(label)) {
        risky = pin
        break
      }
    }
    expect(risky, 'an exit/danger pin must carry the entry-damage estimate').not.toBeNull()
    // The pin's contract surfaces twice: screen reader (aria-label) and the
    // visual pin-tip (the dedicated risk span).
    await expect(risky!).toHaveAttribute('aria-label', /−\d+\.\.−\d+ HP/)
    await expect(risky!.locator('[data-testid^="pin-risk-"]')).toContainText(/−\d+\.\.−\d+ HP/)
  })

  test('crossing into danger charges the tax the estimate promised', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const game = forestEdgeGame()
    await openGame(page, game)

    // The reachable region-exit pin that prices an entry tax.
    const exitPins = page.locator('.proto-map button[data-pin-id]:not(.pin-unreachable)')
    const count = await exitPins.count()
    let target = null
    let targetLabel = ''
    for (let i = 0; i < count; i += 1) {
      const pin = exitPins.nth(i)
      const label = (await pin.getAttribute('aria-label')) ?? ''
      if (/bước vào −\d+\.\.−\d+ HP/.test(label)) { target = pin; targetLabel = label; break }
    }
    expect(target, 'a reachable exit pin must price the entry tax').not.toBeNull()

    const hpOf = async (): Promise<number> =>
      Number((await page.locator('.proto-bar.hp .num').first().innerText()).split('/')[0])

    const minGroup = /bước vào −(\d+)\.\.−\d+ HP/.exec(targetLabel)
    expect(minGroup).not.toBeNull()
    const predictedMin = Number(minGroup![1])
    const hpBefore = await hpOf()

    // One click walks the authored path; the entry hit is synchronous state.
    await target!.click()
    const hpAfter = await hpOf()
    expect(hpAfter).toBeLessThan(hpBefore)
    expect(hpBefore - hpAfter).toBeGreaterThanOrEqual(predictedMin)
    // And the chronicle says where it came from.
    await expect(page.locator('.proto-ticker').getByText(/sát thương/).first()).toBeVisible()
  })
})

test.describe('issue #38 — resuming must orient the player', () => {
  test('reload appends a "where you left off" chronicle line', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openGame(page, forestEdgeGame())

    // Reload → the auto-resume boot path (App.tsx session initializer).
    await page.reload()
    await page.getByRole('button', { name: /nhấn|press/i }).click()
    await expect(page.getByTestId('game-screen')).toBeVisible()
    const narration = page.getByTestId('narration-panel')
    if (await narration.count() > 0) await narration.locator('.story-close').click()

    await expect(page.getByText(/Hồi tưởng: Ngày \d+ · đang ở .* · tầng \d+/).first()).toBeVisible()
  })

  test('the path tab shows authored names with a decorative-only initial', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openGame(page, { ...forestEdgeGame(), techniques: { basic_staff_form: 1 } })

    await page.locator('.proto-leftrail button[data-tab="path"]').click()
    const rail = page.locator('.proto-leftrail .proto-npc-list')
    await expect(rail).toBeVisible()
    // Round-5 review: assert at ROW level, not just .proto-npc__name. The
    // avatar initial and the name are SEPARATE divs, so the name element can
    // never contain the "TThương nhân" stutter — a name-only loop was
    // self-satisfying. The row's whole text is where a screen reader (or any
    // future markup that nests the glyph inside the name) would concatenate.
    const rows = rail.locator('.proto-npc')
    const rowCount = await rows.count()
    expect(rowCount, 'the path tab must list the learned technique').toBeGreaterThan(0)
    for (let i = 0; i < rowCount; i += 1) {
      const rowText = (await rows.nth(i).innerText()).trim()
      // Avatar glyph is aria-hidden; if it ever leaked into the accessible
      // row text it would double the leading letter ("TThiết cơ bản").
      expect(rowText).not.toMatch(/(?:^|\s|·)(.)\1/)
    }
    const avatar = rail.locator('.proto-npc__avatar').first()
    await expect(avatar).toHaveAttribute('aria-hidden', 'true')
  })

  test('the chat close button shows the Esc hint it already honours', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await openGame(page, forestEdgeGame())

    await page.evaluate(() => (window as unknown as { __openChat: (id: string) => void }).__openChat('n_elder_meihua'))
    const modal = page.locator('[data-od-id="chat-modal"]')
    await expect(modal).toBeVisible()
    await expect(modal.locator('button.x kbd')).toHaveText('Esc')

    // And Escape really closes it (the hint must not lie).
    await page.keyboard.press('Escape')
    await expect(modal).toHaveCount(0)
  })
})
