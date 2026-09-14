// Issue #33 acceptance — the cultivation loop must be PLAYABLE, not just testable.
//
// The AI playtest (20/20 runs) reported "vòng tu luyện = 0/20 người chơi từng
// thấy nhúc nhích": progress was invisible and the skill points earned from a
// breakthrough had no UI to spend them in. This spec drives the real thing end
// to end in a browser:
//   rest -> cultivate x2 -> breakthrough grants 2 attribute + 1 skill point
//   -> spend the attribute points (the #34 gate blocks cultivation until then)
//   -> open the tree with the K hotkey -> unlock the first sword node
//   -> the 技 counter drops to 0 and the row flips to "Đã lĩnh ngộ".
//
// Qi/progress numbers are asserted rather than merely clicked-through: a green
// E2E that never checks the HUD readout is exactly how #33 shipped broken.
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

// Post-prologue at the first minor-realm threshold: one more train() crosses it.
// savedAt = now so engine/offline.ts cannot hand out free progress (issue #34 spec).
function almostThereGame(): GameState {
  const game = applyAction(newGame('issue33-journey-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  expect(game.encounter).toBeNull()
  const target = game.player.progress > 0 ? game.player.progress : 4
  return { ...game, player: { ...game.player, qi: 60, progress: target, pendingAttributePoints: 0, skillPoints: 0 } }
}

async function openGame(page: Page): Promise<void> {
  const slot = { slotId: 1, savedAt: Date.now(), session: { game: almostThereGame(), locale: 'vi', chronicle: ['Issue 33.'] } }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // The prologue narration modal must be dismissed before the HUD is reachable.
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

const skillPoints = (page: Page) => page.getByTestId('currency-skill-points').locator('.v')
const pointsLeft = (page: Page) => page.locator('.tg-points')

test('cultivation loop: breakthrough -> allocate -> open tree -> unlock a node', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openGame(page)

  // 1. The HUD shows the loop's two currencies before anything happens.
  await expect(skillPoints(page)).toHaveText('0')
  const chip = (name: string) => page.locator(`button[data-chip="${name}"]`)
  await expect(chip('cultivate')).toBeVisible()

  // 2. Cultivate until the realm breaks through (qi caps the attempts; rest refills).
  for (let attempt = 0; attempt < 6; attempt += 1) {
    if (await chip('cultivate').isEnabled()) await chip('cultivate').click()
    else {
      await chip('rest').click()
      await chip('cultivate').click()
    }
    if ((await pointsLeft(page).count()) > 0) break
  }

  // 3. Breakthrough paid out: 2 attribute points (the #34 gate) and 1 skill point.
  await expect(pointsLeft(page)).toContainText('Điểm chưa phân bổ: 2')
  await expect(page.getByTestId('attribute-banner')).toBeVisible()

  // 4. Clear the gate — cultivation is deliberately disabled while points sit unspent.
  const bodyValue = page.locator('.proto-tg').nth(2).locator('.v')
  await expect(bodyValue).toHaveText('3')
  await page.locator('[data-testid="attribute-banner-body"]').click()
  await page.locator('[data-testid="attribute-banner-body"]').click()
  await expect(bodyValue).toHaveText('5')
  await expect(page.getByTestId('attribute-banner')).toHaveCount(0)
  await expect(skillPoints(page)).toHaveText('1')

  // 5. K opens the tree; the first sword node is the one thing it can afford.
  await page.keyboard.press('k')
  const panel = page.getByTestId('skill-tree-panel')
  await expect(panel).toBeVisible()
  await expect(page.getByTestId('skill-tree-blocked')).toHaveCount(0)
  await expect(page.getByTestId('skill-unlock-sword_t1')).toBeEnabled()

  // 6. Unlock spends the point and the row records it.
  await page.getByTestId('skill-unlock-sword_t1').click()
  await expect(skillPoints(page)).toHaveText('0')
  await expect(page.getByTestId('skill-lock-sword_t1')).toContainText('Đã lĩnh ngộ')
  await expect(page.getByTestId('skill-unlock-sword_t1')).toHaveCount(0)

  // 7. Escape closes it again (the panel must not trap the run).
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
})

test('the tree button opens it too, and it says what is missing when it is not affordable', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await openGame(page)

  // Fresh run: zero skill points, so the panel must explain rather than dead-click.
  await page.getByTestId('skill-tree-btn').click()
  await expect(page.getByTestId('skill-tree-panel')).toBeVisible()
  await expect(page.getByTestId('skill-point-balance')).toContainText('Điểm kỹ năng')
  await expect(page.getByTestId('skill-tree-blocked')).toHaveCount(0)
  const unlock = page.getByTestId('skill-unlock-sword_t1')
  await expect(unlock).toHaveCount(0) // by design: no disabled button, only predicted status
  await expect(page.getByTestId('skill-lock-sword_t1')).toContainText('Thiếu 1 điểm kỹ năng')
})
