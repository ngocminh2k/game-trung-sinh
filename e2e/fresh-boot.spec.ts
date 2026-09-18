// E2E baseline: deterministic ?fresh=1 boot flag.
// App.tsx auto-resumes when an active slot is present in storage, causing
// menu-reaching specs to stall ~30s on loading screens. Visiting `/?fresh=1`
// lands on the main menu deterministically even when an active slot exists,
// leaving the saved slot intact so a manual Load Game still picks it up.
import { expect, test } from '@playwright/test'
import { applyAction, newGame, type GameState } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

function activeForestGame(): GameState {
  return applyAction(newGame('fresh-boot-e2e-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
}

test.describe('E2E BASELINE boot path (?fresh=1)', () => {
  test('reaches the main menu deterministically despite an injected active slot', async ({ page }) => {
    const game = activeForestGame()
    const slot = { slotId: 1, savedAt: Date.now(), session: { game, locale: 'vi', chronicle: ['Bảo lưu kiếp trước.'] } }

    // Inject an active slot — mirrors the state that previously caused menu specs to stall.
    await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
      window.localStorage.setItem(slotsKey, value)
      window.localStorage.setItem(activeSlotKey, '1')
    }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })

    // Visiting with ?fresh=1 must bypass auto-resume and land straight on the menu.
    await page.goto('/?fresh=1')

    const menu = page.getByTestId('main-menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('heading', { level: 1 })).toContainText(/Phế Căn Ký|Broken Root/)

    // Slot and active marker were preserved in storage.
    const storageState = await page.evaluate(({ slotsKey, activeSlotKey }) => ({
      hasSlots: window.localStorage.getItem(slotsKey) !== null,
      activeSlot: window.localStorage.getItem(activeSlotKey),
    }), { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY })
    expect(storageState.hasSlots).toBe(true)
    expect(storageState.activeSlot).toBe('1')

    // Manual Load Game still reaches the run.
    await page.getByTestId('menu-load-game').click()
    await expect(page.getByTestId('save-slots-screen')).toBeVisible()
    await page.getByTestId('save-slot-1').click()
    await page.getByRole('button', { name: /nhấn|press/i }).click()
    await expect(page.getByTestId('game-screen')).toBeVisible()
  })

  test('without ?fresh=1 the injected active slot auto-resumes into the run', async ({ page }) => {
    const game = activeForestGame()
    const slot = { slotId: 1, savedAt: Date.now(), session: { game, locale: 'vi', chronicle: ['Bảo lưu kiếp trước.'] } }

    await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
      window.localStorage.setItem(slotsKey, value)
      window.localStorage.setItem(activeSlotKey, '1')
    }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })

    // Plain root visit: boots into loading/run, menu is bypassed.
    await page.goto('/')
    await expect(page.getByTestId('main-menu')).toHaveCount(0)
    await page.getByRole('button', { name: /nhấn|press/i }).click()
    await expect(page.getByTestId('game-screen')).toBeVisible()
  })
})
